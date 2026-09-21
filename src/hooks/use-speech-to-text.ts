import { useState, useRef, useCallback, useEffect } from "react";

interface UseSTTReturn {
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  supported: boolean;
}

/**
 * Stable speech-to-text hook.
 * - Keeps one recognition instance alive instead of recreating it on every start
 * - Auto-restarts when the browser ends the session early (silence timeouts)
 *   so the mic does not visibly flicker on/off during a voice conversation
 * - Ignores harmless errors (no-speech, aborted)
 */
export function useSpeechToText(onResult?: (text: string) => void): UseSTTReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const wantListeningRef = useRef(false);
  const runningRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const supported = !!SpeechRecognitionAPI;

  const getRecognition = useCallback(() => {
    if (!SpeechRecognitionAPI) return null;
    if (recognitionRef.current) return recognitionRef.current;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setTranscript(final || interim);
      const clean = final.trim();
      if (clean) onResultRef.current?.(clean);
    };

    recognition.onend = () => {
      runningRef.current = false;
      if (wantListeningRef.current) {
        // Browser ended the session (silence timeout) — restart quietly.
        if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = window.setTimeout(() => {
          if (!wantListeningRef.current || runningRef.current) return;
          try {
            recognition.start();
            runningRef.current = true;
          } catch {
            /* already starting */
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === "no-speech" || err === "aborted") return; // onend handles restart
      wantListeningRef.current = false;
      runningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [SpeechRecognitionAPI]);

  const start = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) return;
    wantListeningRef.current = true;
    setIsListening(true);
    setTranscript("");
    if (runningRef.current) return;
    try {
      recognition.start();
      runningRef.current = true;
    } catch {
      /* start called while already running */
    }
  }, [getRecognition]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.abort?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { isListening, transcript, start, stop, supported };
}

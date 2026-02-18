import { useState, useRef, useCallback, useEffect } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  supported: boolean;
}

export function useTextToSpeech(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      stop();

      // Strip markdown formatting for cleaner speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/---/g, "")
        .replace(/💡|✅|📝|👋|😊|🎉|👏/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.1;

      // Try to pick a female English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Female") ||
            v.name.includes("Samantha") ||
            v.name.includes("Google US English") ||
            v.name.includes("Microsoft Zira"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, stop]
  );

  // Preload voices
  useEffect(() => {
    if (supported) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [supported]);

  return { isSpeaking, speak, stop, supported };
}

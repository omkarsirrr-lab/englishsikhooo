import { useState, useRef, useCallback, useEffect } from "react";

interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string, onEnd?: () => void) => void;
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
    (text: string, onEnd?: () => void) => {
      if (!supported) {
        onEnd?.();
        return;
      }
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

      if (!cleanText) {
        onEnd?.();
        return;
      }

      // Detect script to pick a sensible language tag (default Indian English)
      const isDevanagari = /[\u0900-\u097F]/.test(cleanText);
      const targetLang = isDevanagari ? "mr-IN" : "en-IN";

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      // Strictly prefer Indian voices for an authentic Indian accent
      const voices = window.speechSynthesis.getVoices();
      const indianNameHints = ["Indian", "India", "Heera", "Ravi", "Rishi", "Aditi", "Veena", "Lekha", "Neerja", "Priya", "Kalpana", "Hemant", "Madhur"];
      const isIndianVoice = (v: SpeechSynthesisVoice) =>
        v.lang === targetLang ||
        v.lang === "en-IN" ||
        v.lang === "hi-IN" ||
        v.lang === "mr-IN" ||
        indianNameHints.some((h) => v.name.includes(h));

      const preferred =
        // Exact language + Indian name (best match)
        voices.find((v) => v.lang === targetLang && indianNameHints.some((h) => v.name.includes(h))) ||
        // Exact language match
        voices.find((v) => v.lang === targetLang) ||
        // For Marathi text, fall back to Hindi voice (closest Indian accent)
        (isDevanagari ? voices.find((v) => v.lang === "hi-IN") : undefined) ||
        // For English text, fall back to en-IN
        (!isDevanagari ? voices.find((v) => v.lang === "en-IN") : undefined) ||
        // Any voice that sounds Indian by name
        voices.find(isIndianVoice);
      if (preferred) utterance.voice = preferred;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = finish;
      utterance.onerror = finish;

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

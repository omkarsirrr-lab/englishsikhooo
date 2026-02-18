import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, MessageCircle, Volume2, VolumeX } from "lucide-react";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import VoiceWaveform from "@/components/VoiceWaveform";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { streamChat, type Message } from "@/lib/chat";
import { toast } from "sonner";

type Expression = "idle" | "speaking" | "happy" | "thinking" | "encouraging";

const VoiceChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [expression, setExpression] = useState<Expression>("idle");
  const [subtitle, setSubtitle] = useState("");
  const [userSubtitle, setUserSubtitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const hasGreeted = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  const { isSpeaking, speak, stop: stopSpeech } = useTextToSpeech();

  // Detect expression from AI text
  const detectExpression = useCallback((text: string): Expression => {
    const lower = text.toLowerCase();
    if (lower.includes("great") || lower.includes("awesome") || lower.includes("nice") || lower.includes("🎉") || lower.includes("👏"))
      return "happy";
    if (lower.includes("tip") || lower.includes("correct") || lower.includes("mistake") || lower.includes("💡"))
      return "thinking";
    if (lower.includes("try") || lower.includes("keep") || lower.includes("encourage") || lower.includes("don't worry"))
      return "encouraging";
    return "speaking";
  }, []);

  // Handle AI response
  const sendToAI = useCallback(
    async (allMessages: Message[]) => {
      setIsProcessing(true);
      setExpression("thinking");
      let assistantSoFar = "";

      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setSubtitle(assistantSoFar);
          setExpression(detectExpression(assistantSoFar));
        },
        onDone: () => {
          const assistantMsg: Message = { role: "assistant", content: assistantSoFar };
          const updated = [...allMessages, assistantMsg];
          setMessages(updated);
          messagesRef.current = updated;
          setIsProcessing(false);

          if (ttsEnabled && assistantSoFar) {
            setExpression("speaking");
            speak(assistantSoFar);
          } else {
            setTimeout(() => setExpression("idle"), 2000);
          }
        },
        onError: (err) => {
          toast.error(err);
          setIsProcessing(false);
          setExpression("idle");
        },
      });
    },
    [detectExpression, speak, ttsEnabled]
  );

  // Handle voice result
  const handleVoiceResult = useCallback(
    (text: string) => {
      if (!text.trim() || isProcessing) return;
      setUserSubtitle(text);
      const userMsg: Message = { role: "user", content: text };
      const updated = [...messagesRef.current, userMsg];
      setMessages(updated);
      messagesRef.current = updated;
      sendToAI(updated);
    },
    [isProcessing, sendToAI]
  );

  const { isListening, transcript, start: startListening, stop: stopListening, supported: sttSupported } =
    useSpeechToText(handleVoiceResult);

  // Update user subtitle while listening
  useEffect(() => {
    if (transcript) setUserSubtitle(transcript);
  }, [transcript]);

  // Reset expression when TTS ends
  useEffect(() => {
    if (!isSpeaking && expression === "speaking") {
      setExpression("idle");
    }
  }, [isSpeaking, expression]);

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    sendToAI([]);
  }, [sendToAI]);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeech();
      setUserSubtitle("");
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-display font-bold text-base">Voice Mode</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title={ttsEnabled ? "Mute AI voice" : "Unmute AI voice"}
          >
            {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} title="Switch to text chat">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-6">
        {/* Avatar */}
        <AnimatedAvatar expression={expression} />

        {/* Subtitles */}
        <div className="w-full max-w-md space-y-3 text-center min-h-[120px]">
          {/* AI subtitle */}
          {subtitle && (
            <div className="bg-buddy text-buddy-foreground rounded-2xl px-4 py-3 text-sm leading-relaxed max-h-32 overflow-y-auto">
              <p className="font-medium text-xs text-muted-foreground mb-1">Sam</p>
              {subtitle.length > 200 ? subtitle.slice(-200) + "..." : subtitle}
            </div>
          )}

          {/* User subtitle */}
          {userSubtitle && (
            <div className="bg-user-bubble text-user-bubble-foreground rounded-2xl px-4 py-3 text-sm">
              <p className="font-medium text-xs opacity-80 mb-1">You</p>
              {userSubtitle}
            </div>
          )}
        </div>

        {/* Voice waveform */}
        <VoiceWaveform active={isListening} />
      </div>

      {/* Mic button */}
      <div className="flex justify-center pb-8 pt-2">
        {sttSupported ? (
          <button
            onClick={toggleMic}
            disabled={isProcessing}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isListening
                ? "bg-destructive text-destructive-foreground scale-110 ring-4 ring-destructive/30"
                : "bg-primary text-primary-foreground hover:scale-105"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
            )}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Voice input not supported in this browser. Try Chrome.
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;

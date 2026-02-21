import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff, MessageCircle, Volume2, VolumeX, Square } from "lucide-react";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import VoiceWaveform from "@/components/VoiceWaveform";
import PerformanceSummary, { type SessionSummary } from "@/components/PerformanceSummary";
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
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const hasGreeted = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  const { isSpeaking, speak, stop: stopSpeech } = useTextToSpeech();

  const detectExpression = useCallback((text: string): Expression => {
    const lower = text.toLowerCase();
    if (lower.includes("great") || lower.includes("awesome") || lower.includes("nice") || lower.includes("🎉") || lower.includes("👏"))
      return "happy";
    if (lower.includes("accha") || lower.includes("hmm") || lower.includes("interesting"))
      return "thinking";
    if (lower.includes("try") || lower.includes("keep") || lower.includes("encourage") || lower.includes("don't worry"))
      return "encouraging";
    return "speaking";
  }, []);

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

  useEffect(() => {
    if (transcript) setUserSubtitle(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!isSpeaking && expression === "speaking") {
      setExpression("idle");
    }
  }, [isSpeaking, expression]);

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    setSessionStartTime(Date.now());
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

  // End session and generate summary
  const handleEndTalking = async () => {
    stopListening();
    stopSpeech();
    setIsGeneratingSummary(true);

    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    const userMessages = messagesRef.current.filter((m) => m.role === "user");

    if (userMessages.length === 0) {
      toast.error("You haven't said anything yet! Try speaking first.");
      setIsGeneratingSummary(false);
      return;
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: messagesRef.current, duration_seconds: duration }),
        }
      );

      if (!resp.ok) {
        throw new Error("Failed to generate summary");
      }

      const data: SessionSummary = await resp.json();
      setSummary(data);
    } catch {
      toast.error("Could not generate summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleNewSession = (topic?: string) => {
    setSummary(null);
    setMessages([]);
    messagesRef.current = [];
    setSubtitle("");
    setUserSubtitle("");
    setExpression("idle");
    setSessionStartTime(Date.now());
    hasGreeted.current = false;

    setTimeout(() => {
      hasGreeted.current = true;
      if (topic) {
        // Start with a user message about the topic so AI responds on-topic
        const userMsg: Message = { role: "user", content: topic };
        messagesRef.current = [userMsg];
        setMessages([userMsg]);
        setUserSubtitle(topic);
        sendToAI([userMsg]);
      } else {
        sendToAI([]);
      }
    }, 100);
  };

  const handlePracticeQuestion = (question: string) => {
    handleNewSession(question);
  };

  // Show summary screen
  if (summary) {
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    return (
      <PerformanceSummary
        summary={summary}
        duration={duration}
        onBack={() => navigate("/")}
        onNewSession={() => handleNewSession()}
        onPracticeQuestion={handlePracticeQuestion}
      />
    );
  }

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
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-6">
        <AnimatedAvatar expression={expression} />

        {/* Loading overlay */}
        {isGeneratingSummary && (
          <div className="text-center space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Analyzing your session...</p>
          </div>
        )}

        {/* Subtitles */}
        {!isGeneratingSummary && (
          <div className="w-full max-w-md space-y-3 text-center min-h-[120px]">
            {subtitle && (
              <div className="bg-buddy text-buddy-foreground rounded-2xl px-4 py-3 text-sm leading-relaxed max-h-32 overflow-y-auto">
                <p className="font-medium text-xs text-muted-foreground mb-1">Velloza</p>
                {subtitle.length > 200 ? subtitle.slice(-200) + "..." : subtitle}
              </div>
            )}
            {userSubtitle && (
              <div className="bg-user-bubble text-user-bubble-foreground rounded-2xl px-4 py-3 text-sm">
                <p className="font-medium text-xs opacity-80 mb-1">You</p>
                {userSubtitle}
              </div>
            )}
          </div>
        )}

        <VoiceWaveform active={isListening} />
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center items-center gap-4 pb-8 pt-2">
        {sttSupported ? (
          <>
            <button
              onClick={toggleMic}
              disabled={isProcessing || isGeneratingSummary}
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

            {/* End Talking button */}
            {messagesRef.current.some((m) => m.role === "user") && (
              <button
                onClick={handleEndTalking}
                disabled={isProcessing || isGeneratingSummary}
                className="h-14 px-5 rounded-full flex items-center gap-2 bg-card border-2 border-destructive/50 text-destructive font-display font-bold text-sm transition-all hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="h-4 w-4" />
                End Talking
              </button>
            )}
          </>
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

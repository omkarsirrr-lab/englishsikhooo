import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Headphones } from "lucide-react";
import { streamChat, type Message } from "@/lib/chat";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const Coach = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);

  const { speak, stop: stopSpeak, isSpeaking } = useTextToSpeech();
  const { isListening, start, stop, supported: sttSupported } = useSpeechToText(
    (text) => {
      if (voiceModeRef.current) {
        // Auto-send in voice mode
        const updated = [...messagesRef.current, { role: "user" as const, content: text }];
        setMessages(updated);
        messagesRef.current = updated;
        setInput("");
        send(updated);
      } else {
        setInput((prev) => (prev ? prev + " " + text : text));
      }
    }
  );

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  const send = useCallback(
    async (allMessages: Message[]) => {
      setIsProcessing(true);
      setStreaming("");
      let assistantSoFar = "";
      await streamChat({
        messages: allMessages,
        mode: "coach",
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setStreaming(assistantSoFar);
        },
        onDone: () => {
          const updated = [...allMessages, { role: "assistant" as const, content: assistantSoFar }];
          setMessages(updated);
          messagesRef.current = updated;
          setStreaming("");
          setIsProcessing(false);
          if (voiceModeRef.current && assistantSoFar) {
            // Speak only the conversational parts: prefer Native Speaker, then strip markdown
            const native = assistantSoFar.match(/\*\*Native Speaker Version:\*\*\s*([^\n]+)/i)?.[1]
              ?.replace(/^["']|["']$/g, "");
            const nextQ = assistantSoFar.match(/\*\*Next Question:\*\*\s*([^\n]+)/i)?.[1];
            const toSpeak = native && nextQ ? `${native}. Next question: ${nextQ}` : assistantSoFar;
            speak(toSpeak);
            // Auto-restart listening after speaking ends
            setTimeout(() => {
              if (voiceModeRef.current && !isListening) start();
            }, 600);
          }
        },
        onError: (err) => {
          toast.error(err);
          setIsProcessing(false);
          setStreaming("");
        },
      });
    },
    []
  );

  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    send([]);
  }, [send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isProcessing) return;
    stopSpeak();
    const updated = [...messagesRef.current, { role: "user" as const, content: text }];
    setMessages(updated);
    messagesRef.current = updated;
    setInput("");
    if (isListening) stop();
    send(updated);
  };

  const toggleMic = () => {
    if (isListening) stop();
    else {
      stopSpeak();
      start();
    }
  };

  const toggleVoiceMode = () => {
    const next = !voiceMode;
    setVoiceMode(next);
    if (!next) {
      stop();
      stopSpeak();
    } else {
      stopSpeak();
      if (!isListening) start();
    }
  };

  const speakSentence = (text: string) => {
    stopSpeak();
    speak(text);
  };

  // Extract "Practice this:" sentence from latest assistant message for the speak-aloud button
  const extractPractice = (content: string): string | null => {
    const m = content.match(/\*\*Practice this:\*\*\s*([^\n]+)/i);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  };
  const extractNative = (content: string): string | null => {
    const m = content.match(/\*\*Native Speaker Version:\*\*\s*([^\n]+)/i);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-display font-bold text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Speaking Coach
            </h2>
            <p className="text-[10px] text-muted-foreground">Think → Attempt → Learn → Improve</p>
          </div>
        </div>
        <Button
          variant={voiceMode ? "default" : "secondary"}
          size="sm"
          onClick={toggleVoiceMode}
          disabled={!sttSupported}
          className="h-9 gap-1.5"
          title={voiceMode ? "Exit voice mode" : "Start voice mode"}
        >
          {voiceMode ? <VolumeX className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
          <span className="text-xs">{voiceMode ? "Stop Voice" : "Voice Mode"}</span>
        </Button>
      </header>

      {voiceMode && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-xs text-primary font-medium flex items-center justify-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isListening ? "bg-destructive animate-pulse" : isSpeaking ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          {isListening ? "Listening... speak now" : isSpeaking ? "Velloza is speaking..." : "Voice mode active"}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => {
          const practice = m.role === "assistant" ? extractPractice(m.content) : null;
          const native = m.role === "assistant" ? extractNative(m.content) : null;
          return (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-user-bubble text-user-bubble-foreground"
                    : "bg-buddy text-buddy-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    {(practice || native) && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                        {native && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => speakSentence(native)}
                            className="h-8 text-xs"
                          >
                            <Volume2 className="h-3 w-3 mr-1" /> Hear native
                          </Button>
                        )}
                        {practice && (
                          <Button
                            size="sm"
                            onClick={() => speakSentence(practice)}
                            className="h-8 text-xs"
                            disabled={isSpeaking}
                          >
                            <Volume2 className="h-3 w-3 mr-1" /> Practice
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-[88%] bg-buddy text-buddy-foreground rounded-2xl px-4 py-3 text-sm">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                <ReactMarkdown>{streaming}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isProcessing && !streaming && (
          <div className="flex justify-start">
            <div className="bg-buddy text-buddy-foreground rounded-2xl px-4 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 bg-current rounded-full animate-bounce" />
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t bg-card p-3 space-y-2">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask in any language, or type your English attempt..."
            className="resize-none min-h-[48px] max-h-32 rounded-2xl"
            rows={1}
            disabled={isProcessing}
          />
          {sttSupported && (
            <Button
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              onClick={toggleMic}
              disabled={isProcessing}
              className="h-12 w-12 rounded-full shrink-0"
              title={isListening ? "Stop recording" : "Speak"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="h-12 w-12 rounded-full shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Try first, then learn — that's how confidence grows.
        </p>
      </div>
    </div>
  );
};

export default Coach;
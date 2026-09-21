import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Headphones, Briefcase, Coffee, GraduationCap, Building2, Plane, ShoppingBag, Hospital, MessageCircle } from "lucide-react";
import { streamChat, type Message } from "@/lib/chat";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type VoiceFlow = "coach" | "scenario";
const SCENARIOS = [
  { id: "Job Interview", label: "Interview", icon: Briefcase },
  { id: "Cafe / Restaurant", label: "Cafe", icon: Coffee },
  { id: "College Friends Hangout", label: "College", icon: GraduationCap },
  { id: "Office Meeting", label: "Office", icon: Building2 },
  { id: "Travel / Airport", label: "Travel", icon: Plane },
  { id: "Shopping in a Mall", label: "Shopping", icon: ShoppingBag },
  { id: "Hospital / Doctor visit", label: "Hospital", icon: Hospital },
  { id: "Casual Daily Talk", label: "Daily Talk", icon: MessageCircle },
];

const Coach = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceFlow, setVoiceFlow] = useState<VoiceFlow>("coach");
  const [scenario, setScenario] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const voiceFlowRef = useRef<VoiceFlow>("coach");
  const scenarioRef = useRef<string | null>(null);
  const voiceModeRef = useRef(false);
  const sendRef = useRef<(msgs: Message[]) => void>(() => {});
  const messagesRef = useRef<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);

  const { speak, stop: stopSpeak, isSpeaking } = useTextToSpeech();
  const busyRef = useRef(false);
  const stopRef = useRef<() => void>(() => {});
  const { isListening, start, stop, supported: sttSupported } = useSpeechToText(
    (text) => {
      if (voiceModeRef.current) {
        // Ignore anything captured while Velloza is talking or thinking
        if (busyRef.current) return;
        busyRef.current = true;
        stopRef.current();
        const updated = [...messagesRef.current, { role: "user" as const, content: text }];
        setMessages(updated);
        messagesRef.current = updated;
        setInput("");
        sendRef.current(updated);
      } else {
        setInput((prev) => (prev ? prev + " " + text : text));
      }
    }
  );

  const startRef = useRef<() => void>(() => {});
  useEffect(() => { stopRef.current = stop; }, [stop]);
  useEffect(() => { startRef.current = start; }, [start]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);
  useEffect(() => { voiceFlowRef.current = voiceFlow; }, [voiceFlow]);
  useEffect(() => { scenarioRef.current = scenario; }, [scenario]);

  const send = useCallback(
    async (allMessages: Message[]) => {
      setIsProcessing(true);
      setStreaming("");
      let assistantSoFar = "";
      const isScenario = voiceFlowRef.current === "scenario" && !!scenarioRef.current;
      await streamChat({
        messages: allMessages,
        mode: isScenario ? "scenario" : "coach",
        scenario: isScenario ? scenarioRef.current! : undefined,
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
            let toSpeak = assistantSoFar;
            if (voiceFlowRef.current === "coach") {
              const native = assistantSoFar.match(/\*\*Native Speaker Version:\*\*\s*([^\n]+)/i)?.[1]
                ?.replace(/^["']|["']$/g, "");
              const nextQ = assistantSoFar.match(/\*\*Next Question:\*\*\s*([^\n]+)/i)?.[1];
              if (native && nextQ) toSpeak = `${native}. Next question: ${nextQ}`;
            } else {
              // Scenario: strip any stray markdown for clean TTS
              toSpeak = assistantSoFar.replace(/[*_`#>]/g, "").trim();
            }
            // Mic stays closed while Velloza speaks, then reopens once — no flicker
            stopRef.current();
            speak(toSpeak, () => {
              busyRef.current = false;
              if (!voiceModeRef.current) return;
              window.setTimeout(() => {
                if (voiceModeRef.current) startRef.current();
              }, 350);
            });
          } else {
            busyRef.current = false;
          }
        },
        onError: (err) => {
          toast.error(err);
          setIsProcessing(false);
          setStreaming("");
          busyRef.current = false;
          if (voiceModeRef.current) startRef.current();
        },
      });
    },
    []
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

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
    if (voiceMode) {
      setVoiceMode(false);
      stop();
      stopSpeak();
      return;
    }
    // Opening voice mode → ask user which flow
    setPickerOpen(true);
  };

  const startVoiceFlow = (flow: VoiceFlow, scenarioId?: string) => {
    stopSpeak();
    setPickerOpen(false);
    setVoiceFlow(flow);
    voiceFlowRef.current = flow;
    setScenario(scenarioId ?? null);
    scenarioRef.current = scenarioId ?? null;
    setVoiceMode(true);
    voiceModeRef.current = true;
    // Reset conversation so the new flow's greeting kicks in
    setMessages([]);
    messagesRef.current = [];
    setStreaming("");
    send([]);
    setTimeout(() => { if (!isListening) start(); }, 400);
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
          {voiceFlow === "scenario" && scenario && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-[10px]">{scenario}</span>
          )}
        </div>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Voice Mode</DialogTitle>
            <DialogDescription>Pick how you want to practice speaking today.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> 1. Roleplay a real-life scene
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Pick an event — Velloza will start the conversation in that scene and you reply by voice.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Button
                      key={s.id}
                      variant="outline"
                      className="h-auto py-3 flex flex-col gap-1 items-center"
                      onClick={() => startVoiceFlow("scenario", s.id)}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs">{s.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" /> 2. Ask in Hindi → Try in English
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Speak your question in any language. Velloza will first ask you to try it in English, then coach you.
              </p>
              <Button className="w-full" onClick={() => startVoiceFlow("coach")}>
                <Mic className="h-4 w-4 mr-2" /> Start Coach Voice Mode
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, Mic, MicOff, CheckCircle2, XCircle, Sparkles, RotateCcw } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { toast } from "sonner";

const DAILY_WORDS: { category: string; words: { word: string; tip: string }[] }[] = [
  {
    category: "Common Tricky Words",
    words: [
      { word: "Schedule", tip: "SKED-jool (US) or SHED-yool (UK)" },
      { word: "Wednesday", tip: "WENZ-day — silent 'd'" },
      { word: "February", tip: "FEB-roo-ary — don't skip the first 'r'" },
      { word: "Comfortable", tip: "KUMF-ter-bul — 3 syllables, not 4" },
      { word: "Vegetable", tip: "VEJ-tuh-bul — skip the middle 'e'" },
      { word: "Chocolate", tip: "CHOK-lit — 2 syllables" },
      { word: "Restaurant", tip: "RES-tuh-rahnt" },
      { word: "Entrepreneur", tip: "on-truh-pruh-NUR" },
    ],
  },
  {
    category: "Office & Work",
    words: [
      { word: "Colleague", tip: "KOL-eeg — silent 'ue'" },
      { word: "Genuine", tip: "JEN-yoo-in — not 'jen-yoo-wine'" },
      { word: "Receipt", tip: "ri-SEET — silent 'p'" },
      { word: "Suite", tip: "SWEET — like 'sweet'" },
      { word: "Resume", tip: "REZ-oo-may" },
      { word: "Pronunciation", tip: "pro-nun-see-AY-shun — not 'pronounciation'" },
    ],
  },
  {
    category: "Daily Use",
    words: [
      { word: "Often", tip: "OFF-en — silent 't'" },
      { word: "Iron", tip: "EYE-urn — silent 'r' moved" },
      { word: "Almond", tip: "AH-mund — silent 'l'" },
      { word: "Salmon", tip: "SAM-un — silent 'l'" },
      { word: "Aunt", tip: "ANT or AHNT" },
      { word: "Tuesday", tip: "TYOOZ-day" },
      { word: "Garage", tip: "guh-RAHZH or GA-rij" },
    ],
  },
  {
    category: "Indian English Often Mispronounced",
    words: [
      { word: "Develop", tip: "di-VEL-up — stress on 2nd syllable" },
      { word: "Pizza", tip: "PEET-suh" },
      { word: "Police", tip: "puh-LEES — stress on 2nd syllable" },
      { word: "Hotel", tip: "ho-TEL — stress on 2nd syllable" },
      { word: "Idea", tip: "eye-DEE-uh" },
      { word: "Salon", tip: "suh-LON" },
      { word: "Buffet", tip: "buh-FAY — silent 't'" },
    ],
  },
];

type Attempt = {
  target: string;
  heard: string;
  score: number; // 0-100
};

// Levenshtein-based similarity (0..100)
function similarity(a: string, b: string): number {
  const s1 = a.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const s2 = b.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i - 1] === s2[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

function feedbackFor(score: number, target: string, heard: string): string {
  if (score >= 90) return `Perfect! Your pronunciation of "${target}" sounds great.`;
  if (score >= 75) return `Very close! Minor difference — try a slower, clearer attempt.`;
  if (score >= 50) return `Good try. I heard "${heard}". Focus on each syllable separately.`;
  return `I heard "${heard}". Listen again carefully and break the word into syllables.`;
}

const Pronunciation = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const targetRef = useRef("");

  const { speak, stop: stopSpeak, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const onSttResult = (heard: string) => {
    const t = targetRef.current.trim();
    if (!t) return;
    const score = similarity(t, heard);
    setAttempt({ target: t, heard, score });
    setAttemptCount((c) => c + 1);
  };

  const { isListening, start, stop, supported: sttSupported } = useSpeechToText(onSttResult);

  const speakTarget = () => {
    const t = target.trim();
    if (!t) {
      toast.error("Type or pick a word first");
      return;
    }
    stopSpeak();
    speak(t);
  };

  const speakSlow = () => {
    const t = target.trim();
    if (!t) return;
    stopSpeak();
    // Use the same speak but pause briefly with periods between letters/syllables
    const slowed = t.split(/\s+/).join(" ... ");
    speak(slowed);
  };

  const toggleMic = () => {
    if (!target.trim()) {
      toast.error("Type or pick a word first");
      return;
    }
    if (isListening) stop();
    else {
      stopSpeak();
      start();
    }
  };

  const pickWord = (word: string, tip: string) => {
    stopSpeak();
    setTarget(word);
    setCurrentTip(tip);
    setAttempt(null);
    setAttemptCount(0);
    // Auto-speak the chosen word
    setTimeout(() => speak(word), 100);
  };

  const reset = () => {
    setAttempt(null);
  };

  const scoreColor =
    attempt == null
      ? ""
      : attempt.score >= 90
      ? "text-green-600"
      : attempt.score >= 70
      ? "text-amber-600"
      : "text-destructive";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-display font-bold text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Pronunciation Practice
            </h2>
            <p className="text-[10px] text-muted-foreground">Listen → Repeat → Improve</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-5 max-w-2xl w-full mx-auto">
        {/* Practice Box */}
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Type any word or sentence to practice
            </label>
            <div className="flex gap-2">
              <Input
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setCurrentTip(null);
                  setAttempt(null);
                }}
                placeholder="e.g. Schedule, Comfortable, Pronunciation..."
                className="rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") speakTarget();
                }}
              />
            </div>
          </div>

          {currentTip && (
            <div className="bg-accent/40 rounded-xl px-3 py-2 text-xs">
              <span className="font-semibold">Tip: </span>
              <span>{currentTip}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={speakTarget}
              disabled={!target.trim() || isSpeaking}
              className="rounded-xl flex-1 min-w-[140px]"
            >
              <Volume2 className="h-4 w-4 mr-1.5" />
              Listen
            </Button>
            <Button
              onClick={speakSlow}
              disabled={!target.trim() || isSpeaking}
              variant="secondary"
              className="rounded-xl"
            >
              Slow
            </Button>
            {sttSupported && (
              <Button
                onClick={toggleMic}
                variant={isListening ? "destructive" : "default"}
                className="rounded-xl flex-1 min-w-[140px]"
                disabled={!target.trim()}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1.5" />
                    Speak
                  </>
                )}
              </Button>
            )}
          </div>

          {!sttSupported && (
            <p className="text-xs text-muted-foreground">
              Voice input not supported in this browser. Try Chrome.
            </p>
          )}

          {/* Result */}
          {attempt && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {attempt.score >= 75 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className={`font-display font-bold text-lg ${scoreColor}`}>
                    {attempt.score}%
                  </span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Attempt {attemptCount}
                </Badge>
              </div>

              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Target: </span>
                  <span className="font-semibold">{attempt.target}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">You said: </span>
                  <span className="font-semibold">{attempt.heard || "(nothing detected)"}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed">
                {feedbackFor(attempt.score, attempt.target, attempt.heard)}
              </p>

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="secondary" onClick={speakTarget} className="rounded-lg">
                  <Volume2 className="h-3.5 w-3.5 mr-1" />
                  Hear again
                </Button>
                <Button size="sm" onClick={toggleMic} className="rounded-lg">
                  <Mic className="h-3.5 w-3.5 mr-1" />
                  Try again
                </Button>
                <Button size="sm" variant="ghost" onClick={reset} className="rounded-lg">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Word library */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wide px-1">
            Practice common words
          </h3>
          {DAILY_WORDS.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <p className="text-xs font-semibold text-foreground px-1">{cat.category}</p>
              <div className="grid grid-cols-2 gap-2">
                {cat.words.map((w) => (
                  <button
                    key={w.word}
                    onClick={() => pickWord(w.word, w.tip)}
                    className={`text-left rounded-xl border bg-card p-3 hover:border-primary hover:bg-accent/30 transition-all ${
                      target === w.word ? "border-primary bg-accent/40" : ""
                    }`}
                  >
                    <p className="font-semibold text-sm">{w.word}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{w.tip}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
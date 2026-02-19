import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, AlertTriangle, BookOpen, Target, TrendingUp, MessageCircle } from "lucide-react";

export interface SessionSummary {
  overall_score: number;
  grammar_mistakes: number;
  pronunciation_issues: number;
  vocabulary_level: string;
  fluency_feedback: string;
  confidence_level: string;
  corrections: Array<{
    incorrect: string;
    correct: string;
    explanation: string;
    pronunciation_tip: string;
  }>;
  repeated_mistakes: string[];
  improvement_areas: string[];
  daily_tips: string[];
  practice_questions: string[];
  pronunciation_words: string[];
  speaking_tasks: string[];
}

interface PerformanceSummaryProps {
  summary: SessionSummary;
  duration: number;
  onBack: () => void;
  onNewSession: () => void;
}

const PerformanceSummary = ({ summary, duration, onBack, onNewSession }: PerformanceSummaryProps) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const scoreColor =
    summary.overall_score >= 8 ? "text-green-600" :
    summary.overall_score >= 5 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-display font-bold text-base">Session Summary</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {/* Score Card */}
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className={`text-5xl font-display font-extrabold ${scoreColor}`}>
              {summary.overall_score}<span className="text-2xl text-muted-foreground">/10</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Session: {minutes}m {seconds}s
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary">{summary.vocabulary_level} Vocabulary</Badge>
              <Badge variant="secondary">Confidence: {summary.confidence_level}</Badge>
            </div>
            <Progress value={summary.overall_score * 10} className="h-2" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <div className="text-2xl font-bold">{summary.grammar_mistakes}</div>
              <p className="text-xs text-muted-foreground">Grammar Mistakes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <MessageCircle className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{summary.pronunciation_issues}</div>
              <p className="text-xs text-muted-foreground">Pronunciation Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Fluency Feedback */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm leading-relaxed">{summary.fluency_feedback}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="corrections" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="corrections" className="text-xs">Corrections</TabsTrigger>
            <TabsTrigger value="improve" className="text-xs">Improve</TabsTrigger>
            <TabsTrigger value="practice" className="text-xs">Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="corrections" className="space-y-3 mt-3">
            {summary.corrections.length === 0 ? (
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                  <p className="text-sm font-medium">Great job! No major corrections needed! 🎉</p>
                </CardContent>
              </Card>
            ) : (
              summary.corrections.map((c, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3 space-y-2">
                    <p className="text-sm">
                      <span className="text-destructive font-medium">❌ </span>
                      <span className="line-through opacity-70">{c.incorrect}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-green-600 font-medium">✅ </span>
                      {c.correct}
                    </p>
                    <p className="text-xs text-muted-foreground">📝 {c.explanation}</p>
                    {c.pronunciation_tip && (
                      <p className="text-xs text-primary">🗣️ {c.pronunciation_tip}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {summary.repeated_mistakes.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Repeated Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-1">
                    {summary.repeated_mistakes.map((m, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="improve" className="space-y-3 mt-3">
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ul className="space-y-1.5">
                  {summary.improvement_areas.map((a, i) => (
                    <li key={i} className="text-sm">🎯 {a}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Daily Practice Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ul className="space-y-1.5">
                  {summary.daily_tips.map((t, i) => (
                    <li key={i} className="text-sm">💡 {t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-3 mt-3">
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm">Practice Questions</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ol className="space-y-1.5 list-decimal list-inside">
                  {summary.practice_questions.map((q, i) => (
                    <li key={i} className="text-sm">{q}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm">Pronunciation Practice</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-2">
                  {summary.pronunciation_words.map((w, i) => (
                    <Badge key={i} variant="outline" className="text-sm">{w}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm">Speaking Tasks</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ul className="space-y-2">
                  {summary.speaking_tasks.map((t, i) => (
                    <li key={i} className="text-sm bg-accent/50 rounded-lg p-3">🎤 {t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="pb-6 space-y-3">
          <Button onClick={onNewSession} className="w-full rounded-2xl h-12 font-display font-bold">
            Start New Session 🎙️
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummary;

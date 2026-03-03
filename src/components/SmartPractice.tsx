import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SmartPracticeCategory {
  category: string;
  issue_detected: string;
  sentences: Array<{ practice: string; hint: string }>;
}

interface SmartPracticeProps {
  categories: SmartPracticeCategory[];
  onPracticeSentence?: (sentence: string) => void;
}

const categoryIcons: Record<string, string> = {
  Tenses: "⏰",
  Vocabulary: "📚",
  Pronunciation: "🗣️",
  "Sentence Structure": "🏗️",
  Articles: "📝",
  Prepositions: "📍",
};

const SmartPractice = ({ categories, onPracticeSentence }: SmartPracticeProps) => {
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4 pb-3 text-center">
          <p className="text-sm font-medium">Great job! No specific weaknesses detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{categoryIcons[cat.category] || "🎯"}</span>
              {cat.category}
              <Badge variant="outline" className="text-[10px] ml-auto">
                {cat.sentences.length} sentences
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{cat.issue_detected}</p>
          </CardHeader>
          <CardContent className="pb-3">
            <ul className="space-y-2">
              {cat.sentences.map((s, j) => (
                <li
                  key={j}
                  className="text-sm bg-accent/50 rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onPracticeSentence?.(s.practice)}
                >
                  <p className="font-medium">{s.practice}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SmartPractice;

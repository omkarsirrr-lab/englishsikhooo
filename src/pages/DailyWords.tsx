import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Mic, Search } from "lucide-react";
import { categories, type WordCategory } from "@/data/dailyWordsData";
import { Input } from "@/components/ui/input";

const DailyWords = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);
  const [search, setSearch] = useState("");

  const handlePracticeWithVoice = (category: WordCategory) => {
    navigate("/voice", {
      state: { topic: `Practice ${category.label} sentences. Ask me questions related to ${category.label} situations and help me practice speaking.` },
    });
  };

  if (selectedCategory) {
    const filtered = search
      ? selectedCategory.words.filter(
          (w) =>
            w.en.toLowerCase().includes(search.toLowerCase()) ||
            w.mr.includes(search)
        )
      : selectedCategory.words;

    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedCategory(null); setSearch(""); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-display font-bold text-base">
              {selectedCategory.icon} {selectedCategory.label}
            </h2>
            <p className="text-xs text-muted-foreground">{selectedCategory.words.length} sentences</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => handlePracticeWithVoice(selectedCategory)}>
            <Mic className="h-4 w-4" /> Practice with Voice
          </Button>
        </header>

        <div className="px-4 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sentences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 py-3 space-y-2 max-w-2xl mx-auto w-full">
            {filtered.map((w, i) => (
              <Card key={i}>
                <CardContent className="pt-3 pb-2.5 px-4 space-y-0.5">
                  <p className="text-sm font-medium">{w.en}</p>
                  <p className="text-sm text-primary">{w.mr}</p>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No sentences found.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display font-bold text-base">Daily Use Words & Sentences</h2>
          <p className="text-xs text-muted-foreground">20 categories • 50 sentences each • English ↔ Marathi</p>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 max-w-3xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
              <span className="text-[11px] text-muted-foreground">{cat.words.length} sentences</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DailyWords;

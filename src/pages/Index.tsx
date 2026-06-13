import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Heart, Mic, BookOpen, GraduationCap } from "lucide-react";
import samAvatar from "@/assets/sam-avatar.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md space-y-8">
        {/* Avatar */}
        <div className="mx-auto h-24 w-24 rounded-full overflow-hidden shadow-lg border-4 border-card">
          <img src={samAvatar} alt="Velloza" className="w-full h-full object-cover" />
        </div>

        {/* Hero */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Meet <span className="text-primary">Velloza</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your friendly AI buddy who helps you practice English and Marathi through casual, everyday conversations.
          </p>
          <p className="text-sm font-medium text-primary">Made by Ranju Ma'am ❤️</p>
        </div>

        {/* Features */}
        <div className="space-y-3 text-left">
          {[
            { icon: MessageCircle, text: "Chat naturally — like texting a friend" },
            { icon: Sparkles, text: "Practice English or Marathi — your choice" },
            { icon: Heart, text: "No judgment, just encouragement and fun" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-3.5 border">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-sm font-medium">{text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/voice")}
            size="lg"
            className="w-full rounded-2xl h-14 text-base font-display font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            <Mic className="h-5 w-5 mr-2" />
            Start Voice Mode
          </Button>
          <Button
            onClick={() => navigate("/chat")}
            size="lg"
            variant="outline"
            className="w-full rounded-2xl h-14 text-base font-display font-bold"
          >
            Text Chat
          </Button>
          <Button
            onClick={() => navigate("/daily-words")}
            size="lg"
            variant="secondary"
            className="w-full rounded-2xl h-14 text-base font-display font-bold"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Daily Use Words
          </Button>
          <Button
            onClick={() => navigate("/coach")}
            size="lg"
            variant="secondary"
            className="w-full rounded-2xl h-14 text-base font-display font-bold"
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Speaking Coach
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          No sign-up needed • English + Marathi
        </p>
      </div>
    </div>
  );
};

export default Index;

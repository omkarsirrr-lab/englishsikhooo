import { cn } from "@/lib/utils";
import samAvatar from "@/assets/sam-avatar.jpg";

export type Expression =
  | "idle"
  | "speaking"
  | "happy"
  | "thinking"
  | "encouraging"
  | "explaining"
  | "appreciating"
  | "correcting";

interface AnimatedAvatarProps {
  expression: Expression;
  className?: string;
}

const AnimatedAvatar = ({ expression, className }: AnimatedAvatarProps) => {
  const isSpeaking = expression === "speaking";
  const isHappy = expression === "happy" || expression === "appreciating";
  const isThinking = expression === "thinking";
  const isEncouraging = expression === "encouraging";
  const isExplaining = expression === "explaining";
  const isCorrecting = expression === "correcting";
  const isAnimated = isSpeaking || isHappy || isThinking || isEncouraging || isExplaining || isCorrecting;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer glow ring */}
      <div
        className={cn(
          "absolute inset-[-6px] rounded-full transition-all duration-700 blur-sm",
          isSpeaking && "bg-primary/20 animate-pulse",
          isHappy && "bg-secondary/30",
          isAppreciating(expression) && "bg-secondary/40 animate-pulse",
          isThinking && "bg-accent/25 animate-avatar-think",
          isEncouraging && "bg-primary/25",
          isExplaining && "bg-muted/30",
          isCorrecting && "bg-accent/20"
        )}
      />

      {/* Inner ring indicator */}
      <div
        className={cn(
          "absolute inset-[-3px] rounded-full transition-all duration-500",
          isSpeaking && "ring-[3px] ring-primary/40 animate-ring-pulse",
          isHappy && "ring-[3px] ring-secondary/50",
          isAppreciating(expression) && "ring-[3px] ring-secondary/60",
          isThinking && "ring-[3px] ring-accent/40",
          isEncouraging && "ring-[3px] ring-primary/50",
          isExplaining && "ring-[2px] ring-muted-foreground/20",
          isCorrecting && "ring-[2px] ring-accent/40"
        )}
      />

      {/* Avatar container with head movement */}
      <div
        className={cn(
          "relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-card shadow-2xl transition-transform duration-700",
          isSpeaking && "animate-head-speak",
          isHappy && "scale-105 animate-head-nod",
          isThinking && "animate-head-tilt-right",
          isEncouraging && "scale-105 animate-head-nod",
          isExplaining && "animate-head-tilt-left",
          isAppreciating(expression) && "scale-110 animate-head-nod",
          isCorrecting && "animate-head-tilt-right"
        )}
      >
        <img
          src={samAvatar}
          alt="Velloza - AI English Companion"
          className="w-full h-full object-cover"
        />

        {/* Natural eye blink overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-blink-natural absolute top-[32%] left-[28%] w-[14%] h-[5%] bg-card rounded-full opacity-0" />
          <div className="animate-blink-natural absolute top-[32%] right-[28%] w-[14%] h-[5%] bg-card rounded-full opacity-0" />
        </div>

        {/* Bright / wide eyes for happy & appreciating */}
        {(isHappy || isAppreciating(expression)) && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[30%] left-[30%] w-[12%] h-[8%] rounded-full border-2 border-foreground/10 animate-eyes-bright" />
            <div className="absolute top-[30%] right-[30%] w-[12%] h-[8%] rounded-full border-2 border-foreground/10 animate-eyes-bright" />
          </div>
        )}

        {/* Raised eyebrow for thinking / questioning */}
        {isThinking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[26%] left-[28%] w-[14%] h-[3%] bg-foreground/8 rounded-full animate-eyebrow-raise" />
            <div className="absolute top-[27%] right-[28%] w-[14%] h-[3%] bg-foreground/5 rounded-full" />
          </div>
        )}

        {/* Lip-sync mouth animation for speaking */}
        {isSpeaking && (
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2">
            <div className="animate-lip-sync w-8 h-3 md:w-10 md:h-4 bg-foreground/15 rounded-full" />
          </div>
        )}

        {/* Smile for happy / encouraging / appreciating */}
        {(isHappy || isEncouraging || isAppreciating(expression)) && (
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
            <div
              className={cn(
                "border-b-[3px] border-foreground/15 rounded-b-full transition-all duration-500",
                isAppreciating(expression)
                  ? "w-12 h-6 md:w-14 md:h-7 animate-smile-wide"
                  : "w-10 h-5 md:w-12 md:h-6 animate-smile"
              )}
            />
          </div>
        )}

        {/* Neutral / slight mouth for explaining */}
        {isExplaining && (
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2">
            <div className="animate-mouth-subtle w-6 h-2 md:w-8 md:h-3 bg-foreground/10 rounded-full" />
          </div>
        )}

        {/* Calm supportive expression for correcting */}
        {isCorrecting && (
          <div className="absolute bottom-[21%] left-1/2 -translate-x-1/2">
            <div className="w-8 h-3 md:w-10 md:h-4 border-b-2 border-foreground/10 rounded-b-full animate-smile" />
          </div>
        )}
      </div>

      {/* Speaking indicator dots */}
      {isSpeaking && (
        <div className="absolute -bottom-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce-dots"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}

      {/* Encouraging sparkles */}
      {(isEncouraging || isAppreciating(expression)) && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-4 w-2 h-2 bg-secondary rounded-full animate-sparkle" style={{ animationDelay: "0s" }} />
          <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle" style={{ animationDelay: "0.3s" }} />
          <div className="absolute bottom-8 right-2 w-1.5 h-1.5 bg-secondary rounded-full animate-sparkle" style={{ animationDelay: "0.6s" }} />
        </div>
      )}
    </div>
  );
};

function isAppreciating(expression: Expression): boolean {
  return expression === "appreciating";
}

export default AnimatedAvatar;

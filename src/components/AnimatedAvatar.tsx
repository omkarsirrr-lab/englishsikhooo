import { cn } from "@/lib/utils";
import samAvatar from "@/assets/sam-avatar.jpg";

type Expression = "idle" | "speaking" | "happy" | "thinking" | "encouraging";

interface AnimatedAvatarProps {
  expression: Expression;
  className?: string;
}

const AnimatedAvatar = ({ expression, className }: AnimatedAvatarProps) => {
  const isSpeaking = expression === "speaking";
  const isHappy = expression === "happy" || expression === "encouraging";
  const isThinking = expression === "thinking";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isSpeaking && "animate-pulse ring-4 ring-primary/40",
          isHappy && "ring-4 ring-secondary/60",
          isThinking && "ring-4 ring-accent/50"
        )}
      />

      {/* Avatar container */}
      <div
        className={cn(
          "relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-card shadow-2xl transition-transform duration-700",
          isSpeaking && "animate-avatar-speak",
          isHappy && "scale-105",
          isThinking && "animate-avatar-think"
        )}
      >
        <img
          src={samAvatar}
          alt="Sam - AI English Companion"
          className="w-full h-full object-cover"
        />

        {/* Eye blink overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-blink absolute top-[32%] left-[30%] w-[12%] h-[4%] bg-card rounded-full opacity-0" />
          <div className="animate-blink absolute top-[32%] right-[30%] w-[12%] h-[4%] bg-card rounded-full opacity-0" />
        </div>

        {/* Mouth animation overlay */}
        {isSpeaking && (
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2">
            <div className="animate-mouth w-8 h-3 md:w-10 md:h-4 bg-foreground/20 rounded-full" />
          </div>
        )}

        {/* Expression overlays */}
        {isHappy && (
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
            <div className="w-10 h-5 md:w-12 md:h-6 border-b-[3px] border-foreground/20 rounded-b-full" />
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
    </div>
  );
};

export default AnimatedAvatar;

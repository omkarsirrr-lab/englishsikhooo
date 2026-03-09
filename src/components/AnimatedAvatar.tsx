import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

/* ─── helpers ─── */
function useBlinking() {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const loop = () => {
      const next = 2500 + Math.random() * 3000;
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        loop();
      }, next);
    };
    loop();
  }, []);
  return blink;
}

function useLipSync(active: boolean) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) { setFrame(0); return; }
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 120);
    return () => clearInterval(id);
  }, [active]);
  return frame;
}

/* ─── SVG face component ─── */
const AnimatedAvatar = ({ expression, className }: AnimatedAvatarProps) => {
  const blink = useBlinking();
  const isSpeaking = expression === "speaking" || expression === "explaining";
  const lipFrame = useLipSync(isSpeaking);

  // Derived booleans
  const isHappy = expression === "happy";
  const isAppreciating = expression === "appreciating";
  const isThinking = expression === "thinking";
  const isEncouraging = expression === "encouraging";
  const isExplaining = expression === "explaining";
  const isCorrecting = expression === "correcting";
  const isTalking = expression === "speaking";

  /* ─── Eye config ─── */
  const eyeOpenH = blink ? 1 : (() => {
    if (isHappy || isAppreciating || isEncouraging) return 11; // wide bright eyes
    if (isThinking) return 8;
    return 10;
  })();
  const eyeRy = blink ? 0.5 : eyeOpenH / 2;

  /* ─── Eyebrow config ─── */
  const browOffsetY = (() => {
    if (isThinking) return -3; // raised
    if (isAppreciating || isHappy) return -1.5;
    if (isCorrecting) return -1;
    return 0;
  })();
  const browTilt = (() => {
    if (isThinking) return -4; // one brow up
    if (isCorrecting) return -2;
    return 0;
  })();

  /* ─── Mouth config ─── */
  const mouthPath = (() => {
    if (isTalking) {
      // 4-frame lip sync
      const frames = [
        "M 38 72 Q 50 75 62 72", // slightly open
        "M 36 71 Q 50 82 64 71", // wide open
        "M 39 72 Q 50 77 61 72", // medium
        "M 40 73 Q 50 74 60 73", // nearly closed
      ];
      return frames[lipFrame];
    }
    if (isExplaining) {
      const frames = [
        "M 39 72 Q 50 76 61 72",
        "M 38 72 Q 50 78 62 72",
        "M 40 72 Q 50 75 60 72",
        "M 39 73 Q 50 74 61 73",
      ];
      return frames[lipFrame];
    }
    if (isHappy || isEncouraging) return "M 36 70 Q 50 82 64 70"; // smile
    if (isAppreciating) return "M 34 69 Q 50 85 66 69"; // big smile
    if (isThinking) return "M 43 73 Q 50 75 57 73"; // small O
    if (isCorrecting) return "M 40 71 Q 50 76 60 71"; // gentle
    return "M 40 72 Q 50 74 60 72"; // neutral idle
  })();

  const mouthFill = (() => {
    if (isTalking || isExplaining) return lipFrame === 1 ? "hsl(var(--foreground) / 0.12)" : "none";
    if (isAppreciating) return "hsl(var(--foreground) / 0.06)";
    return "none";
  })();

  /* ─── Head tilt ─── */
  const headRotate = (() => {
    if (isTalking) return "rotate(-1)";
    if (isThinking) return "rotate(4)";
    if (isExplaining) return "rotate(-3)";
    if (isCorrecting) return "rotate(2)";
    return "rotate(0)";
  })();

  // Cheek blush for happy/appreciating
  const showBlush = isHappy || isAppreciating || isEncouraging;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow ring */}
      <div
        className={cn(
          "absolute inset-[-8px] rounded-full transition-all duration-700 blur-md",
          isTalking && "bg-primary/25 animate-pulse",
          isHappy && "bg-secondary/30",
          isAppreciating && "bg-secondary/40 animate-pulse",
          isThinking && "bg-accent/25",
          isEncouraging && "bg-primary/30",
          isExplaining && "bg-muted/30",
          isCorrecting && "bg-accent/20"
        )}
      />

      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl transition-transform duration-700",
        )}
        style={{ transform: headRotate }}
      >
        {/* Face circle */}
        <circle cx="50" cy="50" r="46" fill="hsl(30 60% 78%)" stroke="hsl(var(--card))" strokeWidth="3" />

        {/* Hair — top */}
        <ellipse cx="50" cy="22" rx="38" ry="20" fill="hsl(20 30% 18%)" />
        <ellipse cx="50" cy="28" rx="40" ry="14" fill="hsl(20 30% 18%)" />
        {/* Side hair */}
        <ellipse cx="14" cy="45" rx="10" ry="22" fill="hsl(20 30% 18%)" />
        <ellipse cx="86" cy="45" rx="10" ry="22" fill="hsl(20 30% 18%)" />

        {/* Bindi */}
        <circle cx="50" cy="36" r="1.5" fill="hsl(0 70% 50%)" />

        {/* Eyebrows */}
        <line
          x1="32" y1={42 + browOffsetY} x2="43" y2={40 + browOffsetY + browTilt}
          stroke="hsl(20 30% 22%)" strokeWidth="1.8" strokeLinecap="round"
        />
        <line
          x1="57" y1={40 + browOffsetY} x2="68" y2={42 + browOffsetY}
          stroke="hsl(20 30% 22%)" strokeWidth="1.8" strokeLinecap="round"
        />

        {/* Eyes */}
        {/* Left eye */}
        <ellipse
          cx="37" cy="48" rx="5.5" ry={eyeRy}
          fill="white" stroke="hsl(20 20% 30%)" strokeWidth="1"
          className="transition-all duration-100"
        />
        {!blink && (
          <>
            <circle cx="37" cy="48" r="3" fill="hsl(20 40% 25%)" />
            <circle cx="37" cy="48" r="1.8" fill="hsl(20 30% 10%)" />
            <circle cx="35.5" cy="46.5" r="0.8" fill="white" opacity="0.8" />
          </>
        )}

        {/* Right eye */}
        <ellipse
          cx="63" cy="48" rx="5.5" ry={eyeRy}
          fill="white" stroke="hsl(20 20% 30%)" strokeWidth="1"
          className="transition-all duration-100"
        />
        {!blink && (
          <>
            <circle cx="63" cy="48" r="3" fill="hsl(20 40% 25%)" />
            <circle cx="63" cy="48" r="1.8" fill="hsl(20 30% 10%)" />
            <circle cx="61.5" cy="46.5" r="0.8" fill="white" opacity="0.8" />
          </>
        )}

        {/* Happy/appreciating eye sparkle */}
        {(isHappy || isAppreciating) && !blink && (
          <>
            <circle cx="35" cy="46" r="1.2" fill="white" opacity="0.9" />
            <circle cx="61" cy="46" r="1.2" fill="white" opacity="0.9" />
          </>
        )}

        {/* Nose */}
        <path d="M 48 55 Q 50 59 52 55" fill="none" stroke="hsl(20 30% 55%)" strokeWidth="1" />

        {/* Cheek blush */}
        {showBlush && (
          <>
            <ellipse cx="28" cy="58" rx="6" ry="3.5" fill="hsl(0 60% 75%)" opacity="0.35" />
            <ellipse cx="72" cy="58" rx="6" ry="3.5" fill="hsl(0 60% 75%)" opacity="0.35" />
          </>
        )}

        {/* Mouth */}
        <path
          d={mouthPath}
          fill={mouthFill}
          stroke="hsl(0 40% 45%)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="transition-all duration-100"
        />

        {/* Earrings */}
        <circle cx="11" cy="52" r="2" fill="hsl(45 80% 55%)" />
        <circle cx="89" cy="52" r="2" fill="hsl(45 80% 55%)" />
      </svg>

      {/* Speaking indicator dots */}
      {isTalking && (
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

      {/* Sparkles for encouraging/appreciating */}
      {(isEncouraging || isAppreciating) && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-4 w-2 h-2 bg-secondary rounded-full animate-sparkle" style={{ animationDelay: "0s" }} />
          <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle" style={{ animationDelay: "0.3s" }} />
          <div className="absolute bottom-8 right-2 w-1.5 h-1.5 bg-secondary rounded-full animate-sparkle" style={{ animationDelay: "0.6s" }} />
        </div>
      )}
    </div>
  );
};

export default AnimatedAvatar;

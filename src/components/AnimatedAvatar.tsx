import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

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

/* ─── Natural blink hook ─── */
function useBlinking() {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      const next = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        // Occasional double blink
        if (Math.random() < 0.2) {
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 100);
          }, 250);
        }
        loop();
      }, next);
    };
    loop();
    return () => clearTimeout(timeout);
  }, []);
  return blink;
}

/* ─── Smooth lip sync with 6 frames ─── */
function useLipSync(active: boolean) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) { setFrame(0); return; }
    const id = setInterval(() => setFrame((f) => (f + 1) % 6), 100);
    return () => clearInterval(id);
  }, [active]);
  return frame;
}

/* ─── Subtle head bob ─── */
function useHeadBob(active: boolean) {
  const [angle, setAngle] = useState(0);
  const frameRef = useRef(0);
  useEffect(() => {
    if (!active) { setAngle(0); return; }
    const id = setInterval(() => {
      frameRef.current += 1;
      setAngle(Math.sin(frameRef.current * 0.08) * 1.5);
    }, 50);
    return () => clearInterval(id);
  }, [active]);
  return angle;
}

/* ─── Gentle breathing ─── */
function useBreathing() {
  const [scale, setScale] = useState(1);
  const frameRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current += 1;
      setScale(1 + Math.sin(frameRef.current * 0.03) * 0.004);
    }, 50);
    return () => clearInterval(id);
  }, []);
  return scale;
}

/* ─── Pupil look direction ─── */
function usePupilLook(expression: Expression) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (expression === "thinking") {
      setOffset({ x: -1.5, y: -1 });
    } else if (expression === "explaining") {
      setOffset({ x: 0.5, y: 0.5 });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [expression]);
  return offset;
}

const AnimatedAvatar = ({ expression, className }: AnimatedAvatarProps) => {
  const blink = useBlinking();
  const isSpeaking = expression === "speaking" || expression === "explaining";
  const lipFrame = useLipSync(isSpeaking);
  const headBob = useHeadBob(isSpeaking || expression === "encouraging");
  const breathScale = useBreathing();
  const pupilLook = usePupilLook(expression);

  const isHappy = expression === "happy";
  const isAppreciating = expression === "appreciating";
  const isThinking = expression === "thinking";
  const isEncouraging = expression === "encouraging";
  const isExplaining = expression === "explaining";
  const isCorrecting = expression === "correcting";
  const isTalking = expression === "speaking";
  const isIdle = expression === "idle";

  /* ─── Eye shape ─── */
  const eyeRy = blink ? 0.8 : (() => {
    if (isHappy || isAppreciating) return 5; // happy squint
    if (isEncouraging) return 6;
    if (isThinking) return 5.5;
    return 6.5; // big cute eyes
  })();

  const eyeRx = 6;

  /* ─── Happy/appreciating curved eyes (anime-style) ─── */
  const happyEyes = (isHappy || isAppreciating) && !blink;

  /* ─── Eyebrow config ─── */
  const browY = (() => {
    if (isThinking) return -2.5;
    if (isAppreciating || isHappy || isEncouraging) return -1;
    if (isCorrecting) return -0.5;
    return 0;
  })();
  const browCurve = (() => {
    if (isThinking) return -3;
    if (isHappy || isAppreciating) return -1.5;
    return 0;
  })();

  /* ─── Mouth — 6-frame smooth lip sync ─── */
  const mouthPath = (() => {
    if (isTalking) {
      const frames = [
        "M 41 70 Q 50 73 59 70",    // slightly parted
        "M 39 69 Q 50 77 61 69",    // open
        "M 40 70 Q 50 79 60 70",    // wide
        "M 41 70 Q 50 75 59 70",    // medium
        "M 42 71 Q 50 73 58 71",    // closing
        "M 41 71 Q 50 72 59 71",    // nearly closed
      ];
      return frames[lipFrame];
    }
    if (isExplaining) {
      const frames = [
        "M 42 70 Q 50 74 58 70",
        "M 40 70 Q 50 76 60 70",
        "M 41 70 Q 50 75 59 70",
        "M 42 71 Q 50 73 58 71",
        "M 41 70 Q 50 74 59 70",
        "M 42 71 Q 50 72 58 71",
      ];
      return frames[lipFrame];
    }
    if (isHappy || isEncouraging) return "M 39 69 Q 50 79 61 69";
    if (isAppreciating) return "M 37 68 Q 50 81 63 68";
    if (isThinking) return "M 45 71 Q 50 73 55 71";
    if (isCorrecting) return "M 42 70 Q 50 75 58 70";
    return "M 42 71 Q 50 74 58 71"; // gentle resting smile
  })();

  const mouthFill = (() => {
    if (isTalking || isExplaining) {
      return lipFrame >= 1 && lipFrame <= 3 ? "hsl(0 30% 85%)" : "none";
    }
    if (isAppreciating || isHappy) return "hsl(0 30% 88%)";
    return "none";
  })();

  /* ─── Head transform ─── */
  const headTilt = (() => {
    if (isThinking) return 3;
    if (isExplaining) return -2;
    if (isCorrecting) return 1.5;
    return 0;
  })();

  const totalRotation = headTilt + headBob;

  const showBlush = isHappy || isAppreciating || isEncouraging || isCorrecting;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Soft glow behind avatar */}
      <div
        className={cn(
          "absolute inset-[-12px] rounded-full transition-all duration-1000 blur-xl opacity-60",
          isTalking && "bg-primary/20",
          isHappy && "bg-secondary/25",
          isAppreciating && "bg-secondary/30",
          isThinking && "bg-accent/20",
          isEncouraging && "bg-primary/25",
          isExplaining && "bg-muted/25",
          isCorrecting && "bg-accent/15",
          isIdle && "bg-muted/15"
        )}
      />

      <svg
        viewBox="0 0 120 130"
        className="w-48 h-48 md:w-60 md:h-60 drop-shadow-xl"
        style={{
          transform: `rotate(${totalRotation}deg) scale(${breathScale})`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <defs>
          <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="hsl(28 65% 82%)" />
            <stop offset="100%" stopColor="hsl(25 55% 72%)" />
          </radialGradient>
          <radialGradient id="hairGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="hsl(15 35% 22%)" />
            <stop offset="100%" stopColor="hsl(15 30% 12%)" />
          </radialGradient>
          <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0 50% 60%)" />
            <stop offset="100%" stopColor="hsl(0 45% 50%)" />
          </linearGradient>
        </defs>

        {/* ─── Neck ─── */}
        <rect x="50" y="95" width="20" height="18" rx="8" fill="url(#skinGrad)" />

        {/* ─── Shoulders hint ─── */}
        <ellipse cx="60" cy="120" rx="35" ry="14" fill="hsl(var(--primary))" opacity="0.85" />
        <ellipse cx="60" cy="118" rx="28" ry="8" fill="hsl(var(--primary))" />

        {/* ─── Ears ─── */}
        <ellipse cx="14" cy="58" rx="5" ry="7" fill="url(#skinGrad)" />
        <ellipse cx="106" cy="58" rx="5" ry="7" fill="url(#skinGrad)" />
        {/* Earrings — small jhumka */}
        <circle cx="14" cy="67" r="2.5" fill="hsl(45 80% 55%)" />
        <circle cx="14" cy="70" r="1.5" fill="hsl(45 70% 50%)" />
        <circle cx="106" cy="67" r="2.5" fill="hsl(45 80% 55%)" />
        <circle cx="106" cy="70" r="1.5" fill="hsl(45 70% 50%)" />

        {/* ─── Face ─── */}
        <ellipse cx="60" cy="56" rx="43" ry="46" fill="url(#skinGrad)" />

        {/* ─── Hair — back layer ─── */}
        <ellipse cx="60" cy="28" rx="46" ry="28" fill="url(#hairGrad)" />
        {/* Hair sides flowing */}
        <path d="M 14 30 Q 8 55 12 80 Q 14 75 16 55 Q 17 35 20 28 Z" fill="url(#hairGrad)" />
        <path d="M 106 30 Q 112 55 108 80 Q 106 75 104 55 Q 103 35 100 28 Z" fill="url(#hairGrad)" />
        {/* Bangs */}
        <path d="M 25 28 Q 35 12 60 10 Q 85 12 95 28 Q 88 22 75 18 Q 60 16 45 18 Q 32 22 25 28 Z" fill="url(#hairGrad)" />
        {/* Cute side-swept bangs */}
        <path d="M 22 32 Q 30 18 45 20 Q 38 28 30 35 Z" fill="hsl(15 32% 18%)" />
        <path d="M 98 32 Q 90 18 75 20 Q 82 28 90 35 Z" fill="hsl(15 32% 18%)" />
        {/* Hair parting highlight */}
        <path d="M 55 10 Q 60 8 65 10 Q 62 14 58 14 Z" fill="hsl(15 25% 28%)" opacity="0.5" />

        {/* ─── Bindi ─── */}
        <circle cx="60" cy="38" r="1.8" fill="hsl(0 70% 48%)" />
        <circle cx="60" cy="38" r="0.8" fill="hsl(0 60% 60%)" opacity="0.6" />

        {/* ─── Eyebrows — soft arched ─── */}
        <path
          d={`M 38 ${44 + browY} Q 44 ${41 + browY + browCurve} 50 ${43 + browY}`}
          fill="none" stroke="hsl(15 30% 20%)" strokeWidth="1.5" strokeLinecap="round"
        />
        <path
          d={`M 70 ${43 + browY} Q 76 ${41 + browY + browCurve} 82 ${44 + browY}`}
          fill="none" stroke="hsl(15 30% 20%)" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* ─── Eyes ─── */}
        {happyEyes ? (
          /* Happy curved eyes — cute anime style */
          <>
            <path
              d="M 37 52 Q 44 46 51 52"
              fill="none" stroke="hsl(15 30% 18%)" strokeWidth="2" strokeLinecap="round"
            />
            <path
              d="M 69 52 Q 76 46 83 52"
              fill="none" stroke="hsl(15 30% 18%)" strokeWidth="2" strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Left eye */}
            <ellipse
              cx="44" cy="52" rx={eyeRx} ry={eyeRy}
              fill="white" stroke="hsl(15 20% 35%)" strokeWidth="0.8"
              style={{ transition: "ry 0.1s ease" }}
            />
            {!blink && (
              <>
                {/* Iris */}
                <circle cx={44 + pupilLook.x} cy={52 + pupilLook.y} r="3.5" fill="hsl(25 50% 28%)" />
                {/* Pupil */}
                <circle cx={44 + pupilLook.x} cy={52 + pupilLook.y} r="2" fill="hsl(15 30% 8%)" />
                {/* Light reflections */}
                <circle cx={42.5 + pupilLook.x} cy={50 + pupilLook.y} r="1.2" fill="white" opacity="0.9" />
                <circle cx={45.5 + pupilLook.x} cy={53 + pupilLook.y} r="0.6" fill="white" opacity="0.6" />
              </>
            )}
            {/* Upper eyelashes — left */}
            <path d="M 38 49 Q 39 47 40 48" fill="none" stroke="hsl(15 25% 18%)" strokeWidth="0.7" />
            <path d="M 48 48 Q 49 47 50 49" fill="none" stroke="hsl(15 25% 18%)" strokeWidth="0.7" />

            {/* Right eye */}
            <ellipse
              cx="76" cy="52" rx={eyeRx} ry={eyeRy}
              fill="white" stroke="hsl(15 20% 35%)" strokeWidth="0.8"
              style={{ transition: "ry 0.1s ease" }}
            />
            {!blink && (
              <>
                <circle cx={76 + pupilLook.x} cy={52 + pupilLook.y} r="3.5" fill="hsl(25 50% 28%)" />
                <circle cx={76 + pupilLook.x} cy={52 + pupilLook.y} r="2" fill="hsl(15 30% 8%)" />
                <circle cx={74.5 + pupilLook.x} cy={50 + pupilLook.y} r="1.2" fill="white" opacity="0.9" />
                <circle cx={77.5 + pupilLook.x} cy={53 + pupilLook.y} r="0.6" fill="white" opacity="0.6" />
              </>
            )}
            {/* Upper eyelashes — right */}
            <path d="M 70 49 Q 71 47 72 48" fill="none" stroke="hsl(15 25% 18%)" strokeWidth="0.7" />
            <path d="M 80 48 Q 81 47 82 49" fill="none" stroke="hsl(15 25% 18%)" strokeWidth="0.7" />
          </>
        )}

        {/* ─── Nose — cute small ─── */}
        <path d="M 58 62 Q 60 65 62 62" fill="none" stroke="hsl(20 35% 60%)" strokeWidth="0.9" strokeLinecap="round" />

        {/* ─── Cheek blush ─── */}
        {showBlush && (
          <>
            <ellipse cx="32" cy="62" rx="7" ry="4" fill="hsl(0 55% 78%)" opacity="0.3" />
            <ellipse cx="88" cy="62" rx="7" ry="4" fill="hsl(0 55% 78%)" opacity="0.3" />
          </>
        )}
        {/* Subtle always-on blush for cuteness */}
        {!showBlush && (
          <>
            <ellipse cx="32" cy="62" rx="5" ry="3" fill="hsl(0 45% 80%)" opacity="0.15" />
            <ellipse cx="88" cy="62" rx="5" ry="3" fill="hsl(0 45% 80%)" opacity="0.15" />
          </>
        )}

        {/* ─── Mouth ─── */}
        <path
          d={mouthPath}
          fill={mouthFill}
          stroke="url(#lipGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{ transition: "d 0.08s ease" }}
        />
        {/* Upper lip subtle line */}
        {(isIdle || isThinking || isCorrecting) && (
          <path
            d="M 46 70 Q 50 68 54 70"
            fill="none" stroke="hsl(0 40% 55%)" strokeWidth="0.5" opacity="0.4"
          />
        )}
      </svg>

      {/* Speaking indicator — subtle floating dots */}
      {isTalking && (
        <div className="absolute -bottom-5 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      )}

      {/* Soft sparkles for encouraging/appreciating */}
      {(isEncouraging || isAppreciating) && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { top: "5%", right: "10%", size: "6px", delay: "0s" },
            { top: "15%", left: "5%", size: "5px", delay: "0.4s" },
            { bottom: "25%", right: "5%", size: "4px", delay: "0.8s" },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-secondary/50 animate-pulse"
              style={{
                top: s.top, right: s.right, left: s.left, bottom: s.bottom,
                width: s.size, height: s.size,
                animationDelay: s.delay, animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimatedAvatar;

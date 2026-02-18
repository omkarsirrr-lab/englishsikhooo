import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  active: boolean;
  className?: string;
}

const VoiceWaveform = ({ active, className }: VoiceWaveformProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-8", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-primary transition-all duration-150",
            active ? "animate-waveform" : "h-1 opacity-30"
          )}
          style={{
            animationDelay: active ? `${i * 0.1}s` : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;

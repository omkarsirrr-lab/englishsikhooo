const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce-dots"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
    <span className="text-sm text-muted-foreground ml-1">Sam is typing...</span>
  </div>
);

export default TypingIndicator;

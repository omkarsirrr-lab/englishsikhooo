import { type Language } from "@/lib/chat";

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

const LanguageSelector = ({ language, onChange, className = "" }: LanguageSelectorProps) => {
  return (
    <div className={`flex rounded-full bg-muted p-1 ${className}`}>
      <button
        onClick={() => onChange("english")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          language === "english"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        English
      </button>
      <button
        onClick={() => onChange("marathi")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          language === "marathi"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        मराठी
      </button>
    </div>
  );
};

export default LanguageSelector;

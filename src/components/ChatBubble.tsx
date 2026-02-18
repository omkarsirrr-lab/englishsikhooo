import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import samAvatar from "@/assets/sam-avatar.jpg";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-2.5 max-w-[85%] md:max-w-[70%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarImage src={samAvatar} alt="Sam" />
          <AvatarFallback className="bg-primary text-primary-foreground font-display text-sm font-bold">
            S
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          isUser
            ? "bg-user-bubble text-user-bubble-foreground rounded-br-md"
            : "bg-buddy text-buddy-foreground rounded-bl-md"
        )}
      >
        <div className="prose prose-sm max-w-none [&_p]:my-1 [&_strong]:font-semibold [&_hr]:my-2 [&_hr]:border-correction-border">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

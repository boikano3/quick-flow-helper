import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-foreground/90 prose-strong:text-foreground",
        "prose-li:text-foreground/90 prose-code:text-foreground",
        "prose-a:text-primary",
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Chat – FlowAI" },
      { name: "description", content: "Conversational AI assistant for workplace productivity." },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "flowai-chat-messages";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const quickPrompts = [
  "Help me prep for a 1:1 with my manager",
  "How do I say no to a meeting politely?",
  "Tips to stay focused during the afternoon slump",
  "Write a stand-up update template",
];

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInitial(loadMessages());
  }, []);

  if (initial === null) {
    return <div className="p-8 text-sm text-muted-foreground">Loading chat…</div>;
  }

  return <ChatInner initial={initial} input={input} setInput={setInput} inputRef={inputRef} />;
}

function ChatInner({
  initial,
  input,
  setInput,
  inputRef,
}: {
  initial: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: "flowai-single-conversation",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error(e.message || "Chat failed"),
  });

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  // Keep textarea focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [status, inputRef]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const handleQuickPrompt = (text: string) => {
    if (isBusy) return;
    sendMessage({ text });
  };

  const handleClear = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.success("Conversation cleared");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-4xl flex-col px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
            <MessagesSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Workplace Chat</h1>
            <p className="text-xs text-muted-foreground">Ask FlowAI anything about your workday.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <Conversation className="h-full">
          <ConversationContent className="px-4 py-6 sm:px-8">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Sparkles className="h-8 w-8 text-primary" />}
                title="How can I help today?"
                description="Quick start with a suggestion below or type your own question."
              >
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleQuickPrompt(p)}
                      className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent
                    className={
                      message.role === "user"
                        ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:shadow-elegant"
                        : "bg-transparent px-0 py-0"
                    }
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return message.role === "assistant" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : (
                          <span key={i}>{part.text}</span>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent className="bg-transparent px-0 py-0">
                  <Shimmer>Thinking…</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="py-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FlowAI anything…"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() && !isBusy}
              onClick={isBusy ? () => stop() : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
        <div className="mt-2">
          <AiDisclaimer />
        </div>
      </div>
    </div>
  );
}

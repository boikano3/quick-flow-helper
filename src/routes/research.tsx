import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { researchTopic } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";

const suggestions = [
  "Best practices for async standups",
  "How to give feedback to a senior peer",
  "Inbox-zero strategies for managers",
  "OKR vs KPI for a 20-person team",
];

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant – FlowAI" },
      { name: "description", content: "Summarize workplace topics and surface quick insights." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");

  const m = useMutation({
    mutationFn: async () => (await fn({ data: { topic } })).text,
    onSuccess: setResult,
    onError: (e: Error) => toast.error(e.message || "Failed to research"),
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Research Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Quick insights and recommendations on any workplace topic.
          </p>
        </div>
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Ask a question</CardTitle>
          <CardDescription>Topic, question, or workplace challenge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. How to run a productive retrospective"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && topic.trim()) m.mutate();
              }}
            />
            <Button
              onClick={() => m.mutate()}
              disabled={!topic.trim() || m.isPending}
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Research</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <AiDisclaimer />
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <Markdown>{result}</Markdown>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              <Sparkles className="mb-2 h-6 w-6 opacity-50" />
              Insights will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

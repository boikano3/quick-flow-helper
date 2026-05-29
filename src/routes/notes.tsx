import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { summarizeNotes } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer – FlowAI" },
      { name: "description", content: "Turn raw meeting notes into decisions, action items, and deadlines." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");

  const m = useMutation({
    mutationFn: async () => (await fn({ data: { notes } })).text,
    onSuccess: setResult,
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">
            Extract decisions, action items, deadlines, and urgent follow-ups.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Raw Notes</CardTitle>
            <CardDescription>Paste your meeting transcript or notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={16}
              placeholder="Paste meeting notes here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-mono text-xs"
            />
            <Button
              onClick={() => m.mutate()}
              disabled={!notes.trim() || m.isPending}
              className="w-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              {m.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Summarizing…</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" />Summarize Notes</>
              )}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Key decisions, owners, and deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Markdown>{result}</Markdown>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                <FileText className="mb-2 h-6 w-6 opacity-50" />
                Your summary will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

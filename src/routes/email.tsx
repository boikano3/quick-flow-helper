import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Mail, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator – FlowAI" },
      { name: "description", content: "Generate professional emails with tone and audience controls." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive">("formal");
  const [audience, setAudience] = useState<"manager" | "client" | "coworker">("manager");
  const [result, setResult] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const r = await fn({ data: { topic, tone, audience } });
      return r.text;
    },
    onSuccess: (text) => setResult(text),
    onError: (e: Error) => toast.error(e.message || "Failed to generate email"),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        icon={<Mail className="h-5 w-5 text-primary-foreground" />}
        title="Smart Email Generator"
        subtitle="Draft polished, on-brand emails in seconds."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Compose</CardTitle>
            <CardDescription>Describe what you want to say.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="coworker">Coworker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What's the email about?</Label>
              <Textarea
                rows={8}
                placeholder="e.g. Request a 1-week extension on the Q3 report because the dataset arrived late."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!topic.trim() || mutation.isPending}
              className="w-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Drafting…</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" />Generate Email</>
              )}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Draft</CardTitle>
              <CardDescription>Review, edit, and send.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={copy} disabled={!result}>
              <Copy className="mr-1 h-3.5 w-3.5" /> Copy
            </Button>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm text-foreground/90 font-sans">
                {result}
              </pre>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                <Mail className="mb-2 h-6 w-6 opacity-50" />
                Your generated email will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PageHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

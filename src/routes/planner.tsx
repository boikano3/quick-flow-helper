import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CalendarClock, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { planDay } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner – FlowAI" },
      { name: "description", content: "Prioritized daily schedule with productivity tips." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planDay);
  const [tasks, setTasks] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [result, setResult] = useState("");

  const m = useMutation({
    mutationFn: async () => (await fn({ data: { tasks, startTime, endTime } })).text,
    onSuccess: setResult,
    onError: (e: Error) => toast.error(e.message || "Failed to plan"),
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
          <CalendarClock className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">
            Turn a brain-dump into a prioritized, time-blocked schedule.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Your Tasks</CardTitle>
            <CardDescription>One task per line. Mention urgency if you can.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <Textarea
              rows={12}
              placeholder={"e.g.\nFinish Q3 report draft\nReply to client about pricing\n30-min gym\nReview PR #482"}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
            />
            <Button
              onClick={() => m.mutate()}
              disabled={!tasks.trim() || m.isPending}
              className="w-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              {m.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Planning…</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" />Build My Day</>
              )}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Today's Plan</CardTitle>
            <CardDescription>Time-blocked and prioritized.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Markdown>{result}</Markdown>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                <CalendarClock className="mb-2 h-6 w-6 opacity-50" />
                Your schedule will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

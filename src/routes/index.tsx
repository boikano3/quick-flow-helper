import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  Sparkles,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard – FlowAI" },
      {
        name: "description",
        content: "Your AI-powered productivity command center.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Productivity Score", value: "84", suffix: "/100", icon: TrendingUp, accent: "text-success" },
  { label: "Tasks Automated", value: "127", suffix: "this week", icon: Zap, accent: "text-primary" },
  { label: "Time Saved", value: "9.2h", suffix: "this week", icon: Clock, accent: "text-warning" },
  { label: "Completed Today", value: "12", suffix: "of 15", icon: CheckCircle2, accent: "text-success" },
];

const features: Array<{
  title: string;
  desc: string;
  icon: typeof Mail;
  to: "/email" | "/notes" | "/planner" | "/research" | "/chat";
  badge?: string;
}> = [
  {
    title: "Smart Email Generator",
    desc: "Draft professional emails with tone & audience controls.",
    icon: Mail,
    to: "/email",
    badge: "Popular",
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn long notes into decisions, action items, and deadlines.",
    icon: FileText,
    to: "/notes",
    badge: "New",
  },
  {
    title: "AI Task Planner",
    desc: "Prioritized daily schedule with productivity tips.",
    icon: CalendarClock,
    to: "/planner",
  },
  {
    title: "AI Research Assistant",
    desc: "Summarize topics and surface quick insights.",
    icon: Sparkles,
    to: "/research",
  },
  {
    title: "Workplace Chatbot",
    desc: "Conversational assistant for workplace productivity.",
    icon: MessagesSquare,
    to: "/chat",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Hero / Onboarding */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 sm:p-10 shadow-soft">
        <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,white,transparent_60%)]">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-primary blur-3xl" />
        </div>
        <Badge variant="secondary" className="mb-4 gap-1">
          <Sparkles className="h-3 w-3" /> Welcome to FlowAI
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Reclaim your focus.{" "}
          <span className="text-gradient-primary">Let AI handle the busywork.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          FlowAI helps professionals automate repetitive workplace tasks — drafting emails,
          summarizing meetings, planning your day, and answering questions on demand.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
            <Link to="/email">
              Try Email Generator <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/chat">Chat with FlowAI</Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.suffix}</span>
              </div>
              {s.label === "Productivity Score" && (
                <Progress value={84} className="mt-3 h-1.5" />
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Workspace</h2>
            <p className="text-sm text-muted-foreground">Pick a tool to get started.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="group">
              <Card className="h-full shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {f.badge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {f.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        AI-generated content may require human review before professional use.
      </p>
    </div>
  );
}

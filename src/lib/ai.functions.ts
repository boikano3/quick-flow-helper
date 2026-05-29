import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getLovableModel } from "./ai-gateway.server";

const EmailInput = z.object({
  topic: z.string().min(1).max(2000),
  tone: z.enum(["formal", "friendly", "persuasive"]),
  audience: z.enum(["manager", "client", "coworker"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getLovableModel(),
      system:
        "You write professional workplace emails. Always return ONLY the email body, including subject line on the first line as 'Subject: ...'. No commentary, no markdown fences.",
      prompt: `Write a ${data.tone} email to my ${data.audience} about: ${data.topic}`,
    });
    return { text };
  });

const NotesInput = z.object({ notes: z.string().min(1).max(20000) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getLovableModel(),
      system:
        "You are a meeting notes summarizer. Output markdown with the following sections (omit empty ones): ## Summary, ## Key Decisions, ## Action Items (with owner and deadline if mentioned), ## Deadlines, ## Urgent Follow-ups. Be concise and concrete.",
      prompt: data.notes,
    });
    return { text };
  });

const PlanInput = z.object({
  tasks: z.string().min(1).max(5000),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
});

export const planDay = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    const window =
      data.startTime && data.endTime
        ? `Working hours: ${data.startTime} – ${data.endTime}.`
        : "Assume a standard 9:00 – 18:00 working day.";
    const { text } = await generateText({
      model: getLovableModel(),
      system:
        "You are an AI task planner. Return markdown with: ## Today's Schedule (table-like list with time blocks), ## Priority Matrix (Urgent+Important / Important / Quick wins / Defer), ## Productivity Tips (3 bullets). Use the Eisenhower matrix to rank.",
      prompt: `${window}\n\nTasks:\n${data.tasks}`,
    });
    return { text };
  });

const ResearchInput = z.object({ topic: z.string().min(1).max(1000) });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getLovableModel(),
      system:
        "You are an AI research assistant for workplace topics. Return markdown with: ## Overview (2-3 sentences), ## Key Insights (5 bullets), ## Recommendations (3 actionable bullets), ## Further Reading (3 suggested search queries). Keep it grounded and avoid speculation.",
      prompt: data.topic,
    });
    return { text };
  });

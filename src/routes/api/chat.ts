import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getLovableModel } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }
        const messages = body.messages as UIMessage[];

        const result = streamText({
          model: getLovableModel(),
          system:
            "You are FlowAI, a friendly workplace productivity assistant. Help with email drafting, meeting prep, prioritization, focus techniques, and quick workplace questions. Be concise, warm, and actionable. Use markdown when helpful.",
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});

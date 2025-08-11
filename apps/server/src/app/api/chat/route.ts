import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { tools } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log("received messages", messages);
  const result = streamText({
    model: openai("gpt-5"),
    messages: convertToModelMessages(messages),
    tools,
  });
  console.log("result", result);
  return result.toUIMessageStreamResponse();
}

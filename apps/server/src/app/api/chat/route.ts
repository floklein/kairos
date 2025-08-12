import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { tools } from "@/lib/tools";

export const maxDuration = 30;

const system = `You are a helpful assistant that resides in the user's browser as an extension.
The user will most certainly ask you questions about the page they are currently on.
You can use tools to gain context on the user's demands.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log("received messages", messages);
  const result = streamText({
    model: openai("gpt-5-nano"),
    messages: convertToModelMessages(messages),
    tools,
    system,
  });
  console.log("result", result);
  return result.toUIMessageStreamResponse();
}

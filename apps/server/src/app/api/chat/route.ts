import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { tools } from "@/lib/tools";

export const maxDuration = 30;

const system = `You are an AI assistant running inside a Chrome browser extension's side panel.
Your purpose is to help the user by reading, analyzing, and interacting with the current web page they are viewing.

To interact with the page, you must use the provided tool functions, which can:
- Retrieve the full HTML of the current page
- Retrieve the text content of the current page, for simple information gathering
- Simulate user actions such as clicking

When the user requests information about the page or an action to perform on it:
1. Decide which tool(s) to call to achieve the goal.
2. Provide clear, specific selectors or instructions to the tool.
3. Wait for the tool's response before continuing reasoning.

Always:
- Analyze the page's HTML or text content to understand user's context
- Avoid assumptions about the page structure without first inspecting it
- Be explicit about which elements to target (use precise CSS selectors)

Your goal: Assist the user efficiently by combining reasoning with the ability to read and manipulate the current page through tool calls.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log("received messages", messages);
  const result = streamText({
    model: openai("gpt-5-nano"),
    messages: convertToModelMessages(messages),
    tools,
    system,
    temperature: 0,
  });
  console.log(new Date(), "result", result);
  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error(new Date(), "error", error);
      if (!error) {
        return "Unknown error";
      }
      if (typeof error === "string") {
        return error;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return JSON.stringify(error);
    },
  });
}

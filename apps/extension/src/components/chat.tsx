import { useChat } from "@ai-sdk/react";
import { Readability } from "@mozilla/readability";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import DOMPurify from "dompurify";
import { useState } from "react";
import type { UITools } from "server/src/lib/tools";
import type {
  ClickElementMessage,
  ClickElementResponse,
  NavigateToMessage,
  NavigateToResponse,
  ReadPageMessage,
  ReadPageResponse,
} from "@/background/main";
import { Textarea } from "@/components/ui/textarea";
import { parts } from "@/lib/chat";
import { sendMessageAsync } from "@/lib/chrome";
import { cn } from "@/lib/utils";

export function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, addToolResult } = useChat<
    UIMessage<unknown, UIDataTypes, UITools>
  >({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_SERVER_URL}/api/chat`,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) {
        return;
      }
      if (toolCall.toolName === "readPageText") {
        const { page } = await sendMessageAsync<
          ReadPageMessage,
          ReadPageResponse
        >({
          type: "READ_PAGE",
        });
        if (!page) {
          return;
        }
        const text = new Readability(
          new DOMParser().parseFromString(page, "text/html"),
        ).parse()?.textContent;
        addToolResult({
          tool: "readPageText",
          toolCallId: toolCall.toolCallId,
          output: text ?? "Error reading page",
        });
      } else if (toolCall.toolName === "readPageHtml") {
        const { page } = await sendMessageAsync<
          ReadPageMessage,
          ReadPageResponse
        >({
          type: "READ_PAGE",
        });
        if (!page) {
          return;
        }
        const html = DOMPurify.sanitize(page, {
          ALLOWED_ATTR: [
            "href",
            "src",
            "alt",
            "title",
            "role",
            "id",
            "name",
            "type",
            "value",
            "placeholder",
          ],
        }).replace(/\s+/g, " ");
        addToolResult({
          tool: "readPageHtml",
          toolCallId: toolCall.toolCallId,
          output: html,
        });
      } else if (toolCall.toolName === "clickElement") {
        const { success } = await sendMessageAsync<
          ClickElementMessage,
          ClickElementResponse
        >({
          type: "CLICK_ELEMENT",
          selector: toolCall.input.selector,
        });
        addToolResult({
          tool: "clickElement",
          toolCallId: toolCall.toolCallId,
          output: { success },
        });
      } else if (toolCall.toolName === "navigateTo") {
        const { success } = await sendMessageAsync<
          NavigateToMessage,
          NavigateToResponse
        >({
          type: "NAVIGATE_TO",
          url: toolCall.input.url,
        });
        addToolResult({
          tool: "navigateTo",
          toolCallId: toolCall.toolCallId,
          output: { success },
        });
      }
    },
  });

  console.log("messages", messages);

  return (
    <div className="flex h-svh flex-col overflow-hidden text-base">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2 whitespace-pre-wrap",
                message.role === "user" &&
                  "max-w-[80%] self-end rounded-lg bg-accent px-3 py-2",
              )}
            >
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <p key={part.type + index}>{part.text}</p>;
                }
                if (part.type === "reasoning") {
                  return (
                    <p
                      key={part.type + index}
                      className={cn(
                        "text-muted-foreground text-xs",
                        part.state === "streaming" && "animate-pulse",
                      )}
                    >
                      {part.state === "streaming"
                        ? "Reasoning..."
                        : "Reasoned."}
                    </p>
                  );
                }
                if (
                  part.type === "tool-readPageText" ||
                  part.type === "tool-readPageHtml" ||
                  part.type === "tool-clickElement" ||
                  part.type === "tool-navigateTo"
                ) {
                  return (
                    <p
                      key={part.toolCallId}
                      className={cn(
                        "text-muted-foreground text-xs",
                        part.state === "output-error" && "text-destructive",
                        (part.state === "input-streaming" ||
                          part.state === "input-available") &&
                          "animate-pulse",
                      )}
                    >
                      {parts[part.type][part.state]}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 pb-4">
        <Textarea
          placeholder="Ask anything about this page..."
          className="resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage({ text: input });
              setInput("");
            }
          }}
        />
      </div>
    </div>
  );
}

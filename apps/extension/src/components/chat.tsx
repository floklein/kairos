import { useChat } from "@ai-sdk/react";
import { Readability } from "@mozilla/readability";
import {
  DefaultChatTransport,
  type InferUITools,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import DOMPurify from "dompurify";
import { useState } from "react";
import type { Tools } from "server/src/lib/tools";
import { Textarea } from "@/components/ui/textarea";
import { readPage } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, addToolResult } = useChat<
    UIMessage<unknown, UIDataTypes, InferUITools<Tools>>
  >({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_SERVER_URL}/api/chat`,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "readPageText") {
        const page = await readPage();
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
        const page = await readPage();
        if (!page) {
          return;
        }
        const html = DOMPurify.sanitize(page, {
          ALLOWED_ATTR: ["href"],
          ALLOW_ARIA_ATTR: false,
          ALLOW_DATA_ATTR: false,
        }).replace(/\s+/g, " ");
        addToolResult({
          tool: "readPageHtml",
          toolCallId: toolCall.toolCallId,
          output: html,
        });
      }
    },
  });

  console.log(messages);

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
                if (part.type === "tool-readPageText") {
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
                      {
                        {
                          "input-streaming": "Preparing to read page...",
                          "input-available": "Reading page...",
                          "output-available": "Page read.",
                          "output-error": "Error reading page.",
                        }[part.state]
                      }
                    </p>
                  );
                }
                if (part.type === "tool-readPageHtml") {
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
                      {
                        {
                          "input-streaming": "Preparing to analyze page...",
                          "input-available": "Analyzing page...",
                          "output-available": "Page analyzed.",
                          "output-error": "Error analyzing page.",
                        }[part.state]
                      }
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
          placeholder="Enter your text here"
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

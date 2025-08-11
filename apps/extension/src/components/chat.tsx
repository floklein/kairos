import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type InferUITools,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { useState } from "react";
import type { Tools } from "server/src/lib/tools";
import type { ReadPageMessage, ReadPageResponse } from "@/background/main";
import { Textarea } from "@/components/ui/textarea";
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
      if (toolCall.toolName === "readPage") {
        try {
          const onReadPage = (response: ReadPageResponse) => {
            if (response.type === "READ_PAGE_RESPONSE") {
              addToolResult({
                tool: "readPage",
                toolCallId: toolCall.toolCallId,
                output: response.page,
              });
            }
            chrome.runtime.onMessage.removeListener(onReadPage);
          };
          chrome.runtime.onMessage.addListener(onReadPage);
          chrome.runtime.sendMessage<ReadPageMessage>({
            type: "READ_PAGE",
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
  });

  return (
    <div className="flex h-svh flex-col p-4 text-base">
      <div className="flex flex-1 flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col gap-2 whitespace-pre-wrap",
              message.role === "user" &&
                "max-w-[80%] self-end rounded-lg bg-accent px-3 py-2",
            )}
          >
            {message.parts.map((part) => {
              switch (part.type) {
                case "text":
                  return <p key={part.text}>{part.text}</p>;
                case "tool-readPage":
                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <p
                          key={part.toolCallId}
                          className="text-muted-foreground text-sm"
                        >
                          Preparing to read page...
                        </p>
                      );
                    case "input-available":
                      return (
                        <p
                          key={part.toolCallId}
                          className="text-muted-foreground text-sm"
                        >
                          Reading page...
                        </p>
                      );
                    case "output-available":
                      return (
                        <p
                          key={part.toolCallId}
                          className="text-muted-foreground text-sm"
                        >
                          Page read.
                        </p>
                      );
                    case "output-error":
                      return (
                        <p
                          key={part.toolCallId}
                          className="text-destructive text-sm"
                        >
                          Error reading page: {part.errorText}
                        </p>
                      );
                  }
                  break;
                default:
                  return null;
              }
            })}
          </div>
        ))}
      </div>
      <div>
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

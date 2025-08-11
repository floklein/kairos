import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_SERVER_URL}/api/chat`,
    }),
  });

  return (
    <div className="flex h-svh flex-col">
      <div className="flex-1">
        {messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part) => {
              if (part.type === "text") {
                return <div key={part.text}>{part.text}</div>;
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
        />
        <Button onClick={() => sendMessage({ text: input })}>Click me</Button>
      </div>
    </div>
  );
}

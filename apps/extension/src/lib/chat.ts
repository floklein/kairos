import type { InferUITools, ToolUIPart } from "ai";
import type { Tools } from "server/src/lib/tools";

type Part = ToolUIPart<InferUITools<Tools>>;

export const parts: Record<Part["type"], Record<Part["state"], string>> = {
  "tool-readPageText": {
    "input-streaming": "Preparing to read page...",
    "input-available": "Reading page...",
    "output-available": "Page read.",
    "output-error": "Error reading page.",
  },
  "tool-readPageHtml": {
    "input-streaming": "Preparing to analyze page...",
    "input-available": "Analyzing page...",
    "output-available": "Page analyzed.",
    "output-error": "Error analyzing page.",
  },
};

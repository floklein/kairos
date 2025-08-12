import type { InferUITools } from "ai";
import { z } from "zod";

export const tools = {
  readPageHtml: {
    description:
      "Reads the browser's current page and return the HTML content. Use this tool most of the time, especially when you are planning to interact with the page.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  readPageText: {
    description:
      "Reads the page as text. Only use this tool when the user asks for simple information.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  clickElement: {
    description:
      "Clicks on a specific element on the page. Use this tool to interact with the page. Input the CSS selector of the element to click.",
    inputSchema: z.object({
      selector: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
  },
  navigateTo: {
    description:
      "Navigates to a specific URL. Use this tool to navigate to a different page.",
    inputSchema: z.object({
      url: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
  },
};

export type Tools = typeof tools;
export type UITools = InferUITools<Tools>;

import { z } from "zod";

export const tools = {
  readPageText: {
    description: "Read the browser's current page and return the text content",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  readPageHtml: {
    description: "Read the browser's current page and return the HTML content",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
};

export type Tools = typeof tools;

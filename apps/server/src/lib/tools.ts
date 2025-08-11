import { z } from "zod";

export const tools = {
  readPage: {
    description: "Read the browser's current page",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
};

export type Tools = typeof tools;

import { z } from "zod";

export const searchWebTool = {
  description:
    "Search the web for current information, statistics, news, or facts. Use this when answering questions requires information you don't have.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }: { query: string }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return "Search is not configured. Please set the TAVILY_API_KEY environment variable.";
    }

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: 5,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!res.ok) {
        return `Search failed: ${res.statusText}`;
      }

      const data = await res.json();

      const results = data.results || [];
      if (results.length === 0) {
        return data.answer || "No results found.";
      }

      const answer = data.answer
        ? `${data.answer}\n\n`
        : "";

      const snippets = results
        .slice(0, 4)
        .map(
          (r: { url: string; title: string; content: string }) =>
            `- ${r.title}: ${r.content?.slice(0, 300)}...`,
        )
        .join("\n");

      return `${answer}Sources:\n${snippets}`.slice(0, 4000);
    } catch (err) {
      return `Search error: ${err instanceof Error ? err.message : "Unknown error"}`;
    }
  },
};

export const readWebsiteTool = {
  description:
    "Read the content of a specific website URL. Use this to get detailed information from a webpage the user references or that you found in search results. Return a brief summary of the key information relevant to the user's question.",
  inputSchema: z.object({
    url: z.string().describe("The URL of the website to read"),
  }),
  execute: async ({ url }: { url: string }) => {
    try {
      const res = await fetch(`https://r.jina.ai/${url}`, {
        headers: { "X-Return-Format": "text" },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return `Failed to read website: ${res.statusText}`;
      }

      const text = await res.text();
      return text.slice(0, 3000);
    } catch (err) {
      return `Failed to read website: ${err instanceof Error ? err.message : "Unknown error"}`;
    }
  },
};



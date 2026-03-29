import { MODEL } from "@/lib/constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";
import { jsonSchema } from "@ai-sdk/provider-utils";
import { readFileSync } from "fs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

function extractText(
  parts: Array<{ type: string; text?: string }> | undefined,
): string {
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text || "")
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uiMessages: Array<{
      role: string;
      parts: Array<{ type: string; text?: string }>;
    }> = body.messages;

    const cookieStore = await cookies();
    const websiteSummaryCookie = cookieStore.get("website_summary");
    const businessContext = websiteSummaryCookie
      ? JSON.parse(websiteSummaryCookie.value)
      : null;

    const skillPath = join(process.cwd(), "skills", "BUSINESS-GROWTH.md");
    const skillContent = readFileSync(skillPath, "utf-8").slice(0, 5000);

    const systemPrompt = `You are a sharp, no-BS business growth advisor. Follow the frameworks in the rulebook below precisely.

User's Business:
${businessContext?.goal ? `Goal: ${businessContext.goal}` : ""}
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}
${businessContext?.full ? `Summary: ${businessContext.full}` : ""}

Rulebook:
${skillContent}

Rules:
- Keep responses concise. No fluff, no hedging, no preamble.
- Name the framework when applying it.
- If the question is off-topic, respond with: "I focus on business growth. What's your growth challenge?"
- Give ONE specific action or insight, not a list.
- If you need current information, statistics, or facts you don't have, use the search_web tool.
- If you need to read a specific website for details, use the read_website tool.
- When a tool returns information, use that information to answer the user's question directly and concisely.`;

    const modelMessages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = uiMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: extractText(msg.parts),
    }));

    const tools = {
      search_web: {
        description:
          "Search the web for current information. Use when answering questions requires information you don't have.",
        inputSchema: jsonSchema({
          type: "object",
          properties: {
            query: { type: "string", description: "The search query" },
          },
          required: ["query"],
        }),
        execute: async ({ query }: { query: string }) => {
          const apiKey = process.env.TAVILY_API_KEY;
          if (!apiKey) {
            return "Search is not configured. Please set TAVILY_API_KEY.";
          }
          try {
            const res = await fetch("https://api.tavily.com/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                api_key: apiKey,
                query,
                max_results: 3,
                include_answer: true,
              }),
            });
            if (!res.ok) return `Search failed: ${res.statusText}`;
            const data = await res.json();
            const results = data.results || [];
            if (results.length === 0)
              return data.answer || "No results found.";
            return `${data.answer || ""}\n\nSources:\n${results
              .slice(0, 3)
              .map(
                (r: { url: string; title: string; content: string }) =>
                  `- ${r.title}: ${r.content?.slice(0, 200)}`,
              )
              .join("\n")}`.slice(0, 3000);
          } catch (err) {
            return `Search error: ${err instanceof Error ? err.message : "Unknown"}`;
          }
        },
      },
      read_website: {
        description:
          "Read the content of a website URL. Use this to get detailed information from a webpage.",
        inputSchema: jsonSchema({
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the website to read",
            },
          },
          required: ["url"],
        }),
        execute: async ({ url }: { url: string }) => {
          try {
            const res = await fetch(`https://r.jina.ai/${url}`, {
              headers: { "X-Return-Format": "text" },
              signal: AbortSignal.timeout(15000),
            });
            if (!res.ok)
              return `Failed to read website: ${res.statusText}`;
            const text = await res.text();
            return text.slice(0, 3000);
          } catch (err) {
            return `Failed to read: ${err instanceof Error ? err.message : "Unknown"}`;
          }
        },
      },
    };

    let iteration = 0;
    const maxIterations = 5;
    let finalText = "";
    let lastMessages = modelMessages;

    while (iteration < maxIterations) {
      iteration++;

      const streamResult = streamText({
        model: openrouter(MODEL),
        system: systemPrompt,
        messages: lastMessages,
        maxOutputTokens: 16000,
        tools,
      });

      let currentText = "";
      let hasToolCalls = false;

      for await (const chunk of streamResult.fullStream) {
        if (chunk.type === "text-delta") {
          currentText += chunk.text;
        }
        if (chunk.type === "tool-call") {
          hasToolCalls = true;
        }
      }

      const toolCallsResult = await streamResult.toolCalls;
      const toolCalls = toolCallsResult || [];
      finalText = currentText;

      if (toolCalls.length === 0) {
        break;
      }

      for (const toolCall of toolCalls) {
        const toolName = toolCall.toolName as string;
        const rawInput = (toolCall as { input?: unknown }).input;

        let args: Record<string, unknown> = {};
        if (typeof rawInput === "string") {
          try {
            args = JSON.parse(rawInput);
          } catch {
            args = { input: rawInput };
          }
        } else if (rawInput && typeof rawInput === "object") {
          args = rawInput as Record<string, unknown>;
        }

        const tool = tools[toolName as keyof typeof tools];
        if (!tool) continue;

        let toolResult = "";
        try {
          toolResult = (await (tool.execute as (args: Record<string, unknown>) => Promise<string>)(args)) as string;
        } catch (err) {
          toolResult = `Tool error: ${err instanceof Error ? err.message : "Unknown"}`;
        }

        lastMessages = [
          ...lastMessages,
          { role: "assistant" as const, content: currentText },
          {
            role: "user" as const,
            content: `[tool: ${toolName}]\nInput: ${JSON.stringify(args)}\n\nResult:\n${toolResult}`,
          },
        ];
      }
    }

    const result = streamText({
      model: openrouter(MODEL),
      system: systemPrompt,
      messages: lastMessages,
      maxOutputTokens: 16000,
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[CHAT]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}

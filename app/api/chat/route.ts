import { MODEL } from "@/lib/constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { isTextUIPart, streamText, type TextUIPart, type UIMessage } from "ai";
import { readFileSync } from "fs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

function extractTextFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((part): part is TextUIPart => isTextUIPart(part))
    .map((part) => part.text)
    .join("");
}

function convertUIMessageToModelMessage(uiMessage: UIMessage) {
  return {
    role: uiMessage.role,
    content: extractTextFromParts(uiMessage.parts),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uiMessages: UIMessage[] = body.messages;

    const cookieStore = await cookies();
    const websiteSummaryCookie = cookieStore.get("website_summary");
    const businessContext = websiteSummaryCookie
      ? JSON.parse(websiteSummaryCookie.value)
      : null;

    const skillPath = join(process.cwd(), "skills", "BUSINESS-GROWTH.md");
    const skillContent = readFileSync(skillPath, "utf-8");

    const systemPrompt = `You are a sharp, no-BS business growth advisor. Follow the frameworks in the rulebook below precisely.

User's Business:
${businessContext?.goal ? `Goal: ${businessContext.goal}` : ""}
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}
${businessContext?.full ? `Summary: ${businessContext.full}` : ""}

Rulebook:
${skillContent}

Rules:
- Keep responses to 2-4 sentences max. No fluff, no hedging, no preamble.
- Name the framework when applying it.
- If the question is off-topic, respond with: "I focus on business growth. What's your growth challenge?"
- Give ONE specific action or insight, not a list.`;

    const messages = uiMessages.map(convertUIMessageToModelMessage);

    const result = streamText({
      model: openrouter(MODEL),
      system: systemPrompt,
      messages,
      maxOutputTokens: 7000,
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

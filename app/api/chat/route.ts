import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, type UIMessage, type TextUIPart, isTextUIPart } from "ai";
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

    const systemPrompt = `You are a business growth advisor. Use the following expert frameworks when advising on business growth topics:

${skillContent}

---

Current User's Business:
${businessContext?.goal ? `Goal: ${businessContext.goal}` : ""}
${businessContext?.industry ? `Industry: ${businessContext.industry}` : ""}
${businessContext?.full ? `Summary: ${businessContext.full}` : ""}

When asked about business growth topics, provide specific, actionable advice grounded in these frameworks. Name the framework when using it (e.g., "According to Paul Graham's growth framework...").

For unrelated questions: "I'm focused strictly on business growth. Let me know what you're trying to grow."

Be specific. Give one key action, not ten.`;

    const messages = uiMessages.map(convertUIMessageToModelMessage);

    const result = streamText({
      model: openrouter("anthropic/claude-3-5-sonnet"),
      system: systemPrompt,
      messages,
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

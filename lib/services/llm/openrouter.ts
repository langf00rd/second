import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface WebsiteSummary {
  goal: string;
  full: string;
}

export async function summarizeWebsiteContent(
  content: string,
  options: { model?: string } = {},
): Promise<WebsiteSummary> {
  const truncatedContent = content.slice(0, 15000);

  const { text } = await generateText({
    model: openrouter(options.model || "anthropic/claude-3-haiku"),
    system:
      "You are an AI assistant that analyzes website content. Respond with a JSON object containing exactly two fields: 'goal' and 'full'. The 'goal' field should be a concise one-sentence summary in the format: 'You are a [type of business] offering [services] to [target audience]'. The 'full' field should be a 2-3 sentence detailed summary covering what the business/product does, key features, and unique value propositions. Return ONLY valid JSON.",
    prompt: `Analyze the following website content and provide the goal and full summary in JSON format:\n\n${truncatedContent}`,
    maxOutputTokens: 400,
  });

  try {
    const parsed = JSON.parse(text);
    return {
      goal: parsed.goal || "Unable to generate goal summary.",
      full: parsed.full || text || "No summary generated.",
    };
  } catch {
    return {
      goal: "Unable to generate goal summary.",
      full: text || "No summary generated.",
    };
  }
}

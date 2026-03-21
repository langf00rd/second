import { MODEL } from "@/lib/constants";
import { Question } from "@/lib/types";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface WebsiteSummary {
  goal: string;
  full: string;
  industry: string;
  competitor_keywords: string[];
}

export async function summarizeWebsiteContent(
  content: string,
): Promise<WebsiteSummary> {
  const truncatedContent = content.slice(0, 15000);

  const { text } = await generateText({
    model: openrouter(MODEL),
    system: `
You are an AI assistant that analyzes website content.

Respond with a JSON object containing exactly four fields:
'goal', 'full', 'industry', and 'competitor_keywords'.

- The 'goal' field should be a concise one-sentence summary in the format:
  "You are a [type of business] offering [services] to [target audience]".

- The 'full' field should be a 2-3 sentence detailed summary covering what the business/product does, key features, and unique value propositions.

- The 'industry' field MUST be a short, search-optimized phrase (4–8 words) that describes the business in a way suitable for finding competitors on Google.
  It should work naturally in: "[industry] competitors"

- The 'competitor_keywords' field MUST be an array of 3–5 alternative search phrases people would use to find similar products/services.

Rules:
- Be specific, not generic
- Include core service and use-case where possible
- Avoid vague terms like "platform", "solution", "technology"
- Do NOT exceed 5 keywords
- Each keyword should be 3–8 words
- Make them realistic Google search queries

Examples:
- industry: "event photography services for businesses"
- competitor_keywords: [
  "corporate event photography companies",
  "commercial photography agencies",
  "business event photographers",
  "professional event photography services"
]

Do not return markdown. Return ONLY valid JSON.
`,
    prompt: `Analyze the following website content and provide the structured summary:\n\n${truncatedContent}`,
    maxOutputTokens: 500,
  });

  try {
    const parsed = JSON.parse(text);
    return {
      goal: parsed.goal || "Unable to generate goal summary.",
      full: parsed.full || text || "No summary generated.",
      industry: parsed.industry || "Unknown business category",
      competitor_keywords: Array.isArray(parsed.competitor_keywords)
        ? parsed.competitor_keywords.slice(0, 5)
        : [],
    };
  } catch {
    return {
      goal: "Unable to generate goal summary.",
      full: text || "No summary generated.",
      industry: "Unknown business category",
      competitor_keywords: [],
    };
  }
}

export type QuestionsResponse = {
  questions: Question[];
};

export async function generateRelevantQuestions(summary: {
  goal: string;
  full: string;
}): Promise<QuestionsResponse> {
  const { text } = await generateText({
    model: openrouter(MODEL),
    system: `
You are an AI that selects the most relevant onboarding questions for a business growth system.

Your goal:
- Ask ONLY high-leverage questions that directly impact customer acquisition decisions.
- NEVER exceed 10 questions.
- ALWAYS prioritize these core categories:
  1. who pays
  2. deal size
  3. capacity
  4. acquisition source

You may include conditional questions ONLY if needed:
- location (if unclear)
- priority service (if multiple services exist)
- urgency (if useful for prioritization)

Rules:
- Questions MUST be specific and constrained (no open-ended text questions)
- Use predefined keys only
- Do not return markdown
- Return a JSON object with a "questions" array
- Each question must include: key, question, type, and options if applicable
- Do NOT invent new keys
- Do NOT exceed 5 questions
- Prefer multiple choice, sliders, or number inputs

Available question definitions:

who_pays:
- "Who typically pays you?"
- type: single_select
- options: ["Companies", "Individuals", "Both"]

deal_size:
- "What’s your typical deal size?"
- type: single_select
- options: ["< $100", "$100–$1,000", "$1,000–$10,000", "$10,000+"]

capacity:
- "How many clients can you handle per month?"
- type: number

acquisition_source:
- "How do clients currently find you?"
- type: multi_select
- options: ["Referrals", "Social media", "Outbound", "Marketplaces", "Paid ads", "Not sure"]

location:
- "Where do you primarily operate?"
- type: single_select
- options: ["Local", "National", "Global"]

priority_service:
- "Which service do you want more clients for right now?"
- type: single_select
- options: dynamically inferred (pick top 3 from summary)

urgency:
- "How soon do you need more clients?"
- type: single_select
- options: ["Immediately", "This month", "Just exploring"]

Do not return markdown. Output ONLY valid JSON.
`,
    prompt: `
Business summary:

Goal:
${summary.goal}

Details:
${summary.full}

Based on this, select the most relevant questions.
`,
    maxOutputTokens: 500,
  });

  try {
    const parsed = JSON.parse(text);
    return {
      questions: parsed.questions || [],
    };
  } catch {
    return {
      questions: [],
    };
  }
}

export async function extractCompetitorsFromContent(
  content: string,
  options: { model?: string } = {},
): Promise<Competitor[]> {
  const truncatedContent = content.slice(0, 50000);

  const { text } = await generateText({
    model: openrouter(options.model || "anthropic/claude-3-haiku"),
    system: `
You are an AI that extracts competitor companies from scraped website content.

Your task:
- Identify ONLY real competitor companies explicitly mentioned in the text
- Extract their name and website URL

Rules:
- DO NOT guess or infer competitors
- ONLY include competitors that are clearly mentioned
- Ignore directories, ads, unrelated links, social media, or marketplaces unless they are clearly competitors
- If a company name is mentioned without a URL, ignore it
- If a URL is present without a clear company name, infer the name from the domain
- Normalize URLs (include https:// if missing)
- Remove duplicates

Do not return markdown. Return JSON in this format:
{
  "competitors": [
    { "name": "Company Name", "url": "https://example.com" }
  ]
}

Do not return markdown. Return ONLY valid JSON.
`,
    prompt: `
Extract competitors from the following content:

${truncatedContent}
`,
    maxOutputTokens: 800,
  });

  try {
    const parsed = JSON.parse(text);

    const competitors: Competitor[] = Array.isArray(parsed.competitors)
      ? parsed.competitors
          .filter((c: any) => c?.name && c?.url)
          .map((c: any) => ({
            name: String(c.name).trim(),
            url: normalizeUrl(c.url),
          }))
      : [];

    return dedupeCompetitors(competitors);
  } catch {
    return [];
  }
}

function normalizeUrl(url: string): string {
  try {
    if (!url.startsWith("http")) {
      return `https://${url}`;
    }
    return url;
  } catch {
    return url;
  }
}

function dedupeCompetitors(list: Competitor[]): Competitor[] {
  const seen = new Set<string>();

  return list.filter((c) => {
    const key = c.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type Competitor = {
  name: string;
  url: string;
};

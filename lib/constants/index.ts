import { ProcessStatus } from "../types";

export const MODEL = "meta-llama/llama-3.3-70b-instruct:free"; // anthropic/claude-3-haiku | openai/gpt-oss-120b:free

export const PROCESS_STATUS_DESCRIPTIONS: Record<ProcessStatus, string> = {
  scraping: "Reading your website...",
  extracting_metadata: "Understanding your brand...",
  generating_summary: "Building your profile...",
  fetching_competitors: "Identifying competitors...",
  extracting_competitors: "Sizing up the competition...",
  complete: "You're all set",
  error: "Something went wrong",
};

import { ProcessStatus } from "../types";

export const MODEL = "openai/gpt-oss-20b"; // anthropic/claude-3-haiku

export const PROCESS_STATUS_DESCRIPTIONS: Record<ProcessStatus, string> = {
  scraping: "Reading your website...",
  extracting_metadata: "Understanding your brand...",
  generating_summary: "Building your profile...",
  fetching_competitors: "Identifying competitors...",
  extracting_competitors: "Sizing up the competition...",
  complete: "You're all set",
  error: "Something went wrong",
};

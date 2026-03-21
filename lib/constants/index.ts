import { ProcessStatus } from "../types";

export const MODEL = "openai/gpt-oss-20b"; // anthropic/claude-3-haiku

export const PROCESS_STATUS_DESCRIPTIONS: Record<ProcessStatus, string> = {
  scraping: "Scraping website...",
  extracting_metadata: "Extracting metadata...",
  generating_summary: "Generating summary...",
  fetching_competitors: "Finding competitors...",
  extracting_competitors: "Analyzing competitors...",
  complete: "Analysis complete",
  error: "An error occurred",
};

export interface WebsiteMetadata {
  url: string;
  title?: string;
  description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  favicon?: string;
}

type QuestionKey =
  | "who_pays"
  | "deal_size"
  | "capacity"
  | "acquisition_source"
  | "creativity"
  | "location"
  | "priority_service"
  | "urgency";

export interface Question {
  key: QuestionKey;
  question: string;
  type: "single_select" | "multi_select" | "slider" | "number" | "text";
  options?: string[];
}

export type ProcessStatus =
  | "scraping"
  | "extracting_metadata"
  | "generating_summary"
  | "fetching_competitors"
  | "extracting_competitors"
  | "complete"
  | "error";

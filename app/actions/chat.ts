"use server";

import { cookies } from "next/headers";
import type { Competitor } from "@/lib/services/llm/openrouter";
import type { WebsiteMetadata } from "@/lib/types";

export type WebsiteSummaryData = {
  goal: string;
  full: string;
  industry: string;
  competitorKeywords?: string[];
};

export type WebsiteContextData = {
  metadata: WebsiteMetadata | null;
  url: string;
  llmSummary: WebsiteSummaryData | null;
  competitors: Competitor[];
};

export async function setWebsiteSummaryCookie(
  summary: WebsiteSummaryData,
  context?: WebsiteContextData
) {
  const cookieStore = await cookies();

  const cookieData = {
    ...summary,
    ...(context && {
      metadata: context.metadata,
      url: context.url,
      competitors: context.competitors,
    }),
  };

  cookieStore.set("website_summary", JSON.stringify(cookieData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });
}

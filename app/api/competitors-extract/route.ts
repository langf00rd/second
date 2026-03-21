import {
  extractCompetitorsFromContent,
  type Competitor,
} from "@/lib/services/llm/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websites } = body;

    if (!websites || !Array.isArray(websites)) {
      return NextResponse.json(
        { error: "websites array is required" },
        { status: 400 },
      );
    }

    const allCompetitors: Competitor[] = [];

    for (const website of websites) {
      if (website.content) {
        const competitors = await extractCompetitorsFromContent(website.content);
        allCompetitors.push(...competitors);
      }
    }

    const seen = new Set<string>();
    const deduped = allCompetitors.filter((c) => {
      const key = c.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ data: deduped });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

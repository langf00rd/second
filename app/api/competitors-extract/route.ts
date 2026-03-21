import {
  extractCompetitorsFromContent,
  type Competitor,
} from "@/lib/services/llm/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const competitors: Competitor[] = await extractCompetitorsFromContent(content);
    return NextResponse.json({ data: competitors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

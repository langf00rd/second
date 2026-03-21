import {
  generateRelevantQuestions,
  type QuestionsResponse,
} from "@/lib/services/llm/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary } = body;

    if (!summary || !summary.goal || !summary.full) {
      return NextResponse.json(
        { error: "Summary with goal and full fields is required" },
        { status: 400 },
      );
    }

    const questions: QuestionsResponse =
      await generateRelevantQuestions(summary);
    return NextResponse.json({ data: questions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

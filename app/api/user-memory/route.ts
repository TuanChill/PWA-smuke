import { NextResponse } from "next/server";
import { explainMemoryForRanking, readStructuredUserMemory } from "@/lib/llm/memory-reader";

export async function GET() {
  return NextResponse.json({
    memory: readStructuredUserMemory(),
    llmReadable: explainMemoryForRanking()
  });
}

import { NextResponse } from "next/server";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";

export async function GET() {
  const cards = memoryStore.getFeedQueue().length > 0 ? memoryStore.getFeedQueue() : refreshFeedQueue();
  return NextResponse.json({ cards });
}

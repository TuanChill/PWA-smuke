import { NextResponse } from "next/server";
import { refreshFeedQueue } from "@/lib/ranking/ranker";

export async function POST() {
  return NextResponse.json({ cards: refreshFeedQueue() });
}

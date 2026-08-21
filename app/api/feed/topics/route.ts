import { NextResponse } from "next/server";
import { fetchFeedTopics } from "@/lib/feed/feed-api";

export async function GET() {
  const topics = await fetchFeedTopics();
  return NextResponse.json({ topics });
}

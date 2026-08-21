import { NextRequest, NextResponse } from "next/server";
import { fetchFeedCards } from "@/lib/feed/feed-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicSlug = searchParams.get("topicSlug") || undefined;
  const sort = (searchParams.get("sort") as any) || "for-you";
  const page = Number(searchParams.get("page") ?? 1) || 1;
  const limit = Number(searchParams.get("limit") ?? 15) || 15;

  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    req.cookies.get("smuke_token")?.value;

  const result = await fetchFeedCards({
    page,
    limit,
    topicSlug,
    sort,
    token: token || undefined,
  });

  return NextResponse.json(result);
}

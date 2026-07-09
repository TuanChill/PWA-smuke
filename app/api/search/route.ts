import { NextResponse } from "next/server";
import { z } from "zod";
import { rankSearchResults } from "@/lib/ranking/search-ranker";
import { memoryStore } from "@/lib/store/memory-store";
import { refreshFeedQueue } from "@/lib/ranking/ranker";

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  sessionId: z.string().optional()
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = searchSchema.parse({
    q: url.searchParams.get("q"),
    sessionId: url.searchParams.get("sessionId") ?? undefined
  });
  return handleSearch(parsed.q, parsed.sessionId);
}

export async function POST(request: Request) {
  const body = searchSchema.parse(await request.json());
  return handleSearch(body.q, body.sessionId);
}

function handleSearch(query: string, sessionId = "session_demo") {
  memoryStore.addUserEvent({
    userId: memoryStore.getUser().id,
    sessionId,
    eventType: "search_query",
    entityType: "search",
    entityId: query,
    topics: extractQueryTopics(query),
    value: 1.5,
    metadata: { query }
  });
  refreshFeedQueue();
  const results = rankSearchResults(query, memoryStore.listArticles(), memoryStore.getMemorySnapshot()).slice(0, 30);
  return NextResponse.json({ query, results });
}

function extractQueryTopics(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9-]/g, ""))
    .filter((term) => term.length > 2)
    .slice(0, 8);
}

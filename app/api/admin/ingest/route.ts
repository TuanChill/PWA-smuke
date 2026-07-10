import { NextResponse } from "next/server";
import { fetchMockSource } from "@/lib/ingestion/mock-source";
import { ingestCredibleSources, type IngestMode } from "@/lib/ingestion/live-source";
import { processRawItem } from "@/lib/ingestion/normalise";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";
import { requireAdminToken } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData().catch(() => undefined);
  const mode = (formData?.get("mode")?.toString() ?? "live") as IngestMode;

  if (mode === "mock") {
    const rawItems = fetchMockSource();
    const articles = await Promise.all(rawItems.map(processRawItem));
    articles.forEach((article) => memoryStore.upsertArticle(article));
    refreshFeedQueue();

    return NextResponse.json({ ok: true, mode, rawCount: rawItems.length, acceptedCount: rawItems.length, storedCount: articles.length, articles });
  }

  const result = await ingestCredibleSources(mode);
  refreshFeedQueue();

  return NextResponse.json({ ok: true, mode, ...result });
}

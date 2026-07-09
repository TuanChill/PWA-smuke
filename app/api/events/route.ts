import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";
import { userEventInputSchema, withDefaultEventValue } from "@/lib/tracking/event-validator";
import { refreshFeedQueue } from "@/lib/ranking/ranker";

export async function GET() {
  return NextResponse.json({ events: memoryStore.listUserEvents().slice(-100).reverse() });
}

export async function POST(request: Request) {
  const parsed = withDefaultEventValue(userEventInputSchema.parse(await request.json()));
  const userId = parsed.userId ?? memoryStore.getUser().id;

  const event = memoryStore.addUserEvent({
    userId,
    sessionId: parsed.sessionId,
    eventType: parsed.eventType,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    topics: parsed.topics,
    sourceId: parsed.sourceId,
    value: parsed.value,
    metadata: parsed.metadata
  });

  refreshFeedQueue();
  return NextResponse.json({ ok: true, event, memory: memoryStore.getMemorySnapshot() });
}

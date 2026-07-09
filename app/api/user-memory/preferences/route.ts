import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";
import { explicitPreferenceInputSchema } from "@/lib/tracking/event-validator";
import { refreshFeedQueue } from "@/lib/ranking/ranker";

export async function POST(request: Request) {
  const body = explicitPreferenceInputSchema.parse(await request.json());
  const updated = memoryStore.updateExplicitTopicPreference(body.topic, body.action);
  memoryStore.addUserEvent({
    userId: memoryStore.getUser().id,
    sessionId: "session_demo",
    eventType: body.action === "mute" ? "mute_topic" : body.action === "boost" ? "follow_topic" : "hide_article",
    entityType: "topic",
    entityId: body.topic,
    topics: [body.topic],
    value: body.action === "boost" ? 5 : body.action === "mute" ? -8 : body.action === "reduce" ? -3 : 0,
    metadata: { explicitPreferenceAction: body.action }
  });
  refreshFeedQueue();
  return NextResponse.json({ ok: true, preference: updated, memory: memoryStore.getMemorySnapshot() });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { interactionWeights } from "@/lib/graph/update";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";
import { interactionTypeSchema } from "@/lib/types";
import type { UserEventType } from "@/lib/tracking/event-types";

function getBackendUrl(): string {
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

const interactSchema = z.object({
  type: interactionTypeSchema,
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = interactSchema.parse(await request.json());
  const article = memoryStore.getArticle(id);

  const userId = memoryStore.getUser()?.id || "user_active";
  const topics = article?.classification?.topicTags || [];
  const sourceName = article?.source?.name || "Feed Source";
  const weight = interactionWeights[body.type] ?? 1;

  // 1. Forward to NestJS Backend if authenticated
  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token) {
    fetch(`${getBackendUrl()}/users/interactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: body.type,
        contentItemId: id,
        topics,
        sourceName,
        weight,
      }),
    }).catch((err) => {
      console.warn("Failed to forward interaction to backend:", err);
    });
  }

  // 2. Update local BFF store for optimistic feed refresh
  const event = memoryStore.addInteraction({
    userId,
    articleId: id,
    type: body.type,
    weight,
  });

  memoryStore.addUserEvent({
    userId,
    sessionId: "session_active",
    eventType: toUserEventType(body.type),
    entityType: body.type === "hide_topic" ? "topic" : "article",
    entityId: id,
    topics,
    sourceId: sourceName,
    value: weight,
    metadata: {
      interactionType: body.type,
      sourceName,
      capturedVia: "article_interact_route",
    },
  });

  refreshFeedQueue();

  return NextResponse.json({ ok: true, event });
}

function toUserEventType(type: z.infer<typeof interactionTypeSchema>): UserEventType {
  const map: Record<z.infer<typeof interactionTypeSchema>, UserEventType> = {
    swipe_left: "swipe_left",
    swipe_right: "swipe_right",
    double_like: "double_like",
    comment: "comment_positive",
    voice_comment: "comment_positive",
    save: "save_article",
    share: "share_article",
    source_click: "source_click",
    long_dwell: "dwell_30s",
    quick_skip: "hide_article",
    hide_source: "hide_article",
    hide_topic: "mute_topic",
  };
  return map[type] || "swipe_right";
}

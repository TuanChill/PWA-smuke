import { NextResponse } from "next/server";
import { z } from "zod";
import { updateGraphFromInteraction, interactionWeights } from "@/lib/graph/update";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";
import { interactionTypeSchema } from "@/lib/types";
import type { UserEventType } from "@/lib/tracking/event-types";

const interactSchema = z.object({
  type: interactionTypeSchema
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = interactSchema.parse(await request.json());
  const article = memoryStore.getArticle(id);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const event = memoryStore.addInteraction({
    userId: memoryStore.getUser().id,
    articleId: id,
    type: body.type,
    weight: interactionWeights[body.type]
  });

  memoryStore.addUserEvent({
    userId: memoryStore.getUser().id,
    sessionId: "session_demo",
    eventType: toUserEventType(body.type),
    entityType: body.type === "hide_topic" ? "topic" : "article",
    entityId: id,
    topics: article.classification.topicTags,
    sourceId: article.source.name,
    value: interactionWeights[body.type],
    metadata: {
      interactionType: body.type,
      sourceName: article.source.name,
      capturedVia: "article_interact_route"
    }
  });

  updateGraphFromInteraction(article, body.type);
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
    hide_topic: "mute_topic"
  };
  return map[type];
}

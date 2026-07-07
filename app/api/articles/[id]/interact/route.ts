import { NextResponse } from "next/server";
import { z } from "zod";
import { updateGraphFromInteraction, interactionWeights } from "@/lib/graph/update";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";
import { interactionTypeSchema } from "@/lib/types";

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

  updateGraphFromInteraction(article, body.type);
  refreshFeedQueue();

  return NextResponse.json({ ok: true, event });
}

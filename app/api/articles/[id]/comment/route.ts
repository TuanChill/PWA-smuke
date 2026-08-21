import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { gateSensitiveSentiment } from "@/lib/privacy/consent";
import { memoryStore } from "@/lib/store/memory-store";

const commentSchema = z.object({
  text: z.string().min(1).max(4000)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = commentSchema.parse(await request.json());
  const article = memoryStore.getArticle(id);

  const userId = memoryStore.getUser()?.id || "user_active";
  const comment = memoryStore.addComment({ userId, articleId: id, text: body.text });
  const ai = getAiProvider();
  
  const topics = article?.classification?.topicTags || [];
  const sourceName = article?.source?.name || "Feed Source";

  const sentiment = gateSensitiveSentiment(
    await ai.extractUserSentiment({ text: body.text, article: article || undefined }),
    memoryStore.getConsents()
  );

  memoryStore.addUserEvent({
    userId,
    sessionId: "session_active",
    eventType: sentiment.stance === "negative" ? "comment_negative" : "comment_positive",
    entityType: "comment",
    entityId: comment.id,
    topics: Array.from(new Set([...topics, ...(sentiment.topics || [])])),
    sourceId: sourceName,
    value: sentiment.stance === "negative" ? -1 : 1,
    metadata: {
      articleId: id,
      sentiment,
      capturedVia: "article_comment_route"
    }
  });

  return NextResponse.json({ ok: true, comment, sentiment });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { updateGraphFromInteraction } from "@/lib/graph/update";
import { gateSensitiveSentiment } from "@/lib/privacy/consent";
import { memoryStore } from "@/lib/store/memory-store";

const commentSchema = z.object({
  text: z.string().min(1).max(4000)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = commentSchema.parse(await request.json());
  const article = memoryStore.getArticle(id);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const comment = memoryStore.addComment({ userId: memoryStore.getUser().id, articleId: id, text: body.text });
  const ai = getAiProvider();
  const sentiment = gateSensitiveSentiment(await ai.extractUserSentiment({ text: body.text, article }), memoryStore.getConsents());

  updateGraphFromInteraction(article, "comment");

  return NextResponse.json({ ok: true, comment, sentiment });
}

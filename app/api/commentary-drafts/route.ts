import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { memoryStore } from "@/lib/store/memory-store";

const draftRequestSchema = z.object({
  articleId: z.string(),
  userComment: z.string().max(4000).optional()
});

export async function GET() {
  return NextResponse.json({ drafts: memoryStore.listDrafts() });
}

export async function POST(request: Request) {
  const body = draftRequestSchema.parse(await request.json());
  const article = memoryStore.getArticle(body.articleId);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  if (!memoryStore.getConsents().consentPersonalisedCommentary) {
    return NextResponse.json({ error: "Personalised commentary consent is disabled" }, { status: 403 });
  }

  const generated = await getAiProvider().generateCommentaryDraft({ article, userComment: body.userComment });
  const draft = memoryStore.addDraft({
    userId: memoryStore.getUser().id,
    articleId: article.id,
    draft: generated.draft,
    rationale: generated.rationale
  });

  return NextResponse.json({ draft });
}

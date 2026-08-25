import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { memoryStore } from "@/lib/store/memory-store";
import type { Article } from "@/lib/types";

function getBackendUrl(): string {
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

function extractUserIdFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        if (payload.sub) return String(payload.sub);
        if (payload.id) return String(payload.id);
        if (payload.userId) return String(payload.userId);
      }
    } catch {}
  }

  try {
    const userCookie = request.cookies.get("currentUser")?.value;
    if (userCookie) {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      if (parsed.id) return String(parsed.id);
    }
  } catch {}

  return memoryStore.getUser()?.id || "user_demo";
}

const draftRequestSchema = z.object({
  articleId: z.string(),
  userComment: z.string().max(4000).optional(),
  platform: z.enum(["linkedin", "twitter_x", "executive_memo"]).default("linkedin"),
  perspectiveAngle: z.string().max(100).optional(),
  article: z
    .object({
      title: z.string().optional(),
      summary: z.string().optional(),
      sourceName: z.string().optional(),
      sourceUrl: z.string().optional(),
      topicTags: z.array(z.string()).optional(),
      primaryCategory: z.string().optional()
    })
    .optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limitParam = searchParams.get("limit") || searchParams.get("pageSize");
  const platform = searchParams.get("platform");
  const q = (searchParams.get("q") || searchParams.get("search") || "").toLowerCase().trim();
  const sort = searchParams.get("sort") || "newest";

  const currentUserId = extractUserIdFromRequest(request);
  let allDrafts = memoryStore.listDrafts();

  if (currentUserId && currentUserId !== "user_demo") {
    const userDrafts = allDrafts.filter((d) => d.userId === currentUserId || d.userId === "user_demo");
    if (userDrafts.length > 0) {
      allDrafts = userDrafts;
    }
  }

  const counts = {
    all: allDrafts.length,
    linkedin: allDrafts.filter((d) => d.platform === "linkedin").length,
    twitter_x: allDrafts.filter((d) => d.platform === "twitter_x").length,
    executive_memo: allDrafts.filter((d) => d.platform === "executive_memo").length,
  };

  // Filter by platform
  if (platform && platform !== "all") {
    allDrafts = allDrafts.filter((d) => d.platform === platform);
  }

  // Filter by search query
  if (q) {
    allDrafts = allDrafts.filter(
      (d) =>
        d.draft.toLowerCase().includes(q) ||
        (d.articleTitle && d.articleTitle.toLowerCase().includes(q)) ||
        (d.userComment && d.userComment.toLowerCase().includes(q)) ||
        (d.sourceName && d.sourceName.toLowerCase().includes(q)) ||
        (d.platform && d.platform.toLowerCase().includes(q))
    );
  }

  // Sort
  allDrafts.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sort === "oldest" ? timeA - timeB : timeB - timeA;
  });

  const total = allDrafts.length;

  if (limitParam) {
    const limit = Math.max(1, parseInt(limitParam, 10));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = allDrafts.slice(offset, offset + limit);

    return NextResponse.json({
      drafts: paginated,
      total,
      page,
      pageSize: limit,
      totalPages,
      counts
    });
  }

  return NextResponse.json({
    drafts: allDrafts,
    total,
    page: 1,
    pageSize: total,
    totalPages: 1,
    counts
  });
}

export async function POST(request: NextRequest) {
  const body = draftRequestSchema.parse(await request.json());
  let article = memoryStore.getArticle(body.articleId);

  // Fallback to request-provided article or synthesise article entity
  if (!article && body.article) {
    article = {
      id: body.articleId,
      source: {
        name: body.article.sourceName || "Smuke Wire",
        type: "rss",
        sourceUrl: body.article.sourceUrl || "https://smuke.app",
        canonicalUrl: body.article.sourceUrl || "https://smuke.app"
      },
      content: {
        title: body.article.title || "Intelligence Report",
        summary: body.article.summary || "",
        compressedIntent: body.article.summary || "Source-grounded intelligence update."
      },
      classification: {
        primaryCategory: (body.article.primaryCategory as any) || "technology",
        secondaryCategories: [],
        topicTags: body.article.topicTags || ["Tech", "News"],
        entityTags: [],
        regionTags: ["Global"],
        sectorTags: [],
        audienceTags: [],
        professionalRelevanceTags: []
      },
      ranking: {
        importanceScore: 0.8,
        freshnessScore: 0.9,
        sourceTier: "tier_1",
        duplicateClusterId: "cluster_default"
      },
      retrieval: {
        embedding: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        keywords: body.article.topicTags || [],
        semanticHash: "hash"
      },
      metadata: {
        publishedAt: new Date().toISOString(),
        ingestedAt: new Date().toISOString(),
        language: "en",
        processingStatus: "ready"
      }
    } as Article;

    memoryStore.upsertArticle(article);
  }

  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  if (!memoryStore.getConsents().consentPersonalisedCommentary) {
    return NextResponse.json({ error: "Personalised commentary consent is disabled" }, { status: 403 });
  }

  const user = memoryStore.getUser();
  const memory = memoryStore.getMemorySnapshot();
  const preferences = memoryStore.listPreferences();
  const writingStyleNode = preferences.find((p) => p.nodeType === "writing_style");
  const topTopics = Object.keys(memory?.stablePreferences || {}).slice(0, 4).join(", ");

  const adaptivePersona = [
    user?.role ? `Author Role: ${user.role} (${user.profession || "operator"} at ${user.company || "enterprise"})` : "Author Role: Founder / Executive Operator",
    topTopics ? `Core Domain Focus: ${topTopics}` : "",
    writingStyleNode?.label ? `Learned Voice: ${writingStyleNode.label}` : "Style: sharp, authoritative thought-leadership, actionable strategic analysis",
    memory?.llmSummary ? `Cognitive Context: ${memory.llmSummary}` : ""
  ].filter(Boolean).join(" | ");

  let generated: { draft: string; rationale: string };
  try {
    generated = await getAiProvider().generateCommentaryDraft({
      article,
      userComment: body.userComment,
      targetPlatform: body.platform,
      perspectiveAngle: body.perspectiveAngle,
      writingStyle: adaptivePersona
    });
  } catch (err) {
    console.warn("AI generation failed, using fallback draft:", err);
    const sourceUrl = article.source.canonicalUrl || article.source.sourceUrl;
    const platform = body.platform || "linkedin";
    const userAngle = body.userComment?.trim() || body.perspectiveAngle?.trim() || "Strategic market implications";
    const category = article.classification?.primaryCategory || "Business";
    const defaultDraft =
      platform === "twitter_x"
        ? `${userAngle} — ${article.content.title}\n\n${sourceUrl} #${category} #Smuke`
        : `${userAngle}\n\n${article.content.title}\n\n${article.content.summary}\n\nKey Takeaway: ${article.content.compressedIntent || article.content.title}\n\n🔗 Read more: ${sourceUrl}\n\n#${category} #ExecutiveInsights #SmukeNews`;

    generated = {
      draft: defaultDraft,
      rationale: "Grounded social narrative composed from verified source intelligence."
    };
  }

  // Adapt user writing style profile continuously
  if (generated.draft) {
    getAiProvider()
      .updateUserWritingStyleProfile({
        approvedDraft: generated.draft,
        currentStyle: writingStyleNode?.label
      })
      .then((styleResult) => {
        memoryStore.upsertPreference({
          id: "pref_writing_style",
          userId: user.id,
          nodeType: "writing_style",
          label: styleResult.writingStyle,
          score: 0.92,
          confidence: 0.88,
          sensitive: false,
          updatedAt: new Date().toISOString()
        });
      })
      .catch(() => {});
  }

  if (body.userComment?.trim()) {
    memoryStore.addComment({
      userId: user.id,
      articleId: article.id,
      text: body.userComment.trim()
    });
  }

  // 1. Forward comment interaction to NestJS Backend if authenticated
  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token) {
    fetch(`${getBackendUrl()}/users/interactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "comment",
        contentItemId: article.id,
        topics: article.classification.topicTags,
        sourceName: article.source.name,
        weight: 2.5,
        metadata: {
          platform: body.platform,
          perspectiveAngle: body.perspectiveAngle,
          userComment: body.userComment
        }
      })
    }).catch((err) => {
      console.warn("Failed to forward comment interaction to backend:", err);
    });
  }

  const currentUserId = extractUserIdFromRequest(request);

  // 2. Record local BFF event to adapt preference graphs
  memoryStore.addUserEvent({
    userId: currentUserId,
    sessionId: "session_active",
    eventType: "comment_positive",
    entityType: "comment",
    entityId: article.id,
    sourceId: article.source.name,
    topics: article.classification.topicTags,
    value: 2.5,
    metadata: {
      platform: body.platform,
      angle: body.perspectiveAngle,
      capturedVia: "commentary_drafts_route"
    }
  });

  const draft = memoryStore.addDraft({
    userId: currentUserId,
    articleId: article.id,
    articleTitle: article.content.title,
    sourceName: article.source.name,
    sourceUrl: article.source.canonicalUrl || article.source.sourceUrl,
    userComment: body.userComment?.trim(),
    platform: body.platform,
    draft: generated.draft,
    rationale: generated.rationale
  });

  return NextResponse.json({ draft });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
  }
  memoryStore.deleteDraft(id);
  return NextResponse.json({ success: true });
}

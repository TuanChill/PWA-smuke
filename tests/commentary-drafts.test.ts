import { describe, expect, it, beforeEach } from "vitest";
import { getAiProvider } from "../lib/ai";
import { memoryStore } from "../lib/store/memory-store";
import type { Article } from "../lib/types";

const mockArticle: Article = {
  id: "test_art_1",
  source: {
    name: "TechCrunch",
    type: "rss",
    sourceUrl: "https://techcrunch.com/2026/08/ai-agents-benchmark",
    canonicalUrl: "https://techcrunch.com/2026/08/ai-agents-benchmark"
  },
  content: {
    title: "New AI Agent Benchmark Reveals Enterprise Adoption Gaps",
    summary: "A new benchmark evaluates autonomous coding agents on enterprise software stacks.",
    compressedIntent: "Enterprise adoption hinges on verified correctness and security boundaries rather than raw benchmark speed."
  },
  classification: {
    primaryCategory: "ai",
    secondaryCategories: ["technology", "startups"],
    topicTags: ["AI", "Enterprise", "Agents", "Benchmarks"],
    entityTags: ["TechCrunch", "AI Benchmark"],
    regionTags: ["Global"],
    sectorTags: ["Software"],
    audienceTags: ["Engineers", "Founders"],
    professionalRelevanceTags: ["Engineering Strategy"]
  },
  ranking: {
    importanceScore: 0.92,
    freshnessScore: 0.95,
    sourceTier: "tier_1",
    duplicateClusterId: "cluster_1"
  },
  retrieval: {
    embedding: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    keywords: ["AI", "Agents"],
    semanticHash: "hash123"
  },
  metadata: {
    publishedAt: "2026-08-25T10:00:00Z",
    ingestedAt: "2026-08-25T10:05:00Z",
    language: "en",
    processingStatus: "ready"
  }
};

describe("AI Social Commentary & Post Drafting", () => {
  const provider = getAiProvider();

  it("generates a LinkedIn post contextualizing user angle and source link", async () => {
    const res = await provider.generateCommentaryDraft({
      article: mockArticle,
      userComment: "Reliability and sandboxing matter 10x more than synthetic benchmarks.",
      targetPlatform: "linkedin"
    });

    expect(res.draft).toBeDefined();
    expect(res.draft).toContain("Reliability and sandboxing matter 10x more");
    expect(res.draft).toContain(mockArticle.content.title);
    expect(res.draft).toContain(mockArticle.source.canonicalUrl);
    expect(res.draft).toContain("#AI");
    expect(res.rationale).toBeDefined();
  });

  it("generates a concise tweet format for Twitter / X with source reference", async () => {
    const res = await provider.generateCommentaryDraft({
      article: mockArticle,
      userComment: "Speed is a vanity metric; correctness is the only moat.",
      targetPlatform: "twitter_x"
    });

    expect(res.draft).toBeDefined();
    expect(res.draft).toContain("Speed is a vanity metric");
    expect(res.draft).toContain(mockArticle.source.canonicalUrl);
    expect(res.draft).toContain("🔗 Source:");
  });

  it("generates an Executive Memo format with strategic bullets", async () => {
    const res = await provider.generateCommentaryDraft({
      article: mockArticle,
      userComment: "Focus capital on governance tooling.",
      targetPlatform: "executive_memo"
    });

    expect(res.draft).toBeDefined();
    expect(res.draft).toContain("EXECUTIVE BRIEF");
    expect(res.draft).toContain("Core Intelligence:");
    expect(res.draft).toContain("Strategic Take: Focus capital on governance tooling.");
    expect(res.draft).toContain(mockArticle.source.canonicalUrl);
  });
});

describe("MemoryStore Drafts and Feedback Event Persistence", () => {
  it("adds, lists, and deletes drafts with user commentary", () => {
    const initialCount = memoryStore.listDrafts().length;

    const draft = memoryStore.addDraft({
      userId: memoryStore.getUser().id,
      articleId: mockArticle.id,
      articleTitle: mockArticle.content.title,
      sourceName: mockArticle.source.name,
      sourceUrl: mockArticle.source.canonicalUrl,
      userComment: "Test user take",
      platform: "linkedin",
      draft: "Sample generated LinkedIn draft",
      rationale: "Sample rationale"
    });

    expect(draft.id).toBeDefined();
    expect(draft.status).toBe("draft");
    expect(draft.articleTitle).toBe(mockArticle.content.title);

    const listAfterAdd = memoryStore.listDrafts();
    expect(listAfterAdd.length).toBe(initialCount + 1);

    const deleteSuccess = memoryStore.deleteDraft(draft.id);
    expect(deleteSuccess).toBe(true);

    const listAfterDelete = memoryStore.listDrafts();
    expect(listAfterDelete.length).toBe(initialCount);
  });

  it("supports pagination and platform filtering in drafts list", () => {
    const d1 = memoryStore.addDraft({
      userId: "user_demo",
      articleId: "art_1",
      articleTitle: "Art 1",
      platform: "linkedin",
      draft: "Draft 1 for LinkedIn",
      rationale: "Rationale 1"
    });
    const d2 = memoryStore.addDraft({
      userId: "user_demo",
      articleId: "art_2",
      articleTitle: "Art 2",
      platform: "twitter_x",
      draft: "Draft 2 for X",
      rationale: "Rationale 2"
    });

    const all = memoryStore.listDrafts();
    expect(all.length).toBeGreaterThanOrEqual(2);

    memoryStore.deleteDraft(d1.id);
    memoryStore.deleteDraft(d2.id);
  });
});

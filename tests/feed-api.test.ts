import { describe, expect, it } from "vitest";
import { fetchFeedCards, fetchFeedTopics, normalizeFeedCard } from "../lib/feed/feed-api";

describe("feed-api normalization", () => {
  it("normalizes backend DTO into full FeedCard structure", () => {
    const raw = {
      id: "item_123",
      title: "AI breakthrough in agents",
      summary: "Autonomous agents achieve new milestone.",
      url: "https://techcrunch.com/ai-agents",
      imageUrl: "https://techcrunch.com/image.jpg",
      tags: ["AI", "Agents"],
      topicName: "AI",
      sourceName: "TechCrunch",
      detectedAt: "2026-08-20T10:00:00.000Z",
      feed: {
        rankScore: 0.95,
        reasonTags: ["Trending in AI", "Fresh intelligence"],
      },
    };

    const card = normalizeFeedCard(raw);
    expect(card.id).toBe("item_123");
    expect(card.content.title).toBe("AI breakthrough in agents");
    expect(card.content.summary).toBe("Autonomous agents achieve new milestone.");
    expect(card.source.name).toBe("TechCrunch");
    expect(card.source.canonicalUrl).toBe("https://techcrunch.com/ai-agents");
    expect(card.feed.rankScore).toBe(0.95);
    expect(card.feed.reasonTags).toEqual(["Trending in AI", "Fresh intelligence"]);
    expect(card.classification.topicTags).toContain("AI");
  });
});

describe("feed-api fallback handling", () => {
  it("falls back to local memory store and returns paginated feed", async () => {
    const res = await fetchFeedCards({ page: 1, limit: 2 });
    expect(res.cards.length).toBeGreaterThan(0);
    expect(res.cards.length).toBeLessThanOrEqual(2);
    expect(res.meta.page).toBe(1);
    expect(res.meta.limit).toBe(2);
    expect(res.meta.total).toBeGreaterThan(0);
  });

  it("filters fallback cards by topicSlug", async () => {
    const res = await fetchFeedCards({ page: 1, limit: 10, topicSlug: "ai" });
    expect(res.cards.length).toBeGreaterThan(0);
    res.cards.forEach((card) => {
      const isMatch =
        card.classification.primaryCategory.toLowerCase() === "ai" ||
        card.classification.topicTags.some((t) => t.toLowerCase() === "ai");
      expect(isMatch).toBe(true);
    });
  });

  it("returns topic list with default topics in fallback mode", async () => {
    const topics = await fetchFeedTopics();
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.some((t) => t.slug === "all")).toBe(true);
    expect(topics.some((t) => t.slug === "ai")).toBe(true);
  });
});

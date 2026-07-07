import { describe, expect, it } from "vitest";
import { interactionWeights } from "../lib/graph/update";
import { gateSensitiveSentiment } from "../lib/privacy/consent";
import { rankArticle } from "../lib/ranking/ranker";
import { defaultConsents, seedArticles, seedPreferences } from "../lib/store/seed";
import { filterAllowedRawItems, isAllowedSourceUrl } from "../lib/ingestion/source-catalog";

describe("ranking", () => {
  it("returns scored feed cards with reason tags", () => {
    const card = rankArticle(seedArticles[0], seedPreferences, 0);
    expect(card.feed.rankScore).toBeGreaterThan(0);
    expect(card.feed.reasonTags.length).toBeGreaterThan(0);
  });
});

describe("credible source filtering", () => {
  it("accepts approved publisher domains and rejects unknown blogs", () => {
    expect(isAllowedSourceUrl("https://www.nytimes.com/2026/07/05/business/example.html")).toBe(true);
    expect(isAllowedSourceUrl("https://random-example-blog.test/markets/hot-take")).toBe(false);
  });

  it("filters raw items before ingestion", () => {
    const filtered = filterAllowedRawItems([
      { title: "Market news", url: "https://www.cnbc.com/markets/", sourceName: "CNBC", sourceType: "rss" },
      { title: "Random post", url: "https://random-example-blog.test/post", sourceName: "Blog", sourceType: "rss" }
    ]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.sourceName).toBe("CNBC");
  });
});

describe("interaction weights", () => {
  it("keeps strong-like heavier than swipe right", () => {
    expect(interactionWeights.double_like).toBeGreaterThan(interactionWeights.swipe_right);
  });
});

describe("consent gating", () => {
  it("removes sensitive labels when sensitive consent is off", () => {
    const gated = gateSensitiveSentiment(
      {
        topics: ["election"],
        entities: [],
        regions: [],
        stance: "positive",
        sentiment: "partisan",
        intent: "public affairs tracking",
        professionalAngle: "policy relevance",
        confidence: 0.8,
        writingStyleSignals: [],
        sensitiveProfileFlag: true,
        sensitiveLabels: ["political_preference"]
      },
      defaultConsents
    );
    expect(gated.sensitiveProfileFlag).toBe(false);
    expect(gated.sensitiveLabels).toEqual([]);
    expect(gated.topics).toContain("policy_interest");
  });
});

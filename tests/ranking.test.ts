import { describe, expect, it } from "vitest";
import { interactionWeights } from "../lib/graph/update";
import { gateSensitiveSentiment } from "../lib/privacy/consent";
import { rankArticle } from "../lib/ranking/ranker";
import { defaultConsents, seedArticles, seedPreferences } from "../lib/store/seed";
import { filterAllowedRawItems, isAllowedSourceUrl } from "../lib/ingestion/source-catalog";
import { applyTopicEvent } from "../lib/preferences/scoring";
import { buildUserMemorySnapshot } from "../lib/preferences/user-profile-builder";
import { rankAds } from "../lib/ranking/ad-ranker";
import { demoAdCampaigns } from "../lib/ads/catalog";

describe("ranking", () => {
  it("returns scored feed cards with reason tags", () => {
    const card = rankArticle(seedArticles[0], seedPreferences, 0);
    expect(card.feed.rankScore).toBeGreaterThan(0);
    expect(card.feed.reasonTags.length).toBeGreaterThan(0);
  });
});

describe("preference memory", () => {
  it("derives short and long memory from raw events", () => {
    const score = applyTopicEvent(undefined, {
      id: "event_1",
      userId: "user_demo",
      sessionId: "session",
      eventType: "save_article",
      entityType: "article",
      entityId: "article_1",
      topics: ["crypto"],
      sourceId: "CoinDesk",
      value: 2.5,
      metadata: {},
      createdAt: new Date().toISOString()
    }, "crypto");

    const snapshot = buildUserMemorySnapshot({
      userId: "user_demo",
      topicScores: [score],
      sourceScores: [],
      consents: { ...defaultConsents, consentMarketingPersonalisation: true }
    });

    expect(snapshot.shortTermIntent.crypto).toBeGreaterThan(0);
    expect(snapshot.adAffinity.crypto).toBeGreaterThan(0);
  });
});

describe("ad ranking", () => {
  it("requires consent and blocks sensitive-free negative preferences", () => {
    const memory = buildUserMemorySnapshot({
      userId: "user_demo",
      topicScores: [
        {
          userId: "user_demo",
          topic: "crypto",
          shortScore: 3,
          mediumScore: 2,
          longScore: 1,
          negativeScore: 0,
          explicit: false,
          muted: false,
          lastUpdatedAt: new Date().toISOString()
        }
      ],
      sourceScores: [],
      consents: { ...defaultConsents, consentMarketingPersonalisation: true }
    });

    expect(rankAds(demoAdCampaigns, memory, false)).toEqual([]);
    expect(rankAds(demoAdCampaigns, memory, true)[0]?.id).toBe("ad_market_data");
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

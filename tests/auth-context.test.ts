import { describe, expect, it } from "vitest";
import { fetchFeedCards } from "../lib/feed/feed-api";

describe("auth integration with feed API", () => {
  it("includes token in options without breaking fallback ranking", async () => {
    const res = await fetchFeedCards({
      page: 1,
      limit: 3,
      token: "mock_jwt_token_123",
      sort: "for-you",
    });

    expect(res.cards).toBeDefined();
    expect(res.cards.length).toBeGreaterThan(0);
    expect(res.meta.page).toBe(1);
  });

  it("handles topic-specific queries with token", async () => {
    const res = await fetchFeedCards({
      page: 1,
      limit: 5,
      topicSlug: "ai",
      token: "mock_jwt_token_123",
    });

    expect(res.cards).toBeDefined();
    expect(res.cards.length).toBeGreaterThan(0);
  });
});

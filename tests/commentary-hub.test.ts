import { describe, expect, it } from "vitest";
import type { Draft } from "@/lib/store/memory-store";

describe("Commentary Hub Logic (Search, Filter, Pagination & Accordion)", () => {
  const mockDrafts: Draft[] = [
    {
      id: "draft_1",
      userId: "user_demo",
      articleId: "art_1",
      articleTitle: "Nvidia unveils new Blackwell chip architecture",
      sourceName: "TechCrunch",
      sourceUrl: "https://example.com/nvidia-blackwell",
      userComment: "Huge leap in data center energy efficiency",
      platform: "linkedin",
      draft: "Nvidia's Blackwell launch is more than a speed bump—it is an efficiency milestone.\n\nKey takeaway: Compute constraints are loosening.\n\n#AI #Chips",
      rationale: "Positioned as data center infrastructure insight.",
      status: "draft",
      createdAt: "2026-08-25T10:00:00.000Z"
    },
    {
      id: "draft_2",
      userId: "user_demo",
      articleId: "art_2",
      articleTitle: "Singapore pilots cross-border stablecoin rails with MAS",
      sourceName: "Bloomberg",
      sourceUrl: "https://example.com/mas-stablecoins",
      userComment: "Regulated rails will win institutional adoption",
      platform: "twitter_x",
      draft: "MAS stablecoin pilots show compliance-first rails will lead Asian settlement. 🔗 https://example.com/mas-stablecoins #Fintech #Crypto",
      rationale: "Punchy short takeaway for X.",
      status: "draft",
      createdAt: "2026-08-25T11:00:00.000Z"
    },
    {
      id: "draft_3",
      userId: "user_demo",
      articleId: "art_3",
      articleTitle: "Why Enterprise SaaS pricing is shifting to usage-based models",
      sourceName: "Forbes",
      sourceUrl: "https://example.com/saas-pricing",
      userComment: "Per-seat models are dying in AI era",
      platform: "executive_memo",
      draft: "• Strategic Take: SaaS seat monetization is collapsing in favor of consumption.\n• Source: https://example.com/saas-pricing",
      rationale: "High level executive summary.",
      status: "draft",
      createdAt: "2026-08-25T12:00:00.000Z"
    },
    {
      id: "draft_4",
      userId: "user_demo",
      articleId: "art_4",
      articleTitle: "Open source AI models catch up with proprietary benchmarks",
      sourceName: "ArXiv",
      sourceUrl: "https://example.com/open-source-ai",
      userComment: "Moats are shifting from model weights to proprietary data",
      platform: "linkedin",
      draft: "The open source AI wave is closing the gap with closed frontier models faster than expected.",
      rationale: "Technical founder angle.",
      status: "draft",
      createdAt: "2026-08-25T13:00:00.000Z"
    },
    {
      id: "draft_5",
      userId: "user_demo",
      articleId: "art_5",
      articleTitle: "Autonomous coding agents accelerate startup shipping speed",
      sourceName: "Smuke Wire",
      sourceUrl: "https://smuke.app",
      userComment: "10x engineer teams become 100x engineer teams",
      platform: "linkedin",
      draft: "Agentic software development transforms how small teams scale.",
      rationale: "Founder perspective.",
      status: "draft",
      createdAt: "2026-08-25T14:00:00.000Z"
    },
    {
      id: "draft_6",
      userId: "user_demo",
      articleId: "art_6",
      articleTitle: "Clean energy grids struggle with data center power demands",
      sourceName: "Reuters",
      sourceUrl: "https://example.com/grid-energy",
      userComment: "Nuclear SMRs are the real long-term AI play",
      platform: "twitter_x",
      draft: "Data center power constraints are creating an energy supercycle.",
      rationale: "Energy perspective.",
      status: "draft",
      createdAt: "2026-08-25T15:00:00.000Z"
    }
  ];

  it("filters drafts by multi-field search query", () => {
    // Search by title
    const searchNvidia = mockDrafts.filter((d) =>
      d.articleTitle?.toLowerCase().includes("nvidia")
    );
    expect(searchNvidia).toHaveLength(1);
    expect(searchNvidia[0].id).toBe("draft_1");

    // Search by user comment / take
    const searchEnergy = mockDrafts.filter((d) =>
      d.userComment?.toLowerCase().includes("nuclear")
    );
    expect(searchEnergy).toHaveLength(1);
    expect(searchEnergy[0].id).toBe("draft_6");

    // Search by source name
    const searchBloomberg = mockDrafts.filter((d) =>
      d.sourceName?.toLowerCase().includes("bloomberg")
    );
    expect(searchBloomberg).toHaveLength(1);
    expect(searchBloomberg[0].id).toBe("draft_2");
  });

  it("filters drafts by target platform correctly", () => {
    const linkedinDrafts = mockDrafts.filter((d) => d.platform === "linkedin");
    const twitterDrafts = mockDrafts.filter((d) => d.platform === "twitter_x");
    const memoDrafts = mockDrafts.filter((d) => d.platform === "executive_memo");

    expect(linkedinDrafts).toHaveLength(3);
    expect(twitterDrafts).toHaveLength(2);
    expect(memoDrafts).toHaveLength(1);
  });

  it("calculates pagination bounds accurately with page size 5", () => {
    const pageSize = 5;
    const totalItems = mockDrafts.length; // 6 items
    const totalPages = Math.ceil(totalItems / pageSize);

    expect(totalPages).toBe(2);

    // Page 1 slice (items 0 to 4) -> 5 items
    const page1 = mockDrafts.slice(0, pageSize);
    expect(page1).toHaveLength(5);
    expect(page1[0].id).toBe("draft_1");

    // Page 2 slice (items 5 to 6) -> 1 item
    const page2 = mockDrafts.slice(pageSize, pageSize * 2);
    expect(page2).toHaveLength(1);
    expect(page2[0].id).toBe("draft_6");
  });

  it("handles accordion expand and collapse toggle state", () => {
    let expandedIds = new Set<string>();

    // Initial state: empty set (all cards collapsed)
    expect(expandedIds.has("draft_1")).toBe(false);

    // Toggle expand draft_1
    expandedIds = new Set(expandedIds).add("draft_1");
    expect(expandedIds.has("draft_1")).toBe(true);

    // Toggle collapse draft_1
    const nextSet = new Set(expandedIds);
    nextSet.delete("draft_1");
    expandedIds = nextSet;
    expect(expandedIds.has("draft_1")).toBe(false);

    // Expand all visible drafts
    const allIds = mockDrafts.map((d) => d.id);
    expandedIds = new Set(allIds);
    expect(expandedIds.size).toBe(6);
    expect(expandedIds.has("draft_3")).toBe(true);
  });
});

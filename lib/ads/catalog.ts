import type { AdCampaign } from "@/lib/ranking/ad-ranker";

export const demoAdCampaigns: AdCampaign[] = [
  {
    id: "ad_market_data",
    advertiserName: "Atlas Market Data",
    title: "Institutional-grade market data",
    description: "Real-time crypto, macro, and equities dashboards for research teams.",
    targetTopics: ["crypto", "markets", "finance"],
    blockedTopics: ["meme coins"],
    bidValue: 0.7,
    freshnessScore: 0.9,
    regulatoryRisk: 0.05,
    active: true
  },
  {
    id: "ad_ai_infra",
    advertiserName: "Compute Ledger",
    title: "AI infrastructure cost intelligence",
    description: "Track GPU, cloud, and inference costs across vendors.",
    targetTopics: ["ai", "cloud", "infrastructure"],
    blockedTopics: [],
    bidValue: 0.6,
    freshnessScore: 0.8,
    regulatoryRisk: 0.04,
    active: true
  },
  {
    id: "ad_consumer_generic",
    advertiserName: "Generic Deals",
    title: "Generic shopping offer",
    description: "Broad consumer promotion used as a low-relevance baseline.",
    targetTopics: ["shopping"],
    blockedTopics: [],
    bidValue: 0.3,
    freshnessScore: 0.5,
    regulatoryRisk: 0.02,
    active: true
  }
];

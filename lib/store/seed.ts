import type { Article, ConsentSettings, PreferenceNode } from "@/lib/types";

const now = new Date("2026-07-05T08:00:00.000Z").toISOString();

export const demoUser = {
  id: "user_demo",
  email: "demo@smuke.app",
  name: "Demo User",
  role: "founder",
  profession: "operator",
  company: "Smuke Labs"
};

export const defaultConsents: ConsentSettings = {
  consentPreferenceTracking: true,
  consentCommentAnalysis: true,
  consentVoiceTranscription: false,
  consentSensitiveSentimentTracking: false,
  consentPersonalisedCommentary: true,
  consentModelTraining: false,
  consentMarketingPersonalisation: false
};

export const seedArticles: Article[] = [
  {
    id: "article_ai_infra",
    source: {
      name: "Smuke Mock Wire",
      type: "mock",
      sourceUrl: "https://example.com/ai-infrastructure-demand",
      canonicalUrl: "https://example.com/ai-infrastructure-demand"
    },
    content: {
      title: "AI infrastructure demand keeps cloud capacity under pressure",
      summary:
        "Enterprise AI infrastructure demand is still outpacing available cloud capacity, forcing buyers to plan farther ahead. The trend matters for founders and investors because compute access is becoming a strategic constraint.",
      compressedIntent: "Track AI compute scarcity as a strategic constraint for builders, buyers, and investors."
    },
    classification: {
      primaryCategory: "ai",
      secondaryCategories: ["technology", "markets"],
      topicTags: ["AI infrastructure", "cloud capacity"],
      entityTags: ["OpenAI", "Nvidia"],
      regionTags: ["US", "Global"],
      sectorTags: ["AI", "cloud", "semiconductors"],
      audienceTags: ["founders", "investors", "tech executives"],
      professionalRelevanceTags: ["market_moving", "technology_trend", "risk_signal"]
    },
    ranking: {
      importanceScore: 0.88,
      freshnessScore: 0.94,
      sourceTier: "tier_1",
      duplicateClusterId: "cluster_ai_infra"
    },
    retrieval: {
      embedding: [0.9, 0.2, 0.4, 0.8, 0.7, 0.1, 0.6, 0.5, 0.3, 0.4, 0.8, 0.2, 0.1, 0.9, 0.5, 0.7],
      keywords: ["AI", "cloud", "capacity", "Nvidia"],
      semanticHash: "ai_infra_capacity"
    },
    metadata: {
      publishedAt: now,
      ingestedAt: now,
      processedAt: now,
      language: "en",
      processingStatus: "ready"
    }
  },
  {
    id: "article_stablecoin_asia",
    source: {
      name: "Smuke Mock Wire",
      type: "mock",
      sourceUrl: "https://example.com/stablecoin-asia-rails",
      canonicalUrl: "https://example.com/stablecoin-asia-rails"
    },
    content: {
      title: "Stablecoin payment pilots expand across Asia",
      summary:
        "Regulated stablecoin payment pilots are expanding across Asian markets as banks and fintechs test faster settlement rails. The development is relevant to operators watching compliance-led digital asset adoption.",
      compressedIntent: "Monitor regulated stablecoin rails as a business development and market timing signal in Asia."
    },
    classification: {
      primaryCategory: "crypto",
      secondaryCategories: ["finance", "policy"],
      topicTags: ["stablecoins", "regulated payment rails"],
      entityTags: ["MAS"],
      regionTags: ["Asia", "Singapore"],
      sectorTags: ["digital assets", "payments", "finance"],
      audienceTags: ["founders", "investors", "bd leaders"],
      professionalRelevanceTags: ["bd_opportunity", "regulatory_impact", "partnership_relevant"]
    },
    ranking: {
      importanceScore: 0.82,
      freshnessScore: 0.91,
      sourceTier: "tier_1",
      duplicateClusterId: "cluster_stablecoin_asia"
    },
    retrieval: {
      embedding: [0.2, 0.9, 0.8, 0.3, 0.4, 0.6, 0.7, 0.5, 0.8, 0.2, 0.6, 0.9, 0.1, 0.4, 0.7, 0.3],
      keywords: ["stablecoins", "payments", "Asia", "MAS"],
      semanticHash: "stablecoin_asia_rails"
    },
    metadata: {
      publishedAt: now,
      ingestedAt: now,
      processedAt: now,
      language: "en",
      processingStatus: "ready"
    }
  }
];

export const seedPreferences: PreferenceNode[] = [
  {
    id: "pref_ai_infra",
    userId: demoUser.id,
    nodeType: "topic",
    label: "AI infrastructure",
    score: 0.84,
    confidence: 0.78,
    sensitive: false,
    updatedAt: now
  },
  {
    id: "pref_stablecoins",
    userId: demoUser.id,
    nodeType: "topic",
    label: "stablecoins",
    score: 0.76,
    confidence: 0.68,
    sensitive: false,
    updatedAt: now
  },
  {
    id: "pref_mas",
    userId: demoUser.id,
    nodeType: "entity",
    label: "MAS",
    score: 0.7,
    confidence: 0.62,
    sensitive: false,
    updatedAt: now
  }
];

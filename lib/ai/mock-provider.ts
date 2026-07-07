import {
  articleClassificationSchema,
  articleSummarySchema,
  commentaryDraftSchema,
  compressedIntentSchema,
  embeddingSchema,
  entityExtractionSchema,
  importanceScoreSchema,
  sentimentExtractionSchema,
  topicExtractionSchema
} from "@/lib/ai/schemas";
import type { AiProvider, ArticleInput, CommentaryInput } from "@/lib/ai/provider";

const keywordMap = [
  { token: "AI", category: "ai", topics: ["AI infrastructure", "AI agents"], sectors: ["AI", "cloud"] },
  { token: "chip", category: "technology", topics: ["semiconductors"], sectors: ["semiconductors"] },
  { token: "stablecoin", category: "crypto", topics: ["stablecoins"], sectors: ["digital assets"] },
  { token: "market", category: "markets", topics: ["capital markets"], sectors: ["finance"] },
  { token: "regulation", category: "policy", topics: ["regulation"], sectors: ["public policy"] }
] as const;

function profile(input: ArticleInput) {
  const text = `${input.title} ${input.excerpt ?? ""}`;
  const matched = keywordMap.find((item) => text.toLowerCase().includes(item.token.toLowerCase())) ?? keywordMap[0];
  const entities = ["OpenAI", "Nvidia", "MAS", "BlackRock"].filter((entity) =>
    text.toLowerCase().includes(entity.toLowerCase())
  );

  return {
    matched,
    entities: entities.length > 0 ? entities : [input.sourceName],
    regions: text.toLowerCase().includes("singapore") || text.toLowerCase().includes("asia") ? ["Asia", "Singapore"] : ["Global"]
  };
}

function stableEmbedding(seed: string) {
  return Array.from({ length: 16 }, (_, index) => {
    const char = seed.charCodeAt(index % Math.max(seed.length, 1)) || 31;
    return Number((((char * (index + 3)) % 101) / 100).toFixed(2));
  });
}

export const mockAiProvider: AiProvider = {
  async summariseArticle(input) {
    return articleSummarySchema.parse({
      summary: `${input.title} matters because it signals a shift that could affect operators, investors, and policy watchers. Smuke flags it as relevant for users tracking market impact, strategic timing, and second-order consequences.`
    });
  },
  async classifyArticle(input) {
    const { matched } = profile(input);
    return articleClassificationSchema.parse({
      primaryCategory: matched.category,
      secondaryCategories: matched.topics,
      audienceTags: ["founders", "investors", "tech executives"],
      professionalRelevanceTags: ["market_moving", "thought_leadership_angle", "risk_signal"]
    });
  },
  async extractEntities(input) {
    const { entities, regions, matched } = profile(input);
    return entityExtractionSchema.parse({
      entities,
      regions,
      sectors: matched.sectors
    });
  },
  async extractTopics(input) {
    const { matched } = profile(input);
    return topicExtractionSchema.parse({ topics: matched.topics });
  },
  async generateCompressedIntent(input) {
    return compressedIntentSchema.parse({
      compressedIntent: `Track how ${input.title} changes commercial, policy, or strategic priorities for the reader.`
    });
  },
  async scoreImportance(input) {
    const freshnessBoost = input.publishedAt ? 0.08 : 0;
    return importanceScoreSchema.parse({ importanceScore: Math.min(0.92, 0.72 + freshnessBoost) });
  },
  async createArticleEmbedding(input) {
    return embeddingSchema.parse({ embedding: stableEmbedding(input.title) });
  },
  async detectDuplicateArticle(input) {
    const clusterId = `cluster_${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28)}`;
    return { duplicate: false, clusterId };
  },
  async transcribeVoiceComment() {
    return { transcript: "This looks commercially relevant and worth monitoring for follow-up commentary." };
  },
  async extractUserSentiment(input) {
    const lower = input.text.toLowerCase();
    return sentimentExtractionSchema.parse({
      topics: lower.includes("stablecoin") ? ["stablecoins", "regulated payment rails"] : ["market strategy"],
      entities: lower.includes("mas") ? ["MAS"] : [],
      regions: lower.includes("asia") || lower.includes("singapore") ? ["Asia", "Singapore"] : [],
      stance: lower.includes("not") || lower.includes("risk") ? "mixed" : "positive",
      sentiment: lower.includes("bullish") ? "bullish" : "constructive",
      intent: "market opportunity monitoring",
      professionalAngle: "strategic implication for operators and investors",
      confidence: 0.86,
      writingStyleSignals: ["analytical", "market-focused", "concise"],
      sensitiveProfileFlag: lower.includes("election") || lower.includes("party"),
      sensitiveLabels: lower.includes("election") ? ["political_preference"] : []
    });
  },
  async extractUserIntent(input) {
    return { intent: input.text.length > 40 ? "thought leadership development" : "preference signal", confidence: 0.82 };
  },
  async generateCommentaryDraft(input: CommentaryInput) {
    return commentaryDraftSchema.parse({
      draft: `${input.article.content.title} is less about the headline than the direction of travel: ${input.article.content.compressedIntent} The practical question is who can move fastest while the market is still repricing the opportunity.`,
      rationale: "Grounded in the article summary and shaped as concise strategic commentary."
    });
  },
  async updateUserWritingStyleProfile(input) {
    return {
      writingStyle: `${input.currentStyle ?? "concise, analytical"}; reinforces commercial implications and second-order market effects`
    };
  }
};

import { z } from "zod";

export const sourceTypeSchema = z.enum(["api", "rss", "manual", "partner", "mock"]);
export const primaryCategorySchema = z.enum([
  "breaking",
  "business",
  "markets",
  "crypto",
  "ai",
  "technology",
  "startups",
  "policy",
  "geopolitics",
  "finance",
  "culture",
  "science",
  "climate",
  "sports"
]);

export const articleSchema = z.object({
  id: z.string(),
  source: z.object({
    name: z.string(),
    type: sourceTypeSchema,
    sourceUrl: z.string().url(),
    canonicalUrl: z.string().url()
  }),
  content: z.object({
    title: z.string(),
    summary: z.string(),
    compressedIntent: z.string(),
    rawExcerpt: z.string().optional()
  }),
  classification: z.object({
    primaryCategory: primaryCategorySchema,
    secondaryCategories: z.array(z.string()),
    topicTags: z.array(z.string()),
    entityTags: z.array(z.string()),
    regionTags: z.array(z.string()),
    sectorTags: z.array(z.string()),
    audienceTags: z.array(z.string()),
    professionalRelevanceTags: z.array(z.string())
  }),
  ranking: z.object({
    importanceScore: z.number().min(0).max(1),
    freshnessScore: z.number().min(0).max(1),
    sourceTier: z.enum(["tier_1", "tier_2", "tier_3"]),
    duplicateClusterId: z.string()
  }),
  retrieval: z.object({
    embedding: z.array(z.number()),
    keywords: z.array(z.string()),
    semanticHash: z.string()
  }),
  metadata: z.object({
    publishedAt: z.string(),
    ingestedAt: z.string(),
    processedAt: z.string().optional(),
    language: z.string(),
    processingStatus: z.enum(["raw", "processing", "ready", "failed"])
  })
});

export const consentSchema = z.object({
  consentPreferenceTracking: z.boolean(),
  consentCommentAnalysis: z.boolean(),
  consentVoiceTranscription: z.boolean(),
  consentSensitiveSentimentTracking: z.boolean(),
  consentPersonalisedCommentary: z.boolean(),
  consentModelTraining: z.boolean(),
  consentMarketingPersonalisation: z.boolean()
});

export const interactionTypeSchema = z.enum([
  "swipe_left",
  "swipe_right",
  "double_like",
  "comment",
  "voice_comment",
  "save",
  "share",
  "source_click",
  "long_dwell",
  "quick_skip",
  "hide_source",
  "hide_topic"
]);

export const preferenceNodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nodeType: z.enum([
    "topic",
    "entity",
    "source",
    "region",
    "sector",
    "company",
    "person",
    "protocol",
    "asset",
    "professional_interest",
    "objective",
    "writing_style",
    "sentiment_theme",
    "sensitive_sentiment"
  ]),
  label: z.string(),
  score: z.number(),
  confidence: z.number().min(0).max(1),
  sensitive: z.boolean(),
  updatedAt: z.string()
});

export const feedCardSchema = articleSchema.extend({
  feed: z.object({
    rankScore: z.number(),
    reasonTags: z.array(z.string()),
    queuedAt: z.string()
  })
});

export type Article = z.infer<typeof articleSchema>;
export type ConsentSettings = z.infer<typeof consentSchema>;
export type FeedCard = z.infer<typeof feedCardSchema>;
export type InteractionType = z.infer<typeof interactionTypeSchema>;
export type PreferenceNode = z.infer<typeof preferenceNodeSchema>;

import { z } from "zod";
import { primaryCategorySchema } from "@/lib/types";

export const articleSummarySchema = z.object({
  summary: z.string().min(40).max(600)
});

export const articleClassificationSchema = z.object({
  primaryCategory: primaryCategorySchema,
  secondaryCategories: z.array(z.string()).max(6),
  audienceTags: z.array(z.string()).max(8),
  professionalRelevanceTags: z.array(z.string()).max(8)
});

export const entityExtractionSchema = z.object({
  entities: z.array(z.string()).max(16),
  regions: z.array(z.string()).max(10),
  sectors: z.array(z.string()).max(10)
});

export const topicExtractionSchema = z.object({
  topics: z.array(z.string()).max(16)
});

export const compressedIntentSchema = z.object({
  compressedIntent: z.string().min(20).max(300)
});

export const importanceScoreSchema = z.object({
  importanceScore: z.number().min(0).max(1)
});

export const embeddingSchema = z.object({
  embedding: z.array(z.number()).length(16)
});

export const duplicateDetectionSchema = z.object({
  duplicate: z.boolean(),
  clusterId: z.string()
});

export const sentimentExtractionSchema = z.object({
  topics: z.array(z.string()),
  entities: z.array(z.string()),
  regions: z.array(z.string()),
  stance: z.enum(["positive", "negative", "neutral", "mixed"]),
  sentiment: z.string(),
  intent: z.string(),
  professionalAngle: z.string(),
  confidence: z.number().min(0).max(1),
  writingStyleSignals: z.array(z.string()),
  sensitiveProfileFlag: z.boolean(),
  sensitiveLabels: z.array(z.string()).default([])
});

export const commentaryDraftSchema = z.object({
  draft: z.string().min(20).max(3000),
  rationale: z.string().min(5).max(500)
});

export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export type ArticleClassification = z.infer<typeof articleClassificationSchema>;
export type EntityExtraction = z.infer<typeof entityExtractionSchema>;
export type TopicExtraction = z.infer<typeof topicExtractionSchema>;
export type CompressedIntent = z.infer<typeof compressedIntentSchema>;
export type ImportanceScore = z.infer<typeof importanceScoreSchema>;
export type Embedding = z.infer<typeof embeddingSchema>;
export type SentimentExtraction = z.infer<typeof sentimentExtractionSchema>;
export type CommentaryDraft = z.infer<typeof commentaryDraftSchema>;

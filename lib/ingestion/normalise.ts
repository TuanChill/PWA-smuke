import { getAiProvider } from "@/lib/ai";
import type { ArticleInput } from "@/lib/ai/provider";
import type { Article } from "@/lib/types";

export type RawNewsItem = {
  id?: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType?: "api" | "rss" | "manual" | "partner" | "mock";
  excerpt?: string;
  publishedAt?: string;
};

export function canonicaliseUrl(url: string) {
  const parsed = new URL(url);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((param) => parsed.searchParams.delete(param));
  parsed.hash = "";
  return parsed.toString();
}

export async function processRawItem(raw: RawNewsItem): Promise<Article> {
  const ai = getAiProvider();
  const canonicalUrl = canonicaliseUrl(raw.url);
  const input: ArticleInput = {
    title: raw.title,
    sourceName: raw.sourceName,
    url: canonicalUrl,
    excerpt: raw.excerpt,
    publishedAt: raw.publishedAt
  };

  const [summary, classification, entities, topics, intent, importance, embedding, duplicate] = await Promise.all([
    ai.summariseArticle(input),
    ai.classifyArticle(input),
    ai.extractEntities(input),
    ai.extractTopics(input),
    ai.generateCompressedIntent(input),
    ai.scoreImportance(input),
    ai.createArticleEmbedding(input),
    ai.detectDuplicateArticle(input)
  ]);

  const now = new Date().toISOString();
  return {
    id: raw.id ?? `article_${Buffer.from(canonicalUrl).toString("base64url").slice(0, 16)}`,
    source: {
      name: raw.sourceName,
      type: raw.sourceType ?? "mock",
      sourceUrl: raw.url,
      canonicalUrl
    },
    content: {
      title: raw.title,
      summary: summary.summary,
      compressedIntent: intent.compressedIntent,
      rawExcerpt: raw.excerpt
    },
    classification: {
      primaryCategory: classification.primaryCategory,
      secondaryCategories: classification.secondaryCategories,
      topicTags: topics.topics,
      entityTags: entities.entities,
      regionTags: entities.regions,
      sectorTags: entities.sectors,
      audienceTags: classification.audienceTags,
      professionalRelevanceTags: classification.professionalRelevanceTags
    },
    ranking: {
      importanceScore: importance.importanceScore,
      freshnessScore: 0.9,
      sourceTier: "tier_1",
      duplicateClusterId: duplicate.clusterId
    },
    retrieval: {
      embedding: embedding.embedding,
      keywords: [...topics.topics, ...entities.entities],
      semanticHash: duplicate.clusterId.replace("cluster_", "hash_")
    },
    metadata: {
      publishedAt: raw.publishedAt ?? now,
      ingestedAt: now,
      processedAt: now,
      language: "en",
      processingStatus: "ready"
    }
  };
}

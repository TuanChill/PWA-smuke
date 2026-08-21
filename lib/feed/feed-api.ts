import type { Article, FeedCard } from "@/lib/types";
import { memoryStore } from "@/lib/store/memory-store";
import { rankArticle } from "@/lib/ranking/ranker";

export interface FetchFeedOptions {
  page?: number;
  limit?: number;
  topicSlug?: string;
  sort?: "for-you" | "trending" | "latest";
  language?: string;
  token?: string;
}

export interface FeedTopic {
  slug: string;
  name: string;
  articleCount?: number;
}

export interface FeedApiResponse {
  cards: FeedCard[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function getBackendBaseUrl(): string {
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

/**
 * Normalizes backend FeedCardDto or raw item to full FeedCard
 */
export function normalizeFeedCard(raw: any): FeedCard {
  const sourceName = raw.source?.name || raw.sourceName || "Smuke News";
  const sourceUrl = raw.source?.sourceUrl || raw.url || "https://smuke.app";
  const canonicalUrl = raw.source?.canonicalUrl || raw.url || sourceUrl;
  const primaryCategory = raw.classification?.primaryCategory || raw.topic?.slug || (raw.topicName ? raw.topicName.toLowerCase() : "technology");

  return {
    id: String(raw.id || raw._id || `card_${Math.random().toString(36).slice(2)}`),
    source: {
      name: sourceName,
      type: raw.source?.type === "mock" ? "mock" : "rss",
      sourceUrl,
      canonicalUrl,
    },
    content: {
      title: raw.content?.title || raw.title || "Untitled",
      summary: raw.content?.summary || raw.summary || "",
      compressedIntent:
        raw.content?.compressedIntent ||
        `Real-time intelligence from ${sourceName} on ${primaryCategory}.`,
      rawExcerpt: raw.content?.rawExcerpt || raw.content || undefined,
    },
    classification: {
      primaryCategory: (primaryCategory as any) || "technology",
      secondaryCategories: raw.classification?.secondaryCategories || [],
      topicTags: raw.classification?.topicTags || raw.tags || [primaryCategory],
      entityTags: raw.classification?.entityTags || [],
      regionTags: raw.classification?.regionTags || ["Global"],
      sectorTags: raw.classification?.sectorTags || [primaryCategory],
      audienceTags: raw.classification?.audienceTags || ["operators", "builders"],
      professionalRelevanceTags:
        raw.classification?.professionalRelevanceTags || ["market_signal"],
    },
    ranking: {
      importanceScore: raw.ranking?.importanceScore ?? 0.8,
      freshnessScore: raw.ranking?.freshnessScore ?? 0.9,
      sourceTier: raw.ranking?.sourceTier || "tier_1",
      duplicateClusterId: raw.ranking?.duplicateClusterId || `cluster_${raw.id || "0"}`,
    },
    retrieval: {
      embedding: raw.retrieval?.embedding || [0.5, 0.5, 0.5],
      keywords: raw.retrieval?.keywords || raw.tags || [],
      semanticHash: raw.retrieval?.semanticHash || `hash_${raw.id || "0"}`,
    },
    metadata: {
      publishedAt: raw.metadata?.publishedAt || raw.detectedAt || new Date().toISOString(),
      ingestedAt: raw.metadata?.ingestedAt || raw.detectedAt || new Date().toISOString(),
      processedAt: raw.metadata?.processedAt || new Date().toISOString(),
      language: raw.metadata?.language || raw.language || "en",
      processingStatus: "ready",
    },
    feed: {
      rankScore: raw.feed?.rankScore ?? 0.85,
      reasonTags: raw.feed?.reasonTags || ["Curated for you"],
      queuedAt: raw.feed?.queuedAt || new Date().toISOString(),
    },
  };
}

/**
 * Fetches feed cards from backend with automatic local fallback
 */
export async function fetchFeedCards(options: FetchFeedOptions = {}): Promise<FeedApiResponse> {
  const page = Number(options.page ?? 1) || 1;
  const limit = Number(options.limit ?? 10) || 10;
  const sort = options.sort ?? "for-you";
  const topicSlug = options.topicSlug;

  const baseUrl = getBackendBaseUrl();
  try {
    const url = new URL(`${baseUrl}/feed`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", sort);
    if (topicSlug && topicSlug !== "all") {
      url.searchParams.set("topicSlug", topicSlug);
    }
    if (options.language) {
      url.searchParams.set("language", options.language);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
      next: { revalidate: 30 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        const cards = json.data.map(normalizeFeedCard);
        return {
          cards,
          meta: json.meta || {
            page,
            limit,
            total: cards.length,
            totalPages: Math.ceil(cards.length / limit),
            hasMore: page < Math.ceil(cards.length / limit),
          },
        };
      }
    }
  } catch {
    // Graceful fallback to local memoryStore
  }

  // Fallback: Local memory store with topic filter and ranking
  const preferences = memoryStore.listPreferences();
  const memory = memoryStore.getMemorySnapshot();
  let articles = memoryStore.listArticles();

  if (topicSlug && topicSlug !== "all") {
    articles = articles.filter(
      (a) =>
        a.classification.primaryCategory.toLowerCase() === topicSlug.toLowerCase() ||
        a.classification.topicTags.some((t) => t.toLowerCase() === topicSlug.toLowerCase())
    );
  }

  const rankedCards = articles.map((article, index) =>
    rankArticle(article, preferences, index, memory)
  );

  const total = rankedCards.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const slicedCards = rankedCards.slice(start, start + limit);

  return {
    cards: slicedCards,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Fetches feed topics from backend with local fallback
 */
export async function fetchFeedTopics(): Promise<FeedTopic[]> {
  const baseUrl = getBackendBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/feed/topics`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  // Default topic taxonomy fallback
  return [
    { slug: "all", name: "All Topics" },
    { slug: "ai", name: "AI & ML" },
    { slug: "crypto", name: "Crypto & Web3" },
    { slug: "technology", name: "Technology" },
    { slug: "startups", name: "Startups" },
    { slug: "markets", name: "Markets & Finance" },
    { slug: "policy", name: "Policy & Regs" },
  ];
}

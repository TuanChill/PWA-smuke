import { apiClient } from "@/lib/api/axios-client";
import type { FeedCard, InteractionType } from "@/lib/types";

export interface FeedTopic {
  slug: string;
  name: string;
  priorityScore?: number;
  articleCount?: number;
}

export interface FeedTopicsResponse {
  topics: FeedTopic[];
}

export interface FeedCardsResponse {
  cards: FeedCard[];
  meta: {
    page: number;
    limit: number;
    hasMore: boolean;
    rankedCount: number;
  };
}

export interface FeedQueryParams {
  page?: number;
  limit?: number;
  sort?: "for-you" | "trending" | "latest";
  topicSlug?: string;
}

export const feedService = {
  async getTopics(): Promise<FeedTopic[]> {
    const res = await apiClient.get<FeedTopicsResponse>("/feed/topics");
    return res.data.topics || [];
  },

  async getCards(params?: FeedQueryParams): Promise<FeedCardsResponse> {
    const res = await apiClient.get<FeedCardsResponse>("/feed", { params });
    return res.data;
  },

  async sendInteraction(
    articleId: string,
    type: InteractionType,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>(`/articles/${encodeURIComponent(articleId)}/interact`, {
      type,
      metadata,
    });
    return res.data;
  },
};

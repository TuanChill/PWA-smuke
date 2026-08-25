import { apiClient } from "@/lib/api/axios-client";
import type { Draft } from "@/lib/store/memory-store";

export interface CommentaryQueryParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  platform?: string;
  q?: string;
  search?: string;
  sort?: "newest" | "oldest";
}

export interface CommentaryListResponse {
  drafts: Draft[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: {
    all: number;
    linkedin: number;
    twitter_x: number;
    executive_memo: number;
  };
}

export interface CreateDraftPayload {
  articleId: string;
  userComment?: string;
  platform?: "linkedin" | "twitter_x" | "executive_memo";
  perspectiveAngle?: string;
  article?: {
    title?: string;
    summary?: string;
    sourceName?: string;
    sourceUrl?: string;
    topicTags?: string[];
    primaryCategory?: string;
  };
}

export interface CreateDraftResponse {
  draft: Draft;
}

export const commentaryService = {
  async getDrafts(params?: CommentaryQueryParams): Promise<CommentaryListResponse> {
    const res = await apiClient.get<CommentaryListResponse>("/commentary-drafts", { params });
    return res.data;
  },

  async createDraft(payload: CreateDraftPayload): Promise<Draft> {
    const res = await apiClient.post<CreateDraftResponse>("/commentary-drafts", payload);
    return res.data.draft;
  },

  async deleteDraft(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/commentary-drafts?id=${encodeURIComponent(id)}`);
    return res.data;
  },
};

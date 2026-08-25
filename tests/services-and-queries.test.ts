import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, backendApiClient, getAuthenticatedBackendClient, getBackendUrl } from "@/lib/api/axios-client";
import { preferencesService } from "@/lib/services/preferences.service";
import { socialAccountsService } from "@/lib/services/social-accounts.service";
import { commentaryService } from "@/lib/services/commentary.service";
import { feedService } from "@/lib/services/feed.service";
import { onboardingService } from "@/lib/services/onboarding.service";
import { preferencesKeys } from "@/lib/hooks/queries/use-preferences-queries";
import { socialAccountsKeys } from "@/lib/hooks/queries/use-social-accounts-queries";
import { commentaryKeys } from "@/lib/hooks/queries/use-commentary-queries";
import { feedKeys } from "@/lib/hooks/queries/use-feed-queries";

describe("Axios Client Layer", () => {
  it("exports configured apiClient and backendApiClient", () => {
    expect(apiClient.defaults.baseURL).toBe("/api");
    expect(backendApiClient.defaults.baseURL).toBeDefined();
    expect(getBackendUrl()).toBeDefined();
  });

  it("creates authenticated backend client with Bearer token", () => {
    const token = "mock_jwt_token_123";
    const client = getAuthenticatedBackendClient(token);
    expect(client.defaults.headers.Authorization).toBe(`Bearer ${token}`);
  });
});

describe("Service Layer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("preferencesService calls apiClient.get and apiClient.post", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { success: true, preferences: [] },
    } as any);
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true },
    } as any);

    const prefs = await preferencesService.getPreferences();
    expect(getSpy).toHaveBeenCalledWith("/preferences");
    expect(prefs.success).toBe(true);

    const clearRes = await preferencesService.clearPreferences();
    expect(postSpy).toHaveBeenCalledWith("/preferences/clear");
    expect(clearRes.success).toBe(true);
  });

  it("socialAccountsService calls get, connect, and disconnect", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: "soc_1", platform: "linkedin" }] },
    } as any);
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { success: true, url: "https://auth.postforme.dev" },
    } as any);
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
      data: { success: true },
    } as any);

    const accounts = await socialAccountsService.getSocialAccounts();
    expect(getSpy).toHaveBeenCalledWith("/social-accounts");
    expect(accounts).toHaveLength(1);

    const connectRes = await socialAccountsService.connectAccount({ platform: "linkedin" });
    expect(postSpy).toHaveBeenCalledWith("/social-accounts/connect", { platform: "linkedin" });
    expect(connectRes.url).toBe("https://auth.postforme.dev");

    const deleteRes = await socialAccountsService.disconnectAccount("soc_1");
    expect(deleteSpy).toHaveBeenCalledWith("/social-accounts?id=soc_1");
    expect(deleteRes.success).toBe(true);
  });

  it("commentaryService calls getDrafts, createDraft, and deleteDraft", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { drafts: [], total: 0, page: 1, pageSize: 5, totalPages: 0, counts: { all: 0, linkedin: 0, twitter_x: 0, executive_memo: 0 } },
    } as any);
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: { draft: { id: "draft_123", draft: "AI commentary draft" } },
    } as any);
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
      data: { success: true },
    } as any);

    const list = await commentaryService.getDrafts({ page: 1, limit: 5 });
    expect(getSpy).toHaveBeenCalledWith("/commentary-drafts", { params: { page: 1, limit: 5 } });
    expect(list.total).toBe(0);

    const draft = await commentaryService.createDraft({ articleId: "art_1", platform: "linkedin" });
    expect(postSpy).toHaveBeenCalledWith("/commentary-drafts", { articleId: "art_1", platform: "linkedin" });
    expect(draft.id).toBe("draft_123");

    const del = await commentaryService.deleteDraft("draft_123");
    expect(deleteSpy).toHaveBeenCalledWith("/commentary-drafts?id=draft_123");
    expect(del.success).toBe(true);
  });

  it("feedService calls getTopics, getCards, and sendInteraction", async () => {
    const getSpy = vi.spyOn(apiClient, "get")
      .mockResolvedValueOnce({ data: { topics: [{ slug: "ai", name: "AI" }] } } as any)
      .mockResolvedValueOnce({ data: { cards: [], meta: { page: 1, limit: 15, hasMore: false, rankedCount: 0 } } } as any);
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: { success: true } } as any);

    const topics = await feedService.getTopics();
    expect(topics).toHaveLength(1);

    const cards = await feedService.getCards({ page: 1, limit: 15 });
    expect(cards.meta.hasMore).toBe(false);

    const interact = await feedService.sendInteraction("art_1", "swipe_right");
    expect(postSpy).toHaveBeenCalledWith("/articles/art_1/interact", {
      type: "swipe_right",
      metadata: undefined,
    });
    expect(interact.success).toBe(true);
  });
});

describe("React Query Keys Consistency", () => {
  it("generates deterministic query keys across all domains", () => {
    expect(preferencesKeys.detail()).toEqual(["preferences", "detail"]);
    expect(socialAccountsKeys.list()).toEqual(["social-accounts", "list"]);
    expect(commentaryKeys.list({ page: 1 })).toEqual(["commentary-drafts", "list", { page: 1 }]);
    expect(feedKeys.topics()).toEqual(["feed", "topics"]);
    expect(feedKeys.cards({ page: 2 })).toEqual(["feed", "cards", { page: 2 }]);
  });
});

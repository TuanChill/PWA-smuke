import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  feedService,
  type FeedQueryParams,
  type FeedCardsResponse,
  type FeedTopic,
} from "@/lib/services/feed.service";
import type { InteractionType } from "@/lib/types";

export const feedKeys = {
  all: ["feed"] as const,
  topics: () => [...feedKeys.all, "topics"] as const,
  cards: (params?: FeedQueryParams) => [...feedKeys.all, "cards", params] as const,
};

export function useFeedTopicsQuery(options?: { enabled?: boolean; initialData?: FeedTopic[] }) {
  return useQuery({
    queryKey: feedKeys.topics(),
    queryFn: () => feedService.getTopics(),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

export function useFeedCardsQuery(
  params?: FeedQueryParams,
  options?: { enabled?: boolean; initialData?: FeedCardsResponse }
) {
  return useQuery({
    queryKey: feedKeys.cards(params),
    queryFn: () => feedService.getCards(params),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

export function useSendInteractionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { articleId: string; type: InteractionType; metadata?: Record<string, unknown> }) =>
      feedService.sendInteraction(variables.articleId, variables.type, variables.metadata),
    onSuccess: () => {
      // Invalidate preferences cache in background so preferences page updates smoothly
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });
}

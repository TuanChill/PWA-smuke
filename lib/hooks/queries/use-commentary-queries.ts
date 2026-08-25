import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  commentaryService,
  type CommentaryQueryParams,
  type CommentaryListResponse,
  type CreateDraftPayload,
} from "@/lib/services/commentary.service";

export const commentaryKeys = {
  all: ["commentary-drafts"] as const,
  list: (params?: CommentaryQueryParams) => [...commentaryKeys.all, "list", params] as const,
};

export function useCommentaryDraftsQuery(
  params?: CommentaryQueryParams,
  options?: { enabled?: boolean; initialData?: CommentaryListResponse }
) {
  return useQuery({
    queryKey: commentaryKeys.list(params),
    queryFn: () => commentaryService.getDrafts(params),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

export function useCreateDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDraftPayload) => commentaryService.createDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentaryKeys.all });
    },
  });
}

export function useDeleteDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentaryService.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentaryKeys.all });
    },
  });
}

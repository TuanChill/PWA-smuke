import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { preferencesService, type PreferencesResponse } from "@/lib/services/preferences.service";

export const preferencesKeys = {
  all: ["preferences"] as const,
  detail: () => [...preferencesKeys.all, "detail"] as const,
};

export function usePreferencesQuery(options?: { enabled?: boolean; initialData?: PreferencesResponse }) {
  return useQuery({
    queryKey: preferencesKeys.detail(),
    queryFn: () => preferencesService.getPreferences(),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

export function useClearPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => preferencesService.clearPreferences(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.all });
    },
  });
}

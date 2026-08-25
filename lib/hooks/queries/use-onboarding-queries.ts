import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  onboardingService,
  type SubmitOnboardingPayload,
  type UserOnboardingData,
} from "@/lib/services/onboarding.service";

export const onboardingKeys = {
  all: ["onboarding"] as const,
  detail: (token?: string | null) => [...onboardingKeys.all, token] as const,
};

export function useOnboardingQuery(jwtToken?: string | null, options?: { enabled?: boolean }) {
  return useQuery<UserOnboardingData | null>({
    queryKey: onboardingKeys.detail(jwtToken),
    queryFn: () => onboardingService.getOnboarding(jwtToken),
    enabled: Boolean(jwtToken) && (options?.enabled ?? true),
  });
}

export function useSubmitOnboardingMutation(jwtToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitOnboardingPayload) => onboardingService.submitOnboarding(payload, jwtToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
  });
}

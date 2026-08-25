import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  socialAccountsService,
  type ConnectAccountPayload,
} from "@/lib/services/social-accounts.service";
import type { SocialAccount } from "@/lib/types";

export const socialAccountsKeys = {
  all: ["social-accounts"] as const,
  list: () => [...socialAccountsKeys.all, "list"] as const,
};

export function useSocialAccountsQuery(options?: { enabled?: boolean; initialData?: SocialAccount[] }) {
  return useQuery({
    queryKey: socialAccountsKeys.list(),
    queryFn: () => socialAccountsService.getSocialAccounts(),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

export function useConnectAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConnectAccountPayload) => socialAccountsService.connectAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountsKeys.all });
    },
  });
}

export function useDisconnectAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socialAccountsService.disconnectAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountsKeys.all });
    },
  });
}

import { apiClient } from "@/lib/api/axios-client";
import type { SocialAccount, SocialPlatform } from "@/lib/types";

export interface SocialAccountsListResponse {
  success: boolean;
  data: SocialAccount[];
}

export interface ConnectAccountPayload {
  platform: SocialPlatform | string;
  redirect_url_override?: string;
  simulate?: boolean;
}

export interface ConnectAccountResponse {
  success: boolean;
  url: string;
  redirect_url_override?: string;
  message?: string;
}

export const socialAccountsService = {
  async getSocialAccounts(): Promise<SocialAccount[]> {
    const res = await apiClient.get<SocialAccountsListResponse>("/social-accounts");
    return res.data.data || [];
  },

  async connectAccount(payload: ConnectAccountPayload): Promise<ConnectAccountResponse> {
    const res = await apiClient.post<ConnectAccountResponse>("/social-accounts/connect", payload);
    return res.data;
  },

  async disconnectAccount(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/social-accounts?id=${encodeURIComponent(id)}`);
    return res.data;
  },
};

import { apiClient } from "@/lib/api/axios-client";
import type { PreferenceNode } from "@/lib/types";

export interface PreferencesResponse {
  success: boolean;
  preferences: PreferenceNode[];
  topics?: string[];
  objectives?: string[];
  role?: string;
  profession?: string;
  company?: string;
  sourceScores?: Array<{ sourceName: string; trustScore: number; affinityScore: number }>;
}

export const preferencesService = {
  async getPreferences(): Promise<PreferencesResponse> {
    const res = await apiClient.get<PreferencesResponse>("/preferences");
    return res.data;
  },

  async clearPreferences(): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>("/preferences/clear");
    return res.data;
  },
};

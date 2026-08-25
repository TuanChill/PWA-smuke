import axios from "axios";
import { getBackendUrl } from "@/lib/api/axios-client";

export interface UserOnboardingData {
  id?: string;
  selectedTopics: string[];
  objectives: string[];
  role?: string;
  profession?: string;
  company?: string;
  consents: Record<string, boolean>;
  completed: boolean;
  completedAt?: string;
}

export interface SubmitOnboardingPayload {
  topics: string[];
  objectives: string[];
  role?: string;
  profession?: string;
  company?: string;
  consents?: Record<string, boolean>;
}

export const onboardingService = {
  async getOnboarding(jwtToken?: string | null): Promise<UserOnboardingData | null> {
    if (!jwtToken) return null;
    const res = await axios.get(`${getBackendUrl()}/users/onboarding`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
    return null;
  },

  async submitOnboarding(payload: SubmitOnboardingPayload, jwtToken?: string | null): Promise<boolean> {
    if (!jwtToken) return false;
    const res = await axios.post(`${getBackendUrl()}/users/onboarding`, payload, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });
    return Boolean(res.data?.success);
  },
};

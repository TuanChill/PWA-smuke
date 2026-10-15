"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getBackendUrl } from "@/lib/api/axios-client";
import {
  onboardingService,
  type UserOnboardingData,
  type SubmitOnboardingPayload,
} from "@/lib/services/onboarding.service";

export type { UserOnboardingData, SubmitOnboardingPayload };

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
}

export interface RouterNavigator {
  push: (href: any, options?: any) => void;
}

function syncCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `smuke_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = "smuke_token=; path=/; max-age=0";
  }
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  onboarding: UserOnboardingData | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setSession: (token: string, user: UserProfile) => void;
  logout: () => void;
  loginWithGoogle: () => void;
  fetchOnboarding: (jwtToken?: string) => Promise<UserOnboardingData | null>;
  submitOnboarding: (payload: SubmitOnboardingPayload) => Promise<boolean>;
  setHydrated: (hydrated: boolean) => void;
  handleOnboardingCta: (router: RouterNavigator) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      onboarding: null,
      isLoading: false,
      isHydrated: false,

      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

      setSession: (token: string, user: UserProfile) => {
        syncCookie(token);
        set({ token, user });
      },

      logout: () => {
        syncCookie(null);
        set({ token: null, user: null, onboarding: null });
      },

      loginWithGoogle: () => {
        const backendUrl = getBackendUrl();
        if (typeof window !== "undefined") {
          // BE only honours this when our origin is in its FE_AUTH_ALLOWED_ORIGINS
          const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
          window.location.href = `${backendUrl}/auth/google?redirect_url=${redirectUrl}`;
        }
      },

      fetchOnboarding: async (jwtToken?: string): Promise<UserOnboardingData | null> => {
        const activeToken = jwtToken || get().token;
        if (!activeToken) return null;

        set({ isLoading: true });
        try {
          const data = await onboardingService.getOnboarding(activeToken);
          if (data) {
            set({ onboarding: data });
            return data;
          }
        } catch (err) {
          console.warn("Failed to fetch user onboarding:", err);
        } finally {
          set({ isLoading: false });
        }
        return null;
      },

      submitOnboarding: async (payload: SubmitOnboardingPayload): Promise<boolean> => {
        const activeToken = get().token;
        if (!activeToken) return false;

        set({ isLoading: true });
        try {
          const success = await onboardingService.submitOnboarding(payload, activeToken);
          if (success) {
            const data = await onboardingService.getOnboarding(activeToken);
            if (data) set({ onboarding: data });
            return true;
          }
        } catch (err) {
          console.error("Error submitting onboarding:", err);
        } finally {
          set({ isLoading: false });
        }
        return false;
      },

      /**
       * Core routing logic for "Start onboarding":
       * 1. If not authenticated -> redirect to /login
       * 2. If authenticated:
       *    - If onboarding completed -> push to /feed
       *    - If not completed -> push to /onboarding
       */
      handleOnboardingCta: async (router: RouterNavigator) => {
        const { token, user, onboarding, fetchOnboarding } = get();

        // 1. Check if user is authenticated
        if (!token || !user) {
          router.push("/login");
          return;
        }

        // 2. Check if onboarding status is known, or fetch fresh if null
        let currentOnboarding = onboarding;
        if (!currentOnboarding) {
          currentOnboarding = await fetchOnboarding(token);
        }

        // 3. Conditional routing based on completion
        if (currentOnboarding && currentOnboarding.completed) {
          router.push("/feed");
        } else {
          router.push("/onboarding");
        }
      },
    }),
    {
      name: "smuke-auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.token) {
            syncCookie(state.token);
            state.fetchOnboarding(state.token);
          }
        }
      },
    }
  )
);

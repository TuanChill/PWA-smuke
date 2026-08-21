"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
}

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

export interface RouterNavigator {
  push: (href: any, options?: any) => void;
}

function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api/v1"
    );
  }
  return process.env.SMUKE_BACKEND_URL || "http://localhost:8080/api/v1";
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
        get().fetchOnboarding(token);
      },

      logout: () => {
        syncCookie(null);
        set({ token: null, user: null, onboarding: null });
      },

      loginWithGoogle: () => {
        const backendUrl = getBackendUrl();
        if (typeof window !== "undefined") {
          window.location.href = `${backendUrl}/auth/google`;
        }
      },

      fetchOnboarding: async (jwtToken?: string): Promise<UserOnboardingData | null> => {
        const activeToken = jwtToken || get().token;
        if (!activeToken) return null;

        set({ isLoading: true });
        try {
          const res = await fetch(`${getBackendUrl()}/users/onboarding`, {
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({ onboarding: json.data });
              return json.data;
            }
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
          const res = await fetch(`${getBackendUrl()}/users/onboarding`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeToken}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              set({ onboarding: json.data });
              return true;
            }
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

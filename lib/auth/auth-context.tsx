"use client";

import React from "react";
import {
  useAuthStore,
  UserProfile,
  UserOnboardingData,
  SubmitOnboardingPayload,
  RouterNavigator,
} from "@/lib/store/use-auth-store";

export type { UserProfile, UserOnboardingData, SubmitOnboardingPayload, RouterNavigator };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useAuthStore maintains persistence and rehydration lifecycle
  return <>{children}</>;
}

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    onboarding: store.onboarding,
    isAuthenticated: Boolean(store.token && store.user),
    isLoading: store.isLoading,
    isHydrated: store.isHydrated,
    loginWithGoogle: store.loginWithGoogle,
    logout: store.logout,
    setSession: store.setSession,
    refreshOnboarding: store.fetchOnboarding,
    submitOnboarding: store.submitOnboarding,
    handleOnboardingCta: store.handleOnboardingCta,
  };
}

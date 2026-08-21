"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession, refreshOnboarding } = useAuth();
  const [status, setStatus] = useState("Verifying credentials...");

  useEffect(() => {
    const token = searchParams.get("access_token") || searchParams.get("token");
    const userId = searchParams.get("user_id") || searchParams.get("id");
    const email = searchParams.get("email");
    const name = searchParams.get("name") || undefined;
    const picture = searchParams.get("picture") || undefined;
    const error = searchParams.get("error");

    if (error) {
      setStatus("Authentication failed. Redirecting to login...");
      setTimeout(() => router.push("/login?error=auth_failed"), 1500);
      return;
    }

    if (token && (userId || email)) {
      setStatus("Setting up your intelligence workspace...");
      const userProfile = {
        id: userId || `user_${Date.now()}`,
        email: email || "user@smuke.app",
        name,
        picture,
      };

      setSession(token, userProfile);

      // Verify onboarding status
      refreshOnboarding().then((onboardingData) => {
        if (onboardingData && onboardingData.completed) {
          router.push("/feed");
        } else {
          router.push("/onboarding");
        }
      });
    } else {
      setStatus("No authentication credentials found. Redirecting...");
      setTimeout(() => router.push("/login"), 1000);
    }
  }, [searchParams, router, setSession, refreshOnboarding]);

  return (
    <main className="safe-shell flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="flex flex-col items-center space-y-4 rounded-3xl bg-white p-8 shadow-panel">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-moss border-t-transparent" />
        <p className="text-sm font-semibold text-ink">{status}</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="safe-shell flex min-h-screen flex-col items-center justify-center bg-paper px-4">
          <div className="flex flex-col items-center space-y-4 rounded-3xl bg-white p-8 shadow-panel">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-moss border-t-transparent" />
            <p className="text-sm font-semibold text-ink">Loading session...</p>
          </div>
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

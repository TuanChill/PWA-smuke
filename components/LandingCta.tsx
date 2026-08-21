"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/use-auth-store";

export function LandingCta() {
  const router = useRouter();
  const handleOnboardingCta = useAuthStore((state) => state.handleOnboardingCta);
  const isLoading = useAuthStore((state) => state.isLoading);

  const onClickStart = async () => {
    await handleOnboardingCta(router);
  };

  return (
    <div className="mt-7 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onClickStart}
        disabled={isLoading}
        className="rounded-full bg-moss px-6 py-3 font-semibold text-white shadow-panel transition hover:bg-moss/90 active:scale-[0.99] disabled:opacity-50 flex items-center gap-2"
      >
        <span>Start onboarding</span>
        <span aria-hidden="true">→</span>
      </button>
      <Link
        className="rounded-full border border-ink/15 px-5 py-3 font-semibold text-ink hover:bg-fog transition"
        href="/preferences"
      >
        Preference graph
      </Link>
    </div>
  );
}

export function LandingNavActions() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const handleOnboardingCta = useAuthStore((state) => state.handleOnboardingCta);

  const isAuthenticated = Boolean(token && user);

  const onOpenFeed = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/feed");
    } else {
      await handleOnboardingCta(router);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <Link
          className="rounded-full px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-fog"
          href="/preferences"
        >
          {user?.name || "Profile"}
        </Link>
      ) : (
        <Link
          className="rounded-full px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-fog"
          href="/login"
        >
          Sign In
        </Link>
      )}
      <button
        type="button"
        onClick={onOpenFeed}
        className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-ink/90 transition"
      >
        Open feed
      </button>
    </div>
  );
}

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { socialAccountsService } from "@/lib/services/social-accounts.service";

const PLATFORM_NAMES: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X / Twitter",
  twitter: "X / Twitter",
  threads: "Threads"
};

function SocialCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [platform, setPlatform] = useState<string>("Social");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(2);

  useEffect(() => {
    const rawPlatform =
      searchParams.get("platform") ||
      searchParams.get("connected") ||
      "";
    const statusParam = searchParams.get("status");
    const errorParam = searchParams.get("error") || searchParams.get("error_description");
    const messageParam = searchParams.get("message");

    const platformKey = rawPlatform.toLowerCase();
    const formattedPlatform = PLATFORM_NAMES[platformKey] || (rawPlatform ? rawPlatform.toUpperCase() : "Social");
    setPlatform(formattedPlatform);

    if (errorParam) {
      setState("error");
      setErrorMessage(
        messageParam ||
        errorParam === "access_denied"
          ? "Authorization was cancelled or access denied."
          : `Failed to link account: ${errorParam}`
      );
      return;
    }

    // Success or positive status
    if (statusParam === "success" || statusParam === "connected" || !errorParam) {
      // Background sync connected accounts
      socialAccountsService.getSocialAccounts().catch(() => undefined);

      setState("success");

      // Countdown to redirect
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push(
              `/preferences?connected=${encodeURIComponent(platformKey || "account")}&status=success`
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [searchParams, router, token]);

  return (
    <main className="safe-shell flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-panel text-center space-y-6">
        {state === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-moss border-t-transparent" />
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-ink">Finalizing Connection...</h1>
              <p className="text-xs text-ink/65">
                Syncing your {platform} profile with your Smuke workspace.
              </p>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-2xl font-bold">
              ✓
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-ink">Connected Successfully!</h1>
              <p className="text-xs text-ink/70">
                Your <span className="font-semibold text-ink">{platform}</span> account is now active and enabled for 1-tap distribution.
              </p>
            </div>

            <div className="rounded-2xl bg-fog/60 p-3 text-xs text-ink/60">
              Redirecting to Preferences in <span className="font-bold text-moss">{countdown}s</span>...
            </div>

            <div>
              <Link
                href={`/preferences?connected=${encodeURIComponent(platform)}&status=success`}
                className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-ink/90 transition"
              >
                Go to Preferences Now →
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-2xl font-bold">
              ✕
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-ink">Connection Unsuccessful</h1>
              <p className="text-xs text-rose-700 font-medium">
                {errorMessage || "Unable to authorize social account."}
              </p>
            </div>

            <div>
              <Link
                href="/preferences"
                className="inline-flex w-full items-center justify-center rounded-full bg-fog px-5 py-3 text-xs font-bold text-ink hover:bg-ink/10 transition"
              >
                Back to Preferences
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="safe-shell flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-panel text-center space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-moss border-t-transparent" />
            <h1 className="text-xl font-bold text-ink">Loading Callback...</h1>
          </div>
        </main>
      }
    >
      <SocialCallbackHandler />
    </Suspense>
  );
}

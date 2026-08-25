"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { SocialPlatform } from "@/lib/types";
import {
  useSocialAccountsQuery,
  useConnectAccountMutation,
  useDisconnectAccountMutation,
} from "@/lib/hooks/queries/use-social-accounts-queries";

interface Props {
  isAuthenticated: boolean;
  token?: string | null;
  onLoginClick?: () => void;
}

interface PlatformOption {
  key: SocialPlatform;
  name: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    key: "linkedin",
    name: "LinkedIn",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    icon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.44a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
      </svg>
    ),
  },
  {
    key: "x",
    name: "X / Twitter",
    badgeBg: "bg-slate-100 border-slate-300",
    badgeText: "text-slate-900",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "threads",
    name: "Threads",
    badgeBg: "bg-stone-100 border-stone-300",
    badgeText: "text-stone-900",
    icon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
];

export function SocialAccountsCard({ isAuthenticated, token, onLoginClick }: Props) {
  const searchParams = useSearchParams();
  const { data: accounts = [], isLoading, refetch } = useSocialAccountsQuery();
  const connectMutation = useConnectAccountMutation();
  const disconnectMutation = useDisconnectAccountMutation();

  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Check OAuth callback query parameter
  useEffect(() => {
    const connectedParam = searchParams.get("connected");
    const statusParam = searchParams.get("status");

    if (connectedParam && (statusParam === "success" || !statusParam)) {
      setFeedbackMessage({
        text: `🎉 Successfully connected ${connectedParam.toUpperCase()} account!`,
        type: "success",
      });
      refetch();
      const timer = setTimeout(() => setFeedbackMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, refetch]);

  const handleConnect = async (platform: SocialPlatform) => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
      return;
    }

    setConnectingPlatform(platform);
    setFeedbackMessage(null);

    try {
      const redirectUrlOverride =
        typeof window !== "undefined" ? `${window.location.origin}/social/callback` : undefined;

      const data = await connectMutation.mutateAsync({
        platform,
        redirect_url_override: redirectUrlOverride,
      });

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setFeedbackMessage({
        text: `✓ ${data.message || `Connected ${platform} successfully!`}`,
        type: "success",
      });
      setShowAddMenu(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({
        text: err?.message || "Connection failed. Please check your network and try again.",
        type: "error",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId: string, platformName: string) => {
    setDisconnectingId(accountId);
    setFeedbackMessage(null);

    try {
      await disconnectMutation.mutateAsync(accountId);
      setFeedbackMessage({
        text: `Disconnected ${platformName.toUpperCase()} account.`,
        type: "success",
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage({
        text: err?.message || "Failed to disconnect account.",
        type: "error",
      });
    } finally {
      setDisconnectingId(null);
    }
  };

  const getPlatformMeta = (platform: string) => {
    const key = platform.toLowerCase();
    return (
      PLATFORM_OPTIONS.find((p) => p.key === key) || {
        key: "x" as SocialPlatform,
        name: platform.toUpperCase(),
        badgeBg: "bg-fog border-ink/10",
        badgeText: "text-ink",
        icon: <span>🌐</span>,
      }
    );
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-panel space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Integrations</p>
          <h2 className="text-lg font-bold text-ink">Connected Channels</h2>
        </div>
        <span className="rounded-full bg-fog px-3 py-1 text-[11px] font-semibold text-ink/70">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"} connected
        </span>
      </div>

      <p className="text-xs text-ink/65 leading-relaxed">
        Connected social accounts from the API enabled for 1-tap distribution and AI persona calibration. Multiple accounts per platform are supported.
      </p>

      {/* Feedback Alert Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`rounded-2xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-current opacity-60 hover:opacity-100 ml-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Mode Warning Banner */}
      {!isAuthenticated && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span>Sign in with Google to connect and sync your social accounts.</span>
          </div>
          {onLoginClick && (
            <button
              type="button"
              onClick={onLoginClick}
              className="self-start rounded-full bg-amber-800 px-3.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-amber-900 transition"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Connected Accounts List */}
      {accounts.length > 0 ? (
        <div className="divide-y divide-ink/5">
          {accounts.map((account) => {
            const meta = getPlatformMeta(account.platform);
            const isDisconnecting = disconnectingId === account.id;
            const avatarSrc =
              account.avatarUrl ||
              (account as any).profile_photo_url ||
              (account as any).picture ||
              (account as any).profileImageUrl ||
              (account as any).profileUrl;

            return (
              <div
                key={account.id}
                className="flex flex-col gap-3 py-3.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Channel Meta & Info */}
                <div className="flex items-center gap-3.5">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt={account.accountName || account.username || "Account Avatar"}
                      className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-1 ring-ink/10"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-fog/80 text-ink shadow-xs">
                      {meta.icon}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">
                        {account.accountName || account.username || meta.name}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badgeBg} ${meta.badgeText}`}
                      >
                        {meta.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                      <span className="text-[11px] text-ink/50">•</span>
                      <span className="text-[11px] font-medium text-ink/75">
                        @{account.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Disconnect Action */}
                <div className="self-end sm:self-center">
                  <button
                    type="button"
                    disabled={isDisconnecting}
                    onClick={() => handleDisconnect(account.id, meta.name)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition shadow-xs disabled:opacity-50"
                  >
                    {isDisconnecting ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                        <span>Disconnecting...</span>
                      </>
                    ) : (
                      <span>Disconnect</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-ink/15 bg-paper/50 p-6 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-fog text-ink text-lg">
            🔗
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">No social accounts connected</h3>
            <p className="text-xs text-ink/60 max-w-sm mx-auto">
              Link your LinkedIn, X (Twitter), or Threads accounts to enable instant 1-tap post publishing.
            </p>
          </div>
        </div>
      )}

      {/* Connect Account Buttons Section */}
      <div className="pt-2 border-t border-ink/5">
        <p className="text-[11px] font-semibold text-ink/60 uppercase tracking-wider mb-2.5">
          {accounts.length > 0 ? "+ Connect Another Account:" : "Connect an Account:"}
        </p>

        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => {
            const isConnecting = connectingPlatform === p.key;

            return (
              <button
                key={p.key}
                type="button"
                disabled={Boolean(connectingPlatform)}
                onClick={() => handleConnect(p.key)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:border-moss hover:bg-moss/5 hover:text-moss active:scale-95 transition disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-moss border-t-transparent" />
                ) : (
                  <span className="shrink-0">{p.icon}</span>
                )}
                <span>+ {p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

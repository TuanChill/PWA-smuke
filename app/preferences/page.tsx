"use client";

import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { PreferencesSkeleton } from "@/components/PreferencesSkeleton";
import { SocialAccountsCard } from "@/components/SocialAccountsCard";
import { useAuth } from "@/lib/auth/auth-context";
import { usePreferencesQuery } from "@/lib/hooks/queries/use-preferences-queries";
import { seedPreferences } from "@/lib/store/seed";

export default function PreferencesPage() {
  const { user, onboarding, isAuthenticated, token, isLoading: isAuthLoading, isHydrated, loginWithGoogle, logout } = useAuth();
  const { data: prefData, isLoading: isFetchingPrefs } = usePreferencesQuery();
  const preferences = prefData?.preferences && prefData.preferences.length > 0 ? prefData.preferences : seedPreferences;

  const showSkeleton = !isHydrated || (isAuthLoading && isFetchingPrefs);

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 pb-28 pt-6">
      <section className="mx-auto max-w-3xl space-y-6">
        {showSkeleton ? (
          <PreferencesSkeleton />
        ) : (
          <>
            {/* User Profile Card */}
            <div className="rounded-3xl bg-white p-6 shadow-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {user?.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.picture}
                      alt={user.name || "User Avatar"}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-moss/30"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fog font-bold text-moss text-lg">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "G"}
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-ink sm:text-2xl">
                      {user?.name || "Guest Operator"}
                    </h1>
                    <p className="text-xs text-ink/60">{user?.email || "No account linked"}</p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="self-start sm:self-center rounded-full bg-moss px-5 py-2.5 text-xs font-semibold text-white hover:bg-moss/90 transition shadow-sm"
                  >
                    Sign In with Google
                  </button>
                )}
              </div>
            </div>

            {/* Connected Social Accounts Card */}
            <SocialAccountsCard
              isAuthenticated={isAuthenticated}
              token={token}
              onLoginClick={loginWithGoogle}
            />

            {/* Onboarding Preferences */}
        {onboarding && (
          <div className="rounded-3xl bg-white p-6 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Survey Data</p>
                <h2 className="text-lg font-bold text-ink">Onboarded Focus Areas</h2>
              </div>
              <Link
                href="/onboarding"
                className="rounded-full bg-fog px-3 py-1.5 text-xs font-semibold text-moss hover:bg-moss hover:text-white transition"
              >
                Edit Radar
              </Link>
            </div>

            {onboarding.selectedTopics?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink/60 mb-2">Tracked Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {onboarding.selectedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss"
                    >
                      ✓ {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onboarding.objectives?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink/60 mb-2">Strategic Objectives:</p>
                <div className="flex flex-wrap gap-2">
                  {onboarding.objectives.map((obj) => (
                    <span
                      key={obj}
                      className="rounded-full bg-fog px-3 py-1 text-xs font-medium text-ink/80"
                    >
                      • {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(onboarding.role || onboarding.company) && (
              <div className="border-t border-ink/10 pt-3 flex flex-wrap gap-4 text-xs text-ink/70">
                {onboarding.role && (
                  <p>
                    <span className="font-semibold text-ink">Role:</span> {onboarding.role}
                  </p>
                )}
                {onboarding.company && (
                  <p>
                    <span className="font-semibold text-ink">Organization:</span> {onboarding.company}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inferred Preference Graph */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Adaptive Model</p>
            <h2 className="text-xl font-bold text-ink">Inferred Behavioural Signals</h2>
          </div>
          <div className="grid gap-3">
            {preferences.map((node) => (
              <article key={node.id} className="rounded-3xl bg-white p-5 shadow-panel">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{node.nodeType}</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">{node.label}</h3>
                  </div>
                  <span className="rounded-full bg-fog px-3 py-1 text-sm font-semibold text-moss">
                    {node.score.toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-fog">
                  <div
                    className="h-full bg-moss transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, node.confidence * 100))}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <div className="pt-2">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-2xl bg-red-500 py-3.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-red-600 active:scale-[0.99] transition duration-150"
            >
              Sign Out
            </button>
          </div>
        )}
          </>
        )}
      </section>
      <AppNav />
    </main>
  );
}

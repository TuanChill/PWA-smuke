"use client";

export function PreferencesSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading preferences">
      {/* 1. User Profile Card Skeleton */}
      <div className="rounded-3xl bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div className="h-14 w-14 shrink-0 rounded-full bg-fog/80 animate-pulse ring-2 ring-fog" />
            
            <div className="space-y-2">
              {/* Name Bar */}
              <div className="h-6 w-36 sm:w-48 rounded-lg bg-fog/80 animate-pulse" />
              {/* Email / Status Bar */}
              <div className="h-3.5 w-44 sm:w-56 rounded-lg bg-fog/60 animate-pulse" />
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="h-9 w-32 shrink-0 rounded-full bg-fog/70 animate-pulse self-start sm:self-center" />
        </div>
      </div>

      {/* 2. Connected Channels Skeleton */}
      <div className="rounded-3xl bg-white p-6 shadow-panel space-y-4">
        <div className="flex items-center justify-between border-b border-ink/5 pb-3">
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-fog/70 animate-pulse" />
            <div className="h-5 w-44 rounded-lg bg-fog/80 animate-pulse" />
          </div>
          <div className="h-6 w-28 rounded-full bg-fog/60 animate-pulse" />
        </div>
        <div className="divide-y divide-ink/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-fog/70 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded-md bg-fog/80 animate-pulse" />
                  <div className="h-3 w-48 rounded-md bg-fog/60 animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-20 rounded-full bg-fog/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Onboarded Focus Areas Skeleton */}
      <div className="rounded-3xl bg-white p-6 shadow-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-fog/70 animate-pulse" />
            <div className="h-5 w-44 rounded-lg bg-fog/80 animate-pulse" />
          </div>
          <div className="h-7 w-20 rounded-full bg-fog/70 animate-pulse" />
        </div>

        {/* Tracked Topics Shimmer Chips */}
        <div>
          <div className="h-3.5 w-28 rounded bg-fog/60 animate-pulse mb-2.5" />
          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-28 rounded-full bg-fog/70 animate-pulse" />
            <div className="h-7 w-36 rounded-full bg-fog/70 animate-pulse" />
            <div className="h-7 w-24 rounded-full bg-fog/70 animate-pulse" />
            <div className="h-7 w-32 rounded-full bg-fog/70 animate-pulse" />
          </div>
        </div>

        {/* Strategic Objectives Shimmer */}
        <div>
          <div className="h-3.5 w-32 rounded bg-fog/60 animate-pulse mb-2.5" />
          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-40 rounded-full bg-fog/60 animate-pulse" />
            <div className="h-7 w-48 rounded-full bg-fog/60 animate-pulse" />
          </div>
        </div>

        {/* Role & Organization Footer */}
        <div className="border-t border-ink/5 pt-3 flex flex-wrap gap-4">
          <div className="h-4 w-32 rounded bg-fog/60 animate-pulse" />
          <div className="h-4 w-40 rounded bg-fog/60 animate-pulse" />
        </div>
      </div>

      {/* 3. Inferred Preference Graph Skeleton */}
      <div>
        <div className="mb-3 space-y-1.5">
          <div className="h-3 w-28 rounded bg-fog/70 animate-pulse" />
          <div className="h-6 w-52 rounded-lg bg-fog/80 animate-pulse" />
        </div>

        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <article key={item} className="rounded-3xl bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-fog/70 animate-pulse" />
                  <div className="h-5 w-40 sm:w-56 rounded-lg bg-fog/80 animate-pulse" />
                </div>
                <div className="h-7 w-12 rounded-full bg-fog/70 animate-pulse" />
              </div>
              {/* Progress Bar Shimmer */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-fog/60">
                <div
                  className="h-full bg-fog animate-pulse rounded-full"
                  style={{ width: `${item === 1 ? "78%" : item === 2 ? "65%" : "52%"}` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { FeedCard, InteractionType } from "@/lib/types";
import type { FeedTopic } from "@/lib/feed/feed-api";
import { useAuth } from "@/lib/auth/auth-context";

type Props = {
  initialCards: FeedCard[];
  initialTopics?: FeedTopic[];
};

const DEFAULT_TOPICS: FeedTopic[] = [
  { slug: "all", name: "All Topics" },
  { slug: "ai", name: "AI & ML" },
  { slug: "crypto", name: "Crypto & Web3" },
  { slug: "technology", name: "Technology" },
  { slug: "startups", name: "Startups" },
  { slug: "markets", name: "Markets" },
  { slug: "policy", name: "Policy & Regs" },
];

function getTopicIcon(slug: string) {
  switch (slug.toLowerCase()) {
    case "all":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    case "ai":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <rect width="6" height="6" x="9" y="9" rx="1" />
          <path d="M15 2v2" />
          <path d="M9 2v2" />
          <path d="M20 15h2" />
          <path d="M20 9h2" />
          <path d="M15 20v2" />
          <path d="M9 20v2" />
          <path d="M2 15h2" />
          <path d="M2 9h2" />
        </svg>
      );
    case "crypto":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9h5a2 2 0 0 1 0 4H9.5" />
          <path d="M9.5 13h5.5a2 2 0 0 1 0 4H9.5" />
          <path d="M12 7v2" />
          <path d="M12 17v2" />
        </svg>
      );
    case "technology":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="12" x="3" y="4" rx="2" />
          <path d="M2 18h20" />
        </svg>
      );
    case "startups":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        </svg>
      );
    case "markets":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 3 7 7 4-4 7 7" />
          <path d="M14 3h7v7" />
        </svg>
      );
    case "policy":
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      );
    default:
      return (
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      );
  }
}

async function sendInteraction(articleId: string, type: InteractionType) {
  try {
    await fetch(`/api/articles/${articleId}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
  } catch {
    // Ignore network error in background
  }
}

export function FeedClient({ initialCards, initialTopics }: Props) {
  const { user, token, isAuthenticated } = useAuth();

  const [cards, setCards] = useState<FeedCard[]>(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<"for-you" | "trending" | "latest">("for-you");
  const [topics, setTopics] = useState<FeedTopic[]>(initialTopics || DEFAULT_TOPICS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  const cardRef = useRef<{ flyLeft: () => void; flyRight: () => void } | null>(null);

  const active = cards[activeIndex];
  const nextCards = useMemo(() => cards.slice(activeIndex + 1, activeIndex + 3), [cards, activeIndex]);

  // Load topics if not provided
  useEffect(() => {
    if (!initialTopics || initialTopics.length === 0) {
      fetch("/api/feed/topics")
        .then((res) => res.json())
        .then((data) => {
          if (data.topics && data.topics.length > 0) {
            const list = [{ slug: "all", name: "All Topics" }, ...data.topics.filter((t: FeedTopic) => t.slug !== "all")];
            setTopics(list);
          }
        })
        .catch(() => undefined);
    }
  }, [initialTopics]);

  // Fetch feed cards when topic or sort changes
  const loadFeed = useCallback(
    async (topicSlug: string, sort: "for-you" | "trending" | "latest") => {
      setIsLoading(true);
      try {
        const url = new URL("/api/feed", window.location.origin);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "15");
        url.searchParams.set("sort", sort);
        if (topicSlug !== "all") {
          url.searchParams.set("topicSlug", topicSlug);
        }

        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url.toString(), { headers });
        const data = await res.json();
        if (data && Array.isArray(data.cards)) {
          setCards(data.cards);
          setActiveIndex(0);
          setPage(1);
          setHasMore(data.meta?.hasMore ?? true);
        }
      } catch {
        // Keep existing cards on error
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Handle topic change
  const handleTopicChange = (slug: string) => {
    if (slug === selectedTopic && !isLoading) return;
    setSelectedTopic(slug);
    loadFeed(slug, selectedSort);
  };

  // Handle sort change
  const handleSortChange = (sort: "for-you" | "trending" | "latest") => {
    if (sort === selectedSort && !isLoading) return;
    setSelectedSort(sort);
    loadFeed(selectedTopic, sort);
  };

  // Auto-replenish infinite deck: load next page when 3 cards left
  useEffect(() => {
    const remainingCards = cards.length - activeIndex;
    if (remainingCards <= 3 && hasMore && !isFetchingMore && !isLoading && cards.length > 0) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      const url = new URL("/api/feed", window.location.origin);
      url.searchParams.set("page", String(nextPage));
      url.searchParams.set("limit", "15");
      url.searchParams.set("sort", selectedSort);
      if (selectedTopic !== "all") {
        url.searchParams.set("topicSlug", selectedTopic);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      fetch(url.toString(), { headers })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.cards) && data.cards.length > 0) {
            setCards((prev) => [...prev, ...data.cards]);
            setPage(nextPage);
            setHasMore(data.meta?.hasMore ?? true);
          } else {
            setHasMore(false);
          }
        })
        .catch(() => undefined)
        .finally(() => setIsFetchingMore(false));
    }
  }, [activeIndex, cards.length, hasMore, isFetchingMore, isLoading, page, selectedSort, selectedTopic, token]);

  const commit = useCallback(
    (type: InteractionType) => {
      const current = cards[activeIndex];
      if (type === "save" && current) {
        setSavedArticles((prev) => {
          const next = new Set(prev);
          next.add(current.id);
          return next;
        });
      }
      setActiveIndex((value) => value + 1);
      if (current) void sendInteraction(current.id, type);
    },
    [cards, activeIndex]
  );

  const handleUndo = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  const handleDockSkip = () => {
    if (cardRef.current) {
      cardRef.current.flyLeft();
    } else {
      commit("swipe_left");
    }
  };

  const handleDockLike = () => {
    if (cardRef.current) {
      cardRef.current.flyRight();
    } else {
      commit("swipe_right");
    }
  };

  return (
    <section className="mx-auto flex h-[100dvh] max-h-[100dvh] max-w-md flex-col justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(5rem,calc(env(safe-area-inset-bottom)+4.75rem))] overflow-hidden">
      {/* Top Section: Header & Topic Pills */}
      <div className="shrink-0 space-y-3 pt-1">
        {/* Compact Top Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/preferences" className="group flex items-center gap-2.5">
              <div className="relative">
                {user?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt={user.name || "Avatar"}
                    className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-moss/30 group-hover:ring-moss transition shadow-xs"
                  />
                ) : (
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-fog text-xs font-bold text-moss ring-1 ring-moss/20 group-hover:bg-moss group-hover:text-white transition shadow-xs">
                    {isAuthenticated ? (user?.name?.slice(0, 1) || "U") : "S"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-paper" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-moss/90">Smuke Intelligence</p>
                <h1 className="text-lg font-bold tracking-tight text-ink leading-tight">
                  {selectedSort === "for-you" ? "For You" : selectedSort === "trending" ? "Trending" : "Latest"}
                </h1>
              </div>
            </Link>
          </div>

          {/* Segmented Sort Toggle */}
          <div className="flex items-center rounded-full bg-fog/90 p-1 text-xs border border-ink/[0.04] shadow-xs">
            {(["for-you", "trending", "latest"] as const).map((mode) => {
              const isSelected = selectedSort === mode;
              return (
                <button
                  key={mode}
                  onClick={() => handleSortChange(mode)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-ink shadow-xs"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {mode === "for-you" ? "For You" : mode === "trending" ? "Hot" : "New"}
                </button>
              );
            })}
          </div>
        </header>

        {/* Horizontal Category Pill Bar with Smooth Scrolling & Edge Mask */}
        <div className="relative -mx-4 px-4">
          <div className="topic-scroll-mask no-scrollbar flex items-center gap-2 overflow-x-auto py-1 px-1">
            {topics.map((t) => {
              const isSelected = selectedTopic === t.slug;
              return (
                <button
                  key={t.slug}
                  onClick={() => handleTopicChange(t.slug)}
                  className={`group shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss/40 ${
                    isSelected
                      ? "bg-moss text-white font-semibold shadow-xs shadow-moss/20 ring-1 ring-moss/30 scale-[1.02]"
                      : "bg-white/80 hover:bg-white text-ink/75 hover:text-ink border border-ink/8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-95"
                  }`}
                >
                  <span className={`${isSelected ? "text-white/90" : "text-moss/80 group-hover:text-moss transition-colors"}`}>
                    {getTopicIcon(t.slug)}
                  </span>
                  <span>{t.name}</span>
                  {t.articleCount ? (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-medium leading-none ${
                        isSelected ? "bg-white/20 text-white" : "bg-fog text-ink/60"
                      }`}
                    >
                      {t.articleCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Swipe Deck + Action Dock Container (Tightly Grouped & Centered) */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center min-h-0 w-full py-1.5 sm:py-2">
        {/* Card Deck */}
        <div className="relative h-[min(460px,56dvh)] sm:h-[480px] w-full max-w-[350px] sm:max-w-[365px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center rounded-[2rem] border border-ink/5 bg-white shadow-panel">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-moss border-t-transparent" />
                <p className="text-xs font-semibold uppercase tracking-wider text-moss">Curating intelligence...</p>
              </div>
            </div>
          ) : !active ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-ink/5 bg-white p-6 text-center shadow-panel">
              <div className="mb-3 rounded-full bg-fog p-4 text-moss">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Radar clear</p>
              <h2 className="mt-2 text-xl font-bold text-ink">You are all caught up!</h2>
              <p className="mt-2 text-xs text-ink/65 max-w-xs">
                All intelligence for this topic has been processed. Switch topics or refresh your deck.
              </p>
              <button
                className="mt-5 rounded-full bg-moss px-6 py-2.5 text-xs font-semibold text-white shadow-panel transition hover:opacity-90 active:scale-95"
                onClick={() => loadFeed(selectedTopic, selectedSort)}
              >
                Refresh Deck
              </button>
            </div>
          ) : (
            <>
              {/* Background Deck Card 2 (Bottom shadow) */}
              {nextCards[1] && (
                <div
                  className="absolute inset-0 rounded-[2rem] border border-ink/5 bg-white shadow-sm transition-transform duration-200 pointer-events-none"
                  style={{
                    transform: "translateY(12px) scale(0.93)",
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Background Deck Card 1 (Directly underneath active card - visible with full content during swipe) */}
              {nextCards[0] && (
                <div
                  className="absolute inset-0 flex h-full select-none flex-col overflow-hidden rounded-[2rem] bg-white shadow-md ring-1 ring-ink/5 transition-transform duration-200 pointer-events-none"
                  style={{
                    transform: "translateY(6px) scale(0.965)",
                    opacity: 0.95,
                  }}
                >
                  <CardContent card={nextCards[0]} isSaved={savedArticles.has(nextCards[0].id)} isTopCard={false} />
                </div>
              )}

              {/* Active Swipe Card on Top */}
              <SwipeCard
                key={active.id}
                ref={cardRef}
                card={active}
                isSaved={savedArticles.has(active.id)}
                onCommit={commit}
              />
            </>
          )}
        </div>

        {/* Floating Action Dock (Tightly attached right below Card) */}
        {active && !isLoading && (
          <div className="mt-3 flex items-center justify-center gap-3.5">
            {/* Skip Button */}
            <button
              type="button"
              onClick={handleDockSkip}
              aria-label="Skip article"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-500 shadow-md ring-1 ring-ink/5 hover:bg-rose-50 hover:scale-105 active:scale-95 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {/* Undo Button */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={activeIndex === 0}
              aria-label="Undo previous swipe"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/60 shadow-md ring-1 ring-ink/5 hover:bg-fog hover:text-ink active:scale-95 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>

            {/* Save / Bookmark Button */}
            <button
              type="button"
              onClick={() => commit("save")}
              aria-label="Save article"
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-1 ring-ink/5 active:scale-95 transition ${
                savedArticles.has(active.id)
                  ? "bg-moss text-white"
                  : "bg-white text-moss hover:bg-moss/10"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill={savedArticles.has(active.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={handleDockLike}
              aria-label="Like and curate article"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md ring-1 ring-ink/5 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function CardContent({
  card,
  isSaved,
  onCommit,
  isTopCard = true,
}: {
  card: FeedCard;
  isSaved?: boolean;
  onCommit?: (type: InteractionType) => void;
  isTopCard?: boolean;
}) {
  const sourceUrl = card.source.canonicalUrl || card.source.sourceUrl;

  return (
    <>
      {/* Optional Hero Thumbnail */}
      {card.imageUrl ? (
        <div className="pointer-events-none relative h-36 sm:h-40 w-full shrink-0 overflow-hidden bg-fog">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl}
            alt={card.content.title}
            className="h-full w-full object-cover pointer-events-none"
            onError={(e) => {
              (e.target as HTMLElement).parentElement!.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">
              {card.source.name}
            </span>
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-semibold backdrop-blur-xs uppercase tracking-wider">
              {card.classification.primaryCategory}
            </span>
          </div>
        </div>
      ) : null}

      {/* Card Content Area */}
      <div className="pointer-events-none flex min-h-0 flex-1 flex-col justify-between p-4 sm:p-4.5">
        <div className="min-h-0 flex-1 overflow-hidden space-y-2.5 pr-0.5">
          {/* Metadata Header if no image */}
          {!card.imageUrl && (
            <div className="flex items-center justify-between gap-2 border-b border-ink/5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink/60">
              <span className="text-moss font-bold">{card.source.name}</span>
              <span className="rounded-full bg-fog px-2 py-0.5 text-[9px] text-ink/75">
                {card.classification.primaryCategory}
              </span>
            </div>
          )}

          {/* Headline */}
          <h2 className="text-base sm:text-[1.1rem] font-bold leading-snug tracking-tight text-ink line-clamp-3">
            {card.content.title}
          </h2>

          {/* AI Summary */}
          <p className="text-xs sm:text-sm leading-relaxed text-ink/75 line-clamp-4">
            {card.content.summary}
          </p>

          {/* Tags & Reason Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {card.classification.topicTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-fog px-2 py-0.5 text-[10px] font-medium text-ink/70"
              >
                #{tag}
              </span>
            ))}

            {card.feed?.reasonTags && card.feed.reasonTags.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 text-[10px] font-medium text-moss">
                <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />
                {card.feed.reasonTags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className={`${isTopCard ? "pointer-events-auto" : "pointer-events-none"} shrink-0 border-t border-ink/5 pt-3 mt-1.5`}>
          <div className="flex items-center justify-between gap-2">
            <a
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-3.5 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-ink/90 active:scale-[0.99] shadow-xs"
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (isTopCard) {
                  e.stopPropagation();
                } else {
                  e.preventDefault();
                }
              }}
            >
              <span>Read Source</span>
              <span aria-hidden="true">↗</span>
            </a>

            <button
              type="button"
              className={`rounded-full px-3.5 py-2.5 text-xs font-semibold transition ${
                isSaved
                  ? "bg-moss text-white shadow-xs"
                  : "bg-fog text-ink/80 hover:bg-moss/15 hover:text-moss"
              }`}
              onClick={(e) => {
                if (isTopCard && onCommit) {
                  e.stopPropagation();
                  onCommit("save");
                }
              }}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface SwipeCardHandle {
  flyLeft: () => void;
  flyRight: () => void;
}

const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    card: FeedCard;
    isSaved: boolean;
    onCommit: (type: InteractionType) => void;
  }
>(function SwipeCard({ card, isSaved, onCommit }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-14, 14]);
  const [doubleLiked, setDoubleLiked] = useState(false);
  const [isFlyingOut, setIsFlyingOut] = useState(false);

  // Dynamic opacity transforms for drag stamps
  const relevantStampOpacity = useTransform(x, [25, 95], [0, 1]);
  const passStampOpacity = useTransform(x, [-25, -95], [0, 1]);

  const flyOut = useCallback(
    (direction: "left" | "right", type: InteractionType) => {
      if (isFlyingOut) return;
      setIsFlyingOut(true);
      const targetX = direction === "right" ? 650 : -650;
      animate(x, targetX, {
        duration: 0.22,
        ease: [0.32, 0.72, 0, 1],
        onComplete: () => {
          onCommit(type);
        },
      });
    },
    [isFlyingOut, onCommit, x]
  );

  useImperativeHandle(ref, () => ({
    flyLeft: () => flyOut("left", "swipe_left"),
    flyRight: () => flyOut("right", "swipe_right"),
  }));

  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    if (isFlyingOut) return;
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    // Detect intentional swipe by distance (>105px) or quick flick velocity (>400px/s)
    if (offsetX > 105 || velocityX > 400) {
      flyOut("right", "swipe_right");
    } else if (offsetX < -105 || velocityX < -400) {
      flyOut("left", "swipe_left");
    }
  };

  const handleDoubleTap = () => {
    if (isFlyingOut) return;
    setDoubleLiked(true);
    setTimeout(() => {
      onCommit("double_like");
    }, 380);
  };

  return (
    <motion.article
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, touchAction: "none" }}
      className="absolute inset-0 z-20 flex h-full cursor-grab select-none flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-ink/5 active:cursor-grabbing"
      onDoubleClick={handleDoubleTap}
    >
      {/* Visual Gesture Stamps */}
      <motion.div
        style={{ opacity: relevantStampOpacity }}
        className="pointer-events-none absolute right-4 top-4 z-30 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-600 rotate-12 backdrop-blur-xs shadow-sm"
      >
        RELEVANT
      </motion.div>

      <motion.div
        style={{ opacity: passStampOpacity }}
        className="pointer-events-none absolute left-4 top-4 z-30 rounded-xl border-2 border-rose-500 bg-rose-500/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-rose-600 -rotate-12 backdrop-blur-xs shadow-sm"
      >
        PASS
      </motion.div>

      {/* Double Tap Heart Burst Animation */}
      <AnimatePresence>
        {doubleLiked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-xs"
          >
            <div className="rounded-full bg-white p-5 shadow-2xl">
              <svg className="h-14 w-14 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent
        card={card}
        isSaved={isSaved}
        onCommit={onCommit}
        isTopCard={true}
      />
    </motion.article>
  );
});

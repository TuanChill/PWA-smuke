"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Draft } from "@/lib/store/memory-store";
import {
  useCommentaryDraftsQuery,
  useDeleteDraftMutation,
} from "@/lib/hooks/queries/use-commentary-queries";

interface Props {
  initialDrafts: Draft[];
}

type PlatformFilter = "all" | "linkedin" | "twitter_x" | "executive_memo";
type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 5;

export function CommentaryClient({ initialDrafts }: Props) {
  const { data: commentaryData } = useCommentaryDraftsQuery();
  const deleteMutation = useDeleteDraftMutation();

  const [localDrafts, setLocalDrafts] = useState<Draft[] | null>(null);
  const drafts = localDrafts ?? (commentaryData?.drafts || initialDrafts);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");

  // Category counts
  const counts = useMemo(() => {
    return {
      all: drafts.length,
      linkedin: drafts.filter((d) => d.platform === "linkedin").length,
      twitter_x: drafts.filter((d) => d.platform === "twitter_x").length,
      executive_memo: drafts.filter((d) => d.platform === "executive_memo").length,
    };
  }, [drafts]);

  // Filter & sort drafts
  const filteredAndSortedDrafts = useMemo(() => {
    let result = [...drafts];

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter((d) => d.platform === platformFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.draft.toLowerCase().includes(q) ||
          (d.articleTitle && d.articleTitle.toLowerCase().includes(q)) ||
          (d.userComment && d.userComment.toLowerCase().includes(q)) ||
          (d.sourceName && d.sourceName.toLowerCase().includes(q)) ||
          (d.platform && d.platform.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [drafts, platformFilter, searchQuery, sortOrder]);

  // Pagination calculations
  const totalFiltered = filteredAndSortedDrafts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalFiltered);
  const paginatedDrafts = filteredAndSortedDrafts.slice(startIndex, endIndex);

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePlatformChange = (p: PlatformFilter) => {
    setPlatformFilter(p);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setPlatformFilter("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const areAllVisibleExpanded =
    paginatedDrafts.length > 0 &&
    paginatedDrafts.every((d) => expandedIds.has(d.id));

  const toggleExpandAll = () => {
    if (areAllVisibleExpanded) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        paginatedDrafts.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        paginatedDrafts.forEach((d) => next.add(d.id));
        return next;
      });
    }
  };

  const handleCopy = async (draft: Draft, textToCopy?: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy || draft.draft);
      setCopiedId(draft.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async (draft: Draft) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: draft.articleTitle || "Social Post Draft",
          text: draft.draft,
          url: draft.sourceUrl,
        });
      } catch {
        handleCopy(draft);
      }
    } else {
      handleCopy(draft);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setLocalDrafts((prev) => (prev ? prev.filter((d) => d.id !== id) : drafts.filter((d) => d.id !== id)));
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      // Handled
    }
  };

  const handleSaveEdit = (draft: Draft) => {
    if (editedText.trim()) {
      setLocalDrafts((prev) =>
        (prev || drafts).map((d) => (d.id === draft.id ? { ...d, draft: editedText.trim() } : d))
      );
    }
    setEditingId(null);
  };

  return (
    <div className="mt-5 space-y-4">
      {/* 1. Global Search & Filter Controls */}
      {drafts.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-white/70 p-3.5 shadow-xs border border-ink/5 backdrop-blur-md">
          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink/40">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by topic, take, headline or draft content..."
              className="w-full rounded-xl border border-ink/10 bg-white py-2 pl-9 pr-9 text-xs text-ink placeholder-ink/40 transition focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/40 hover:text-ink transition"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Platform Filter Tabs & Sort Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePlatformChange("all")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  platformFilter === "all"
                    ? "bg-moss text-white shadow-xs"
                    : "bg-fog/70 text-ink/70 hover:bg-fog hover:text-ink"
                }`}
              >
                All <span className="opacity-75">({counts.all})</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlatformChange("linkedin")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  platformFilter === "linkedin"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                LinkedIn <span className="opacity-75">({counts.linkedin})</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlatformChange("twitter_x")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  platformFilter === "twitter_x"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                }`}
              >
                X / Twitter <span className="opacity-75">({counts.twitter_x})</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlatformChange("executive_memo")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  platformFilter === "executive_memo"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Memo <span className="opacity-75">({counts.executive_memo})</span>
              </button>
            </div>

            {/* Quick Actions: Sort & Expand All */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
                className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-ink/70 hover:text-ink transition shadow-xs"
              >
                <span>{sortOrder === "newest" ? "↓ Newest" : "↑ Oldest"}</span>
              </button>

              {paginatedDrafts.length > 0 && (
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-ink/70 hover:text-ink transition shadow-xs"
                >
                  <span>{areAllVisibleExpanded ? "Collapse All" : "Expand All"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Drafts List / Empty States */}
      {drafts.length === 0 ? (
        /* Empty State: Zero Drafts */
        <div className="rounded-[2rem] border border-ink/5 bg-white p-8 text-center shadow-panel">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fog text-moss text-xl">
            ✍️
          </div>
          <h2 className="text-lg font-bold text-ink">No drafts created yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink/70">
            Open any card on the swipe feed and tap the{" "}
            <span className="font-semibold text-indigo-600">💬 Comment</span> button to draft a contextualized social post.
          </p>
          <Link
            href="/feed"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-moss/90 transition"
          >
            Go to Swipe Feed ↗
          </Link>
        </div>
      ) : filteredAndSortedDrafts.length === 0 ? (
        /* Empty State: Search / Filter No Match */
        <div className="rounded-[2rem] border border-ink/5 bg-white p-7 text-center shadow-panel">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-fog text-ink/50 text-base">
            🔍
          </div>
          <h3 className="text-sm font-bold text-ink">No drafts match your filters</h3>
          <p className="mt-1 text-xs text-ink/60">
            Try adjusting your search query or switching to another platform tab.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fog px-4 py-1.5 text-xs font-semibold text-ink hover:bg-ink/10 transition"
          >
            Reset Filters ↺
          </button>
        </div>
      ) : (
        /* Paginated Accordion Cards */
        <div className="space-y-3">
          {paginatedDrafts.map((draft) => {
            const isExpanded = expandedIds.has(draft.id);
            const isCopied = copiedId === draft.id;
            const isEditing = editingId === draft.id;

            const platformLabel =
              draft.platform === "twitter_x"
                ? "X / Twitter"
                : draft.platform === "executive_memo"
                ? "Executive Memo"
                : "LinkedIn Post";

            const platformColor =
              draft.platform === "twitter_x"
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : draft.platform === "executive_memo"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <article
                key={draft.id}
                className="group overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-panel transition hover:border-ink/10 hover:shadow-md"
              >
                {/* Accordion Header Surface (Click to Toggle) */}
                <div
                  onClick={() => toggleExpand(draft.id)}
                  className="cursor-pointer select-none p-4 sm:p-5 transition hover:bg-fog/20"
                >
                  {/* Top Meta Line: Platform + Source + Date + Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${platformColor}`}>
                        {platformLabel}
                      </span>
                      {draft.sourceName && (
                        <span className="text-[11px] font-semibold text-moss">
                          via {draft.sourceName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-ink/50" onClick={(e) => e.stopPropagation()}>
                      <span>{new Date(draft.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(draft.id)}
                        aria-label="Delete draft"
                        className="ml-1 rounded-full p-1 text-ink/40 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Article Title Snapshot */}
                  {draft.articleTitle && (
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-ink line-clamp-1 leading-snug">
                        📰 {draft.articleTitle}
                      </h3>
                      {/* Chevron Indicator */}
                      <span
                        className={`shrink-0 text-ink/40 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-moss" : ""
                        }`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  )}

                  {/* User Take Snapshot */}
                  {draft.userComment && (
                    <div className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-xl bg-fog/60 px-2.5 py-1 text-[10px] text-ink/75 italic line-clamp-1">
                      <span>💡 Take:</span>
                      <span className="truncate">&ldquo;{draft.userComment}&rdquo;</span>
                    </div>
                  )}

                  {/* Collapsed Snippet Preview (When not expanded) */}
                  {!isExpanded && (
                    <p className="mt-2 text-xs leading-relaxed text-ink/60 line-clamp-2 font-normal font-sans">
                      {draft.draft}
                    </p>
                  )}
                </div>

                {/* Accordion Expanded Body (Framer Motion) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-ink/5 bg-paper/40 px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
                    >
                      {/* Draft Content: Display or Inline Edit */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={7}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs leading-relaxed text-ink font-normal focus:border-moss focus:outline-none focus:ring-1 focus:ring-moss"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold text-ink/60 hover:text-ink"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(draft)}
                              className="rounded-full bg-moss px-4 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-moss/90"
                            >
                              Save Draft
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-2xl border border-ink/5 bg-white p-3.5 shadow-inner">
                          <div className="whitespace-pre-wrap text-xs leading-relaxed text-ink font-normal font-sans select-text">
                            {draft.draft}
                          </div>
                          {draft.rationale && (
                            <div className="mt-2.5 border-t border-ink/5 pt-2 text-[10px] italic text-ink/50">
                              💡 {draft.rationale}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expanded Actions Footer */}
                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-1">
                        {draft.sourceUrl ? (
                          <a
                            href={draft.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-moss hover:underline inline-flex items-center gap-1"
                          >
                            Source article ↗
                          </a>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(draft.id);
                                setEditedText(draft.draft);
                              }}
                              className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold text-ink/70 hover:text-ink transition shadow-xs"
                            >
                              Edit ✏️
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleShare(draft)}
                            className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold text-ink/70 hover:text-ink transition shadow-xs"
                          >
                            <span>Share 📤</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(draft, isEditing ? editedText : draft.draft)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold transition shadow-xs ${
                              isCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-ink text-white hover:bg-ink/90 active:scale-95"
                            }`}
                          >
                            <span>{isCopied ? "Copied! ✓" : "📋 Copy Post"}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      )}

      {/* 3. Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-ink/60">
          <p className="text-[11px] font-medium">
            Showing <span className="font-semibold text-ink">{startIndex + 1}–{endIndex}</span> of{" "}
            <span className="font-semibold text-ink">{totalFiltered}</span> drafts
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink transition hover:bg-fog disabled:opacity-40 disabled:pointer-events-none shadow-xs"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`h-7 w-7 rounded-lg text-[11px] font-semibold transition ${
                  safePage === pageNum
                    ? "bg-moss text-white shadow-xs"
                    : "border border-ink/10 bg-white text-ink hover:bg-fog"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink transition hover:bg-fog disabled:opacity-40 disabled:pointer-events-none shadow-xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

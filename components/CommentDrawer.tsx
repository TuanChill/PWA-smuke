"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedCard } from "@/lib/types";
import { useCreateDraftMutation } from "@/lib/hooks/queries/use-commentary-queries";

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  card: FeedCard | null;
  onDraftCreated?: () => void;
}

type Platform = "linkedin" | "twitter_x" | "executive_memo";

const PERSPECTIVE_CHIPS = [
  { label: "🔥 Bullish Take", angle: "Strong growth and high adoption potential", text: "This moves the needle significantly for the industry because " },
  { label: "🧐 Skeptical", angle: "Critical assessment and potential headwinds", text: "The headline sounds impressive, but execution and real-world unit economics remain unproven: " },
  { label: "💼 B2B / Enterprise", angle: "Enterprise ROI and operational shift", text: "For enterprise leaders and operators, the immediate implication here is " },
  { label: "💡 Key Takeaway", angle: "Practical business takeaway", text: "The core signal beneath the noise is simple: " },
  { label: "🚀 Tech Shift", angle: "Architecture and paradigm change", text: "This represents a fundamental platform shift that will change how teams build: " }
];

export function CommentDrawer({ isOpen, onClose, card, onDraftCreated }: CommentDrawerProps) {
  const createDraftMutation = useCreateDraftMutation();
  const [commentText, setCommentText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("linkedin");
  const [selectedAngle, setSelectedAngle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ draft: string; rationale: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Automatically reset all drawer state when swiping to a new article
  useEffect(() => {
    setCommentText("");
    setSelectedPlatform("linkedin");
    setSelectedAngle("");
    setIsLoading(false);
    setGeneratedDraft(null);
    setCopied(false);
    setSavedSuccess(false);
  }, [card?.id]);

  if (!card) return null;

  const sourceUrl = card.source.canonicalUrl || card.source.sourceUrl;

  const handleChipClick = (chip: typeof PERSPECTIVE_CHIPS[0]) => {
    setSelectedAngle(chip.angle);
    if (!commentText.trim()) {
      setCommentText(chip.text);
    } else {
      setCommentText((prev) => `${prev} (${chip.angle})`);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);
    setSavedSuccess(false);

    try {
      const draft = await createDraftMutation.mutateAsync({
        articleId: card.id,
        userComment: commentText.trim() || undefined,
        platform: selectedPlatform,
        perspectiveAngle: selectedAngle || undefined,
        article: {
          title: card.content.title,
          summary: card.content.summary,
          sourceName: card.source.name,
          sourceUrl,
          topicTags: card.classification.topicTags,
          primaryCategory: card.classification.primaryCategory
        }
      });

      if (draft) {
        setGeneratedDraft({
          draft: draft.draft,
          rationale: draft.rationale
        });
        if (onDraftCreated) onDraftCreated();
      }
    } catch {
      // Fallback local mock draft on error
      const userAngle = commentText.trim() || "Strategic industry perspective.";
      setGeneratedDraft({
        draft: `${userAngle}\n\n${card.content.title} highlights a pivotal movement in ${card.classification.primaryCategory}.\n\n${card.content.summary}\n\nKey takeaway: ${card.content.compressedIntent}\n\n📖 Read full source: ${sourceUrl}\n\n#${card.classification.primaryCategory} #TechNews #SmukeIntelligence`,
        rationale: "Locally composed social narrative."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedDraft) return;
    try {
      await navigator.clipboard.writeText(generatedDraft.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (!generatedDraft) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: card.content.title,
          text: generatedDraft.draft,
          url: sourceUrl
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleReset = () => {
    setGeneratedDraft(null);
    setCommentText("");
    setSelectedAngle("");
    setCopied(false);
    setSavedSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl ring-1 ring-ink/10 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            {/* Top Drag Handle & Title */}
            <div className="flex shrink-0 items-center justify-between border-b border-ink/5 px-5 pt-3.5 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/10 text-moss font-bold text-xs">
                  ✍️
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Draft Social Post</h2>
                  <p className="text-[10px] font-medium text-ink/60">Contextualize news with your narrative</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close comment drawer"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-fog text-ink/60 hover:bg-ink/10 hover:text-ink transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4 text-xs no-scrollbar">
              {/* Article Context Snapshot */}
              <div className="rounded-2xl bg-fog/70 p-3.5 border border-ink/5">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-moss">
                  <span>{card.source.name}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[9px] text-ink/70">
                    {card.classification.primaryCategory}
                  </span>
                </div>
                <h3 className="mt-1 font-bold text-ink text-xs sm:text-sm line-clamp-2 leading-snug">
                  {card.content.title}
                </h3>
                <p className="mt-1 text-[11px] text-ink/70 line-clamp-2 leading-relaxed">
                  {card.content.summary}
                </p>
              </div>

              {!generatedDraft ? (
                <>
                  {/* Quick Perspective Angle Chips */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                      1. Quick Angle (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PERSPECTIVE_CHIPS.map((chip) => {
                        const isSelected = selectedAngle === chip.angle;
                        return (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => handleChipClick(chip)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                              isSelected
                                ? "bg-moss text-white shadow-xs"
                                : "bg-fog text-ink/75 hover:bg-moss/10 hover:text-moss"
                            }`}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Perspective Input Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                        2. Your Point of View
                      </label>
                      <span className="text-[10px] text-ink/50">{commentText.length}/1000</span>
                    </div>
                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="What is your angle or take on this? (e.g., 'This fundamentally alters our roadmap because...')"
                      className="w-full rounded-xl border border-ink/10 bg-white p-3 text-xs leading-relaxed text-ink placeholder:text-ink/40 focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
                    />
                  </div>

                  {/* Target Platform Segmented Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                      3. Target Format
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-fog p-1 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("linkedin")}
                        className={`rounded-lg py-1.5 text-center transition ${
                          selectedPlatform === "linkedin"
                            ? "bg-white text-ink shadow-xs"
                            : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        LinkedIn Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("twitter_x")}
                        className={`rounded-lg py-1.5 text-center transition ${
                          selectedPlatform === "twitter_x"
                            ? "bg-white text-ink shadow-xs"
                            : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        X / Twitter
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("executive_memo")}
                        className={`rounded-lg py-1.5 text-center transition ${
                          selectedPlatform === "executive_memo"
                            ? "bg-white text-ink shadow-xs"
                            : "text-ink/60 hover:text-ink"
                        }`}
                      >
                        Exec Memo
                      </button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleGenerate}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-moss py-3 text-xs font-bold text-white shadow-md transition hover:bg-moss/90 active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Contextualizing & Drafting...</span>
                        </>
                      ) : (
                        <>
                          <span>✨ Generate Social Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Generated Draft Output Surface */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2.5 py-0.5 text-[10px] font-bold text-moss uppercase tracking-wider">
                      <span>✓ Ready for {selectedPlatform === "linkedin" ? "LinkedIn" : selectedPlatform === "twitter_x" ? "X / Twitter" : "Executive Memo"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[11px] font-semibold text-ink/60 hover:text-ink transition"
                    >
                      Edit Input ↺
                    </button>
                  </div>

                  {/* Rendered Textarea (Editable Draft) */}
                  <div className="relative rounded-2xl border border-ink/10 bg-fog/30 p-3.5 shadow-inner">
                    <textarea
                      rows={7}
                      value={generatedDraft.draft}
                      onChange={(e) => setGeneratedDraft({ ...generatedDraft, draft: e.target.value })}
                      className="w-full bg-transparent text-xs leading-relaxed text-ink font-normal focus:outline-none resize-none font-sans"
                    />
                    <div className="mt-2 border-t border-ink/5 pt-2 text-[10px] italic text-ink/50">
                      💡 {generatedDraft.rationale}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition shadow-xs ${
                          copied
                            ? "bg-emerald-600 text-white"
                            : "bg-ink text-white hover:bg-ink/90 active:scale-98"
                        }`}
                      >
                        <span>{copied ? "Copied to Clipboard! ✓" : "📋 Copy Post"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-fog px-4 py-2.5 text-xs font-bold text-ink hover:bg-ink/10 active:scale-98 transition"
                      >
                        <span>📤 Share</span>
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-ink/60">
                      Saved to your <a href="/commentary" className="font-semibold text-moss underline">Drafts Hub</a> automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

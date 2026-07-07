"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import type { FeedCard, InteractionType } from "@/lib/types";

type Props = {
  initialCards: FeedCard[];
};

async function sendInteraction(articleId: string, type: InteractionType) {
  await fetch(`/api/articles/${articleId}/interact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type })
  });
}

export function FeedClient({ initialCards }: Props) {
  const [cards, setCards] = useState(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = cards[activeIndex];
  const nextCards = useMemo(() => cards.slice(activeIndex + 1, activeIndex + 10), [cards, activeIndex]);

  useEffect(() => {
    if (cards.length === 0) {
      fetch("/api/feed/refresh", { method: "POST" })
        .then(() => fetch("/api/feed"))
        .then((response) => response.json())
        .then((data) => setCards(data.cards ?? []))
        .catch(() => undefined);
    }
  }, [cards.length]);

  if (!active) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">Queue empty</p>
        <h1 className="mt-3 text-3xl font-semibold">Refresh your feed</h1>
        <button className="mt-6 rounded-full bg-moss px-5 py-3 font-semibold text-white" onClick={() => location.reload()}>
          Reload
        </button>
      </div>
    );
  }

  async function commit(type: InteractionType) {
    const current = cards[activeIndex];
    setActiveIndex((value) => value + 1);
    if (current) void sendInteraction(current.id, type);
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col px-4 pb-24 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Smuke feed</p>
          <h1 className="text-2xl font-semibold text-ink">For you</h1>
        </div>
        <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-panel" onClick={() => fetch("/api/feed/refresh", { method: "POST" })}>
          Refresh
        </button>
      </header>

      <div className="relative h-[620px] max-h-[72vh] min-h-[520px]">
        {nextCards
          .slice(0, 2)
          .reverse()
          .map((card, index) => (
            <div
              key={card.id}
              className="absolute inset-0 rounded-[2rem] border border-ink/10 bg-white shadow-panel"
              style={{ transform: `translateY(${(2 - index) * 12}px) scale(${1 - (2 - index) * 0.035})` }}
            />
          ))}
        <SwipeCard card={active} onCommit={commit} />
      </div>
    </section>
  );
}

function SwipeCard({ card, onCommit }: { card: FeedCard; onCommit: (type: InteractionType) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-9, 0, 9]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, -24], [1, 0]);
  const sourceUrl = card.source.sourceUrl;

  const bind = useDrag(({ down, movement: [mx], velocity: [vx], direction: [dx] }) => {
    x.set(down ? mx : 0);
    if (!down && (Math.abs(mx) > 120 || Math.abs(vx) > 0.6)) {
      onCommit(dx > 0 ? "swipe_right" : "swipe_left");
    }
  });

  return (
    <div {...bind()} className="absolute inset-0" style={{ touchAction: "none" }}>
      <motion.article
        style={{ x, rotate }}
        className="flex h-full cursor-grab flex-col overflow-hidden rounded-[2rem] bg-white shadow-card active:cursor-grabbing"
        onDoubleClick={() => onCommit("double_like")}
      >
      <div className="relative shrink-0 bg-moss px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/65">
          <span className="min-w-0 truncate">{card.source.name}</span>
          <span>{card.classification.primaryCategory}</span>
        </div>
        <h2 className="mt-10 line-clamp-4 text-[1.65rem] font-semibold leading-tight">{card.content.title}</h2>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/60">
          <span>Swipe left/right</span>
          <span>Double tap to strong-like</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <p className="text-base leading-7 text-ink/76">{card.content.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {card.classification.topicTags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-fog px-3 py-1 text-xs font-medium text-moss">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {card.feed.reasonTags.map((tag) => (
              <span key={tag} className="rounded-full border border-ink/10 px-3 py-1 text-xs text-ink/62">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-ink/10 bg-white/96 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
          <a className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-white" href={sourceUrl} target="_blank" rel="noreferrer">
            Source
          </a>
          <button className="rounded-full bg-fog px-4 py-3 text-sm font-semibold text-moss" onClick={() => onCommit("save")}>
            Save
          </button>
          </div>
        </div>
      </div>

      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute right-5 top-24 rotate-6 rounded-2xl bg-moss px-5 py-3 text-lg font-black uppercase tracking-[0.2em] text-white">
        Like
      </motion.div>
      <motion.div style={{ opacity: skipOpacity }} className="pointer-events-none absolute left-5 top-24 -rotate-6 rounded-2xl bg-coral px-5 py-3 text-lg font-black uppercase tracking-[0.2em] text-white">
        Skip
      </motion.div>
      </motion.article>
    </div>
  );
}

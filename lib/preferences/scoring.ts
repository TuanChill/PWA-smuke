import type { Article } from "@/lib/types";
import type { UserEventType } from "@/lib/tracking/event-types";

export type UserEvent = {
  id: string;
  userId: string;
  sessionId: string;
  eventType: UserEventType;
  entityType: "article" | "topic" | "source" | "ad" | "search" | "comment";
  entityId?: string;
  topics: string[];
  sourceId?: string;
  value: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type UserTopicScore = {
  userId: string;
  topic: string;
  shortScore: number;
  mediumScore: number;
  longScore: number;
  negativeScore: number;
  explicit: boolean;
  muted: boolean;
  lastUpdatedAt: string;
};

export type UserSourceScore = {
  userId: string;
  sourceId: string;
  sourceName: string;
  affinityScore: number;
  trustScore: number;
  fatigueScore: number;
  lastUpdatedAt: string;
};

export function deriveEventTopics(eventTopics: string[], article?: Article) {
  return Array.from(new Set([...eventTopics, ...(article?.classification.topicTags ?? [])])).filter(Boolean);
}

export function applyTopicEvent(existing: UserTopicScore | undefined, event: UserEvent, topic: string): UserTopicScore {
  const now = new Date().toISOString();
  const current =
    existing ??
    ({
      userId: event.userId,
      topic,
      shortScore: 0,
      mediumScore: 0,
      longScore: 0,
      negativeScore: 0,
      explicit: false,
      muted: false,
      lastUpdatedAt: now
    } satisfies UserTopicScore);

  const weight = event.value;
  const positive = Math.max(0, weight);
  const negative = Math.min(0, weight);
  const explicitBoost = event.eventType === "follow_topic" || event.eventType === "mute_topic";

  return {
    ...current,
    shortScore: clampScore(current.shortScore * 0.92 + positive + negative),
    mediumScore: clampScore(current.mediumScore * 0.985 + positive * 0.45 + negative * 0.6),
    longScore: clampScore(current.longScore * 0.997 + positive * 0.12 + negative * 0.18),
    negativeScore: clampScore(current.negativeScore + Math.abs(negative)),
    explicit: current.explicit || explicitBoost,
    muted: current.muted || event.eventType === "mute_topic",
    lastUpdatedAt: now
  };
}

export function applySourceEvent(existing: UserSourceScore | undefined, event: UserEvent, article?: Article): UserSourceScore | undefined {
  const sourceName = article?.source.name;
  const sourceId = event.sourceId ?? article?.source.name;
  if (!sourceId || !sourceName) return undefined;
  const now = new Date().toISOString();
  const current =
    existing ??
    ({
      userId: event.userId,
      sourceId,
      sourceName,
      affinityScore: 0,
      trustScore: 0.5,
      fatigueScore: 0,
      lastUpdatedAt: now
    } satisfies UserSourceScore);

  return {
    ...current,
    affinityScore: clampScore(current.affinityScore * 0.98 + event.value * 0.35),
    trustScore: clamp01(current.trustScore + Math.max(0, event.value) * 0.015),
    fatigueScore: clampScore(current.fatigueScore * 0.96 + (event.eventType === "hide_article" ? 1 : 0)),
    lastUpdatedAt: now
  };
}

export function applyExplicitTopic(score: UserTopicScore | undefined, userId: string, topic: string, action: "boost" | "reduce" | "mute" | "clear") {
  const now = new Date().toISOString();
  const current =
    score ??
    ({
      userId,
      topic,
      shortScore: 0,
      mediumScore: 0,
      longScore: 0,
      negativeScore: 0,
      explicit: true,
      muted: false,
      lastUpdatedAt: now
    } satisfies UserTopicScore);

  if (action === "clear") {
    return { ...current, shortScore: 0, mediumScore: 0, longScore: 0, negativeScore: 0, explicit: true, muted: false, lastUpdatedAt: now };
  }

  if (action === "mute") {
    return { ...current, negativeScore: 8, explicit: true, muted: true, lastUpdatedAt: now };
  }

  const delta = action === "boost" ? 3 : -3;
  return {
    ...current,
    mediumScore: clampScore(current.mediumScore + delta),
    longScore: clampScore(current.longScore + delta * 0.5),
    negativeScore: action === "reduce" ? clampScore(current.negativeScore + 2) : current.negativeScore,
    explicit: true,
    muted: false,
    lastUpdatedAt: now
  };
}

export function clampScore(value: number) {
  return Number(Math.max(-10, Math.min(10, value)).toFixed(3));
}

function clamp01(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}

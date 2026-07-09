import type { UserSourceScore, UserTopicScore } from "@/lib/preferences/scoring";
import type { ConsentSettings } from "@/lib/types";

export type UserMemorySnapshot = {
  userId: string;
  stablePreferences: Record<string, number>;
  shortTermIntent: Record<string, number>;
  negativePreferences: Record<string, number>;
  sourceAffinity: Record<string, number>;
  searchStyle: {
    prefersRecent: boolean;
    prefersDataHeavy: boolean;
    usesShortQueries: boolean;
  };
  adAffinity: Record<string, number>;
  recentSentiment: Record<string, string>;
  llmSummary: string;
  updatedAt: string;
};

export function buildUserMemorySnapshot(input: {
  userId: string;
  topicScores: UserTopicScore[];
  sourceScores: UserSourceScore[];
  consents: ConsentSettings;
}): UserMemorySnapshot {
  const stablePreferences = Object.fromEntries(
    input.topicScores
      .filter((score) => !score.muted && score.longScore > 0.2)
      .sort((a, b) => b.longScore - a.longScore)
      .slice(0, 12)
      .map((score) => [score.topic, score.longScore])
  );

  const shortTermIntent = Object.fromEntries(
    input.topicScores
      .filter((score) => !score.muted && score.shortScore > 0.2)
      .sort((a, b) => b.shortScore - a.shortScore)
      .slice(0, 12)
      .map((score) => [score.topic, score.shortScore])
  );

  const negativePreferences = Object.fromEntries(
    input.topicScores
      .filter((score) => score.muted || score.negativeScore > 0.5)
      .sort((a, b) => b.negativeScore - a.negativeScore)
      .slice(0, 12)
      .map((score) => [score.topic, -Math.abs(score.negativeScore)])
  );

  const sourceAffinity = Object.fromEntries(
    input.sourceScores
      .sort((a, b) => b.affinityScore - a.affinityScore)
      .slice(0, 10)
      .map((score) => [score.sourceName, score.affinityScore])
  );

  const adAffinity = input.consents.consentMarketingPersonalisation
    ? Object.fromEntries(Object.entries({ ...stablePreferences, ...shortTermIntent }).slice(0, 10))
    : {};

  return {
    userId: input.userId,
    stablePreferences,
    shortTermIntent,
    negativePreferences,
    sourceAffinity,
    searchStyle: {
      prefersRecent: true,
      prefersDataHeavy: Boolean(stablePreferences.markets || stablePreferences.finance || stablePreferences.crypto),
      usesShortQueries: true
    },
    adAffinity,
    recentSentiment: {},
    llmSummary: summariseMemory(stablePreferences, shortTermIntent, negativePreferences),
    updatedAt: new Date().toISOString()
  };
}

function summariseMemory(stable: Record<string, number>, shortTerm: Record<string, number>, negative: Record<string, number>) {
  const stableTopics = Object.keys(stable).slice(0, 4);
  const intentTopics = Object.keys(shortTerm).slice(0, 4);
  const suppressed = Object.keys(negative).slice(0, 3);
  return [
    stableTopics.length ? `Stable interests: ${stableTopics.join(", ")}.` : "Stable interests are still forming.",
    intentTopics.length ? `Current intent: ${intentTopics.join(", ")}.` : "No strong short-term intent yet.",
    suppressed.length ? `Suppressed topics: ${suppressed.join(", ")}.` : "No strong negative preferences yet."
  ].join(" ");
}

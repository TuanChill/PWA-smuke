import { memoryStore } from "@/lib/store/memory-store";
import type { Article, FeedCard, PreferenceNode } from "@/lib/types";
import { feedScoringWeights } from "@/lib/ranking/scoring-weights";
import type { UserMemorySnapshot } from "@/lib/preferences/user-profile-builder";

function affinity(labels: string[], preferences: PreferenceNode[]) {
  if (labels.length === 0) return 0.3;
  const scores = labels.map((label) => preferences.find((pref) => pref.label.toLowerCase() === label.toLowerCase())?.score ?? 0.2);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function rankArticle(article: Article, preferences: PreferenceNode[], index: number, memory?: UserMemorySnapshot): FeedCard {
  const topicAffinity = affinity(article.classification.topicTags, preferences);
  const memoryTopicMatch = memoryMatch(article.classification.topicTags, memory);
  const entityAffinity = affinity(article.classification.entityTags, preferences);
  const sourceAffinity = Math.max(affinity([article.source.name], preferences), memory?.sourceAffinity[article.source.name] ?? 0);
  const regionRelevance = affinity(article.classification.regionTags, preferences);
  const professionalObjectiveMatch = article.classification.professionalRelevanceTags.length > 0 ? 0.75 : 0.35;
  const sentimentAlignment = 0.55;
  const recencyScore = article.ranking.freshnessScore;
  const diversityScore = index % 4 === 0 ? 0.85 : 0.55;
  const trendingScore = article.ranking.importanceScore;
  const explorationBonus = memoryTopicMatch > 0 ? 0.1 : 0.45;
  const duplicatePenalty = index > 0 && article.ranking.duplicateClusterId ? 0.04 : 0;
  const fatiguePenalty = sourceAffinity < -1 ? 0.4 : 0;
  const negativePreferencePenalty = negativeMatch(article.classification.topicTags, memory);
  const combinedTopicMatch = Math.max(topicAffinity, memoryTopicMatch);

  const rankScore =
    combinedTopicMatch * feedScoringWeights.topicMatch +
    sourceAffinity * feedScoringWeights.sourceAffinity +
    recencyScore * feedScoringWeights.freshness +
    sentimentAlignment * feedScoringWeights.sentimentAlignment +
    diversityScore * feedScoringWeights.diversityBonus +
    trendingScore * feedScoringWeights.trendingScore +
    explorationBonus * feedScoringWeights.explorationBonus +
    entityAffinity * 0.05 +
    regionRelevance * 0.04 +
    professionalObjectiveMatch * 0.05 -
    duplicatePenalty -
    fatiguePenalty -
    negativePreferencePenalty;

  return {
    ...article,
    feed: {
      rankScore: Number(rankScore.toFixed(4)),
      reasonTags: [
        combinedTopicMatch > 0.6 ? "matches your memory" : "controlled exploration",
        professionalObjectiveMatch > 0.6 ? "professional relevance" : "fresh context",
        article.ranking.sourceTier === "tier_1" ? "trusted source tier" : "source diversity"
      ],
      queuedAt: new Date().toISOString()
    }
  };
}

export function refreshFeedQueue() {
  const preferences = memoryStore.listPreferences();
  const memory = memoryStore.getMemorySnapshot();
  const cards = diversifyBySource(memoryStore
    .listArticles()
    .filter((article) => !isSuppressed(article, memory))
    .map((article, index) => rankArticle(article, preferences, index, memory))
    .sort((a, b) => b.feed.rankScore - a.feed.rankScore))
    .slice(0, 100);

  return memoryStore.setFeedQueue(cards);
}

function memoryMatch(labels: string[], memory?: UserMemorySnapshot) {
  if (!memory || labels.length === 0) return 0;
  const scores = labels.map((label) => memory.shortTermIntent[label] ?? memory.stablePreferences[label] ?? 0);
  return scores.reduce((sum, score) => sum + Math.max(0, score), 0) / Math.max(1, labels.length);
}

function negativeMatch(labels: string[], memory?: UserMemorySnapshot) {
  if (!memory) return 0;
  return labels.reduce((sum, label) => sum + Math.abs(memory.negativePreferences[label] ?? 0), 0) * 0.12;
}

function isSuppressed(article: Article, memory: UserMemorySnapshot) {
  return article.classification.topicTags.some((topic) => (memory.negativePreferences[topic] ?? 0) <= -8);
}

function diversifyBySource(cards: FeedCard[]) {
  const queue: FeedCard[] = [];
  const remaining = [...cards];
  const sourceCounts = new Map<string, number>();

  while (remaining.length > 0 && queue.length < cards.length) {
    const nextIndex = remaining.findIndex((card) => {
      const previous = queue.at(-1);
      const beforePrevious = queue.at(-2);
      const wouldTriple = previous?.source.name === card.source.name && beforePrevious?.source.name === card.source.name;
      const sourceCount = sourceCounts.get(card.source.name) ?? 0;
      return !wouldTriple && sourceCount < 18;
    });

    const [next] = remaining.splice(nextIndex >= 0 ? nextIndex : 0, 1);
    if (!next) break;
    queue.push(next);
    sourceCounts.set(next.source.name, (sourceCounts.get(next.source.name) ?? 0) + 1);
  }

  return queue;
}

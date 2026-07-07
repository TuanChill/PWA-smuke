import { memoryStore } from "@/lib/store/memory-store";
import type { Article, FeedCard, PreferenceNode } from "@/lib/types";

function affinity(labels: string[], preferences: PreferenceNode[]) {
  if (labels.length === 0) return 0.3;
  const scores = labels.map((label) => preferences.find((pref) => pref.label.toLowerCase() === label.toLowerCase())?.score ?? 0.2);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function rankArticle(article: Article, preferences: PreferenceNode[], index: number): FeedCard {
  const topicAffinity = affinity(article.classification.topicTags, preferences);
  const entityAffinity = affinity(article.classification.entityTags, preferences);
  const sourceAffinity = affinity([article.source.name], preferences);
  const regionRelevance = affinity(article.classification.regionTags, preferences);
  const professionalObjectiveMatch = article.classification.professionalRelevanceTags.length > 0 ? 0.75 : 0.35;
  const sentimentAlignment = 0.55;
  const recencyScore = article.ranking.freshnessScore;
  const diversityScore = index % 4 === 0 ? 0.85 : 0.55;
  const duplicatePenalty = index > 0 && article.ranking.duplicateClusterId ? 0.04 : 0;
  const fatiguePenalty = 0;

  const rankScore =
    topicAffinity * 0.25 +
    entityAffinity * 0.2 +
    sourceAffinity * 0.1 +
    regionRelevance * 0.1 +
    professionalObjectiveMatch * 0.15 +
    sentimentAlignment * 0.1 +
    recencyScore * 0.1 +
    diversityScore * 0.1 -
    duplicatePenalty -
    fatiguePenalty;

  return {
    ...article,
    feed: {
      rankScore: Number(rankScore.toFixed(4)),
      reasonTags: [
        topicAffinity > 0.6 ? "matches your topic graph" : "exploration pick",
        professionalObjectiveMatch > 0.6 ? "professional relevance" : "fresh context",
        article.ranking.sourceTier === "tier_1" ? "trusted source tier" : "source diversity"
      ],
      queuedAt: new Date().toISOString()
    }
  };
}

export function refreshFeedQueue() {
  const preferences = memoryStore.listPreferences();
  const cards = diversifyBySource(memoryStore
    .listArticles()
    .map((article, index) => rankArticle(article, preferences, index))
    .sort((a, b) => b.feed.rankScore - a.feed.rankScore))
    .slice(0, 100);

  return memoryStore.setFeedQueue(cards);
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

import type { Article } from "@/lib/types";
import type { UserMemorySnapshot } from "@/lib/preferences/user-profile-builder";

export function rankSearchResults(query: string, articles: Article[], memory: UserMemorySnapshot) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return articles
    .map((article) => {
      const haystack = `${article.content.title} ${article.content.summary} ${article.classification.topicTags.join(" ")}`.toLowerCase();
      const textScore = terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0) / Math.max(1, terms.length);
      const memoryScore = article.classification.topicTags.reduce((score, topic) => score + (memory.stablePreferences[topic] ?? memory.shortTermIntent[topic] ?? 0), 0);
      const negativePenalty = article.classification.topicTags.reduce((score, topic) => score + Math.abs(memory.negativePreferences[topic] ?? 0), 0);
      return {
        article,
        score: Number((textScore * 0.65 + memoryScore * 0.08 + article.ranking.freshnessScore * 0.2 - negativePenalty * 0.1).toFixed(4))
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

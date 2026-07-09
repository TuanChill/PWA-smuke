export const feedScoringWeights = {
  topicMatch: 0.3,
  sourceAffinity: 0.15,
  freshness: 0.2,
  sentimentAlignment: 0.1,
  diversityBonus: 0.1,
  trendingScore: 0.1,
  explorationBonus: 0.05
} as const;

export const adScoringWeights = {
  topicRelevance: 0.3,
  userIntentMatch: 0.2,
  commercialAffinity: 0.15,
  sentimentMatch: 0.1,
  bidValue: 0.15,
  freshness: 0.05,
  exploration: 0.05
} as const;

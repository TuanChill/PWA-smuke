import { adScoringWeights } from "@/lib/ranking/scoring-weights";
import { removeSensitiveAdSegments } from "@/lib/llm/guardrails";
import type { UserMemorySnapshot } from "@/lib/preferences/user-profile-builder";

export type AdCampaign = {
  id: string;
  advertiserName: string;
  title: string;
  description: string;
  targetTopics: string[];
  blockedTopics: string[];
  bidValue: number;
  freshnessScore: number;
  regulatoryRisk: number;
  active: boolean;
};

export type RankedAd = AdCampaign & {
  score: number;
  reasonTags: string[];
};

export function rankAds(campaigns: AdCampaign[], memory: UserMemorySnapshot, consentAds: boolean): RankedAd[] {
  if (!consentAds) return [];
  const allowedIntent = removeSensitiveAdSegments([...Object.keys(memory.stablePreferences), ...Object.keys(memory.shortTermIntent)]);
  const negative = new Set(Object.keys(memory.negativePreferences).map((topic) => topic.toLowerCase()));

  return campaigns
    .filter((campaign) => campaign.active)
    .filter((campaign) => !campaign.targetTopics.some((topic) => negative.has(topic.toLowerCase())))
    .map((campaign) => {
      const matchingTopics = campaign.targetTopics.filter((topic) => allowedIntent.some((intent) => intent.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(intent.toLowerCase())));
      const topicRelevance = matchingTopics.length / Math.max(1, campaign.targetTopics.length);
      const userIntentMatch = matchingTopics.some((topic) => memory.shortTermIntent[topic] != null) ? 1 : topicRelevance;
      const commercialAffinity = campaign.targetTopics.some((topic) => ["markets", "finance", "crypto", "ai", "infrastructure"].includes(topic.toLowerCase())) ? 0.8 : 0.4;
      const negativeFeedback = campaign.blockedTopics.some((topic) => negative.has(topic.toLowerCase())) ? 2 : 0;
      const score =
        topicRelevance * adScoringWeights.topicRelevance +
        userIntentMatch * adScoringWeights.userIntentMatch +
        commercialAffinity * adScoringWeights.commercialAffinity +
        0.5 * adScoringWeights.sentimentMatch +
        campaign.bidValue * adScoringWeights.bidValue +
        campaign.freshnessScore * adScoringWeights.freshness +
        0.3 * adScoringWeights.exploration -
        negativeFeedback -
        campaign.regulatoryRisk;

      return {
        ...campaign,
        score: Number(score.toFixed(4)),
        reasonTags: matchingTopics.length ? matchingTopics.map((topic) => `matches ${topic}`) : ["exploration"]
      };
    })
    .filter((ad) => ad.score > 0)
    .sort((a, b) => b.score - a.score);
}

import type { ConsentSettings } from "@/lib/types";
import type { SentimentExtraction } from "@/lib/ai/schemas";

const genericSensitiveFallbacks = ["policy_interest", "geopolitics_interest", "regulation_interest", "public_affairs_interest"];

export function gateSensitiveSentiment(sentiment: SentimentExtraction, consents: ConsentSettings): SentimentExtraction {
  if (!sentiment.sensitiveProfileFlag || consents.consentSensitiveSentimentTracking) {
    return sentiment;
  }

  return {
    ...sentiment,
    topics: Array.from(new Set([...sentiment.topics.filter((topic) => !sentiment.sensitiveLabels.includes(topic)), ...genericSensitiveFallbacks])),
    sensitiveLabels: [],
    sensitiveProfileFlag: false,
    sentiment: "non-sensitive-interest"
  };
}

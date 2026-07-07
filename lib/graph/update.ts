import { memoryStore } from "@/lib/store/memory-store";
import type { Article, InteractionType, PreferenceNode } from "@/lib/types";

export const interactionWeights: Record<InteractionType, number> = {
  swipe_left: -1,
  swipe_right: 1,
  double_like: 2.5,
  comment: 3,
  voice_comment: 3.5,
  save: 2,
  share: 2.5,
  source_click: 1.5,
  long_dwell: 0.5,
  quick_skip: -0.25,
  hide_source: -3,
  hide_topic: -3
};

function decayFor(node: PreferenceNode) {
  if (node.nodeType === "topic" && node.score > 0.8) return 0.985;
  if (node.nodeType === "source") return 0.98;
  return 0.96;
}

function updateNode(label: string, nodeType: PreferenceNode["nodeType"], weight: number, sensitive = false) {
  const existing = memoryStore.listPreferences().find((node) => node.label.toLowerCase() === label.toLowerCase() && node.nodeType === nodeType);
  const current: PreferenceNode =
    existing ??
    ({
      id: `pref_${nodeType}_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      userId: memoryStore.getUser().id,
      nodeType,
      label,
      score: 0,
      confidence: 0.2,
      sensitive,
      updatedAt: new Date().toISOString()
    } satisfies PreferenceNode);

  const nextScore = Math.max(-3, Math.min(3, current.score * decayFor(current) + weight * Math.max(current.confidence, 0.3)));
  const nextConfidence = Math.min(1, current.confidence + Math.abs(weight) * 0.04);

  return memoryStore.upsertPreference({
    ...current,
    score: Number(nextScore.toFixed(3)),
    confidence: Number(nextConfidence.toFixed(3)),
    updatedAt: new Date().toISOString()
  });
}

export function updateGraphFromInteraction(article: Article, interactionType: InteractionType) {
  const weight = interactionWeights[interactionType];
  for (const topic of article.classification.topicTags) updateNode(topic, "topic", weight);
  for (const entity of article.classification.entityTags) updateNode(entity, "entity", weight);
  for (const region of article.classification.regionTags) updateNode(region, "region", weight);
  updateNode(article.source.name, "source", weight);
}

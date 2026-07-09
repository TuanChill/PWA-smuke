import { memoryStore } from "@/lib/store/memory-store";

export function readStructuredUserMemory() {
  return memoryStore.getMemorySnapshot();
}

export function explainMemoryForRanking() {
  const snapshot = readStructuredUserMemory();
  return {
    stablePreferences: snapshot.stablePreferences,
    shortTermIntent: snapshot.shortTermIntent,
    negativePreferences: snapshot.negativePreferences,
    sourceAffinity: snapshot.sourceAffinity,
    summary: snapshot.llmSummary
  };
}

import { z } from "zod";

export const sensitiveAdTopicBlocklist = [
  "politics",
  "political affiliation",
  "religion",
  "health",
  "sexuality",
  "ethnicity",
  "race",
  "disability",
  "children",
  "financial hardship"
];

export const llmPreferenceInterpretationSchema = z.object({
  stableSummary: z.string(),
  currentIntent: z.array(z.string()),
  emergingInterests: z.array(z.string()),
  suppressedTopics: z.array(z.string()),
  rankingAdjustments: z.object({
    boost: z.array(z.string()),
    reduce: z.array(z.string())
  }),
  adSegments: z.object({
    suitable: z.array(z.string()),
    avoid: z.array(z.string())
  })
});

export function removeSensitiveAdSegments(segments: string[]) {
  return segments.filter((segment) => {
    const value = segment.toLowerCase();
    return !sensitiveAdTopicBlocklist.some((blocked) => value.includes(blocked));
  });
}

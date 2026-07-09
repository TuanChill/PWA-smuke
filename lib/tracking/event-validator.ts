import { z } from "zod";
import { entityTypeSchema, eventWeights, userEventTypeSchema } from "@/lib/tracking/event-types";

export const userEventInputSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().min(1).max(160).default("session_demo"),
  eventType: userEventTypeSchema,
  entityType: entityTypeSchema,
  entityId: z.string().optional(),
  topics: z.array(z.string()).default([]),
  sourceId: z.string().optional(),
  value: z.number().optional(),
  metadata: z.record(z.unknown()).default({})
});

export const explicitPreferenceInputSchema = z.object({
  topic: z.string().min(1).max(120),
  action: z.enum(["boost", "reduce", "mute", "clear"])
});

export type UserEventInput = z.infer<typeof userEventInputSchema>;
export type ExplicitPreferenceInput = z.infer<typeof explicitPreferenceInputSchema>;

export function withDefaultEventValue(input: UserEventInput) {
  return {
    ...input,
    value: input.value ?? eventWeights[input.eventType]
  };
}

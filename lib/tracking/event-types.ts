import { z } from "zod";

export const userEventTypeSchema = z.enum([
  "view_article",
  "click_article",
  "dwell_30s",
  "save_article",
  "share_article",
  "follow_topic",
  "hide_article",
  "mute_topic",
  "ad_click",
  "ad_dismiss",
  "search_query",
  "repeat_search",
  "comment_positive",
  "comment_negative",
  "swipe_left",
  "swipe_right",
  "double_like",
  "source_click"
]);

export const entityTypeSchema = z.enum(["article", "topic", "source", "ad", "search", "comment"]);

export const eventWeights: Record<z.infer<typeof userEventTypeSchema>, number> = {
  view_article: 0.2,
  click_article: 0.8,
  dwell_30s: 1,
  save_article: 2.5,
  share_article: 3,
  follow_topic: 5,
  hide_article: -3,
  mute_topic: -8,
  ad_click: 2,
  ad_dismiss: -4,
  search_query: 1.5,
  repeat_search: 2,
  comment_positive: 1,
  comment_negative: -1,
  swipe_left: -1,
  swipe_right: 1,
  double_like: 2.5,
  source_click: 0.8
};

export type UserEventType = z.infer<typeof userEventTypeSchema>;
export type EntityType = z.infer<typeof entityTypeSchema>;

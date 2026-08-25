---
phase: 1
title: "AI Provider & Commentary Backend Pipeline"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: AI Provider & Commentary Backend Pipeline

## Overview
Enhance the AI provider layer (`AiProvider`, `MockProvider`, `MiniMaxProvider`) and the API endpoint `/api/commentary-drafts` to support platform-tailored social post generation (LinkedIn, Twitter/X, Executive Memo), angle contextualization, and persistence in `memoryStore`.

## Requirements
- Support `platform`: `"linkedin" | "twitter_x" | "executive_memo"`.
- Support `perspectiveAngle`: string (e.g. "bullish", "critical", "b2b_insight", "takeaway").
- Contextualize user comments with article facts, narrative synthesis, and canonical source link.
- Update user intelligence graph and memory scores when commentary events are emitted.

## Related Code Files
- Modify: `app-smuke/lib/ai/provider.ts`
- Modify: `app-smuke/lib/ai/schemas.ts`
- Modify: `app-smuke/lib/ai/mock-provider.ts`
- Modify: `app-smuke/lib/ai/minimax-provider.ts`
- Modify: `app-smuke/lib/store/memory-store.ts`
- Modify: `app-smuke/app/api/commentary-drafts/route.ts`

## Implementation Steps
1. Extend `CommentaryInput` in `lib/ai/provider.ts` with `targetPlatform` and `perspectiveAngle`.
2. Update `mock-provider.ts` to output structured Markdown formatted for LinkedIn, Twitter, and Executive Memo.
3. Update `minimax-provider.ts` prompt to construct narrative hooks, news synthesis, takeaway, source URL, and hashtags.
4. Update `memory-store.ts` to record platform, article title, source link in `Draft` type and apply user event scoring.
5. Update `app/api/commentary-drafts/route.ts` with Zod validation for platform and angle.

## Success Criteria
- [ ] `POST /api/commentary-drafts` generates distinct formatted posts for LinkedIn, Twitter, and Memo.
- [ ] Returned draft includes the user's angle, news summary context, and source article link.

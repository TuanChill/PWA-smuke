---
phase: 1
title: "Feed Service Layer & BFF Endpoints"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Feed Service Layer & BFF Endpoints

## Overview
Create `lib/feed/feed-api.ts` to handle unified data fetching with backend endpoints and local fallback, and add `app/api/feed/topics/route.ts`.

## Requirements
- `fetchFeedCards()`: queries backend `GET /api/v1/feed` with options (`page`, `limit`, `topicSlug`, `sort`) and falls back to `memoryStore` + `rankArticle`.
- `fetchFeedTopics()`: queries backend `GET /api/v1/feed/topics` with fallback.
- `GET /api/feed/topics` route handler.

## Related Files
- Create: `lib/feed/feed-api.ts`
- Create: `app/api/feed/topics/route.ts`
- Modify: `app/api/feed/route.ts`

## Success Criteria
- [x] Unified feed-api library handles remote and fallback queries.
- [x] `/api/feed/topics` returns topic list with caching.
- [x] `/api/feed` supports query options cleanly.

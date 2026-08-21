---
phase: 3
title: "SSR Initial Load, Fallbacks & Automated Tests"
status: completed
priority: P1
effort: "1h"
dependencies: [2]
---

# Phase 3: SSR Initial Load, Fallbacks & Automated Tests

## Overview
Connect `app/feed/page.tsx` for server-side initial loading, update environment variables, and write unit tests for feed API helpers.

## Requirements
- `app/feed/page.tsx` loads initial cards via `fetchFeedCards()`.
- Add `tests/feed-api.test.ts`.
- Update `.env.example` and `.env.local`.

## Related Files
- Modify: `app/feed/page.tsx`
- Create: `tests/feed-api.test.ts`
- Modify: `.env.example`, `.env.local`

## Success Criteria
- [x] SSR loads initial cards and topics directly.
- [x] All unit tests pass with vitest (11/11 tests).
- [x] Typecheck passes with 0 errors.

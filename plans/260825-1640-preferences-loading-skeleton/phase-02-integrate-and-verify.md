---
phase: 2
title: "Integrate with Auth & API Loading States"
status: completed
priority: P2
effort: "1h"
dependencies: ["01"]
---

# Phase 02: Integrate with Auth & API Loading States

## Overview
Connect `PreferencesSkeleton` inside `app/preferences/page.tsx` during initial data retrieval, auth initialization, or manual refetch, ensuring smooth transition when real data resolves.

## Requirements
- **Functional**:
  - Show `PreferencesSkeleton` when `isInitializing` (auth checking) or initial `isLoading` (fetching `/api/preferences`) is true.
  - Smoothly replace skeleton with actual content once data arrives.
- **Verification**:
  - `npm run typecheck` passes with 0 errors.
  - `npm test` passes with 100% success rate.

## Related Code Files
- Modify: `app-smuke/app/preferences/page.tsx`

## Implementation Steps
1. Import `PreferencesSkeleton` in `app/preferences/page.tsx`.
2. Wrap loading condition `(isInitializing || isLoading)` to render `PreferencesSkeleton`.
3. Verify layout smoothness.

## Success Criteria
- [ ] Skeleton displays instantly on page open while data loads.
- [ ] Replaces cleanly with full user profile and preference cards when ready.

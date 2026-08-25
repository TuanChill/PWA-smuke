---
phase: 1
title: "Social Accounts API & BFF Proxy Routes"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 01: Social Accounts API & BFF Proxy Routes

## Overview
Build API routes in `app-smuke` to proxy and normalize social account requests to `smukeAI-be`'s `/social-accounts` endpoints, with fallback memory storage for offline/mock development.

## Requirements
- **Functional**:
  - `GET /api/social-accounts`: Forward auth token to `${getBackendUrl()}/social-accounts/list`. If not authenticated or backend unavailable, return memory store accounts.
  - `POST /api/social-accounts/connect`: Accept `{ platform: "linkedin" | "x" | "threads" }` and call `${getBackendUrl()}/social-accounts/connect/${platform}` to retrieve the OAuth authorization URL.
  - `DELETE /api/social-accounts?id=:id`: Forward deletion to `${getBackendUrl()}/social-accounts/${id}`.
  - Add `SocialAccount` TypeScript types in `lib/types.ts` and helper functions in `lib/store/memory-store.ts`.
- **Non-functional**:
  - Graceful error handling and retry boundaries.

## Related Code Files
- Modify: `app-smuke/lib/types.ts`
- Modify: `app-smuke/lib/store/memory-store.ts`
- Create: `app-smuke/app/api/social-accounts/route.ts`
- Create: `app-smuke/app/api/social-accounts/connect/route.ts`

## Implementation Steps
1. Define `SocialAccount` interface (`id`, `platform`, `username`, `accountName`, `avatarUrl`, `status`, `connectedAt`).
2. Add social account methods to `memoryStore` (`listSocialAccounts()`, `connectSocialAccount()`, `disconnectSocialAccount()`).
3. Build `GET /api/social-accounts` and `DELETE /api/social-accounts`.
4. Build `POST /api/social-accounts/connect`.

## Success Criteria
- [ ] `GET /api/social-accounts` returns formatted list of connected accounts.
- [ ] `POST /api/social-accounts/connect` returns valid OAuth redirect URL from PostForMe or simulation URL.
- [ ] `DELETE /api/social-accounts?id=:id` properly removes account.

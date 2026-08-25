---
phase: 3
title: "Automated Tests & End-to-End Verification"
status: completed
priority: P1
effort: "1h"
dependencies: ["01", "02"]
---

# Phase 03: Automated Tests & End-to-End Verification

## Overview
Write unit tests covering social account data normalization, connect URL generation, disconnect operations, and verify complete type safety.

## Requirements
- **Automated Tests**:
  - Test `GET /api/social-accounts` response formatting and platform grouping.
  - Test `POST /api/social-accounts/connect` payload validation for `linkedin`, `x`, `threads`.
  - Test memory store social account additions and deletions.
- **Verification**:
  - `npm run typecheck` passes with 0 errors.
  - `npx vitest run` passes with 100% success rate.
  - Manual UI verification on `http://localhost:3001/preferences`.

## Related Code Files
- Create: `app-smuke/tests/social-accounts.test.ts`

## Implementation Steps
1. Create `tests/social-accounts.test.ts`.
2. Run test suites with `npx vitest run`.
3. Verify TypeScript build with `npm run typecheck`.

## Success Criteria
- [ ] All unit tests pass.
- [ ] TypeScript compilation passes with 0 errors.
- [ ] Connect and Disconnect flows work smoothly in local browser.

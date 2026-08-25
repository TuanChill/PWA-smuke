---
phase: 3
title: "Automated Tests & End-to-End Verification"
status: completed
priority: P1
effort: "0.5h"
dependencies: ["01", "02"]
---

# Phase 03: Automated Tests & End-to-End Verification

## Overview
Test `redirect_url_override` validation in `connectSchema`, query string propagation, and verify building and rendering across Next.js and NestJS.

## Requirements
- **Automated Tests**:
  - Update `tests/social-accounts.test.ts` to test `redirect_url_override` in connect API schema and payload formatting.
- **Verification**:
  - `npm run typecheck` passes with 0 errors in both `app-smuke` and `smukeAI-be`.
  - `npx vitest run` passes 100%.

## Related Code Files
- Modify: `app-smuke/tests/social-accounts.test.ts`

## Success Criteria
- [ ] All unit tests pass.
- [ ] Both frontend and backend compile with 0 errors.

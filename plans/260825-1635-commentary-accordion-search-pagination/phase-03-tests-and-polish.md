---
phase: 3
title: "Unit Tests & UX Verification"
status: completed
priority: P1
effort: "1h"
dependencies: ["01", "02"]
---

# Phase 03: Unit Tests & UX Verification

## Overview
Add comprehensive unit tests for search filtering, platform categorization, pagination slicing, and accordion expand/collapse logic, followed by build verification.

## Requirements
- **Automated Tests**:
  - Test search query matching across draft text, title, comment, and source name.
  - Test platform filtering (`all`, `linkedin`, `twitter_x`, `executive_memo`).
  - Test pagination calculations (edge cases: 0 items, exactly 5 items, >5 items, page bounds).
  - Test accordion expand/collapse state mutations.
- **Verification**:
  - `npm run typecheck` passes with 0 errors.
  - `npm test` passes with 100% success rate.
  - Manual UI verification in mobile and desktop viewport.

## Related Code Files
- Create: `app-smuke/tests/commentary-hub.test.ts`

## Implementation Steps
1. Write unit tests in `tests/commentary-hub.test.ts` covering filtering, sorting, pagination, and accordion state logic.
2. Run `npm test` and `npm run typecheck`.
3. Verify interactive behavior on `http://localhost:3001/commentary`.

## Success Criteria
- [ ] Vitest tests pass with 100% green coverage.
- [ ] TypeScript compilation succeeds with 0 errors.
- [ ] Responsive layout looks polished on mobile and desktop screens.

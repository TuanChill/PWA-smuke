---
phase: 2
title: "Dedicated Social OAuth Callback Page"
status: completed
priority: P1
effort: "1h"
dependencies: ["01"]
---

# Phase 02: Dedicated Social OAuth Callback Page

## Overview
Create `app/social/callback/page.tsx` with Suspense wrapping, query param inspection, status animations, and automatic transition back to the Preferences hub.

## Requirements
- **Functional**:
  - Extract search params: `platform`, `status`, `error`, `error_description`, `connected`, `account_id`.
  - Display responsive card matching Smuke design tokens:
    - **Loading**: Moss spinner with text `"Connecting your [Platform] account..."`.
    - **Success**: Emerald checkmark with `"Successfully connected [Platform]!"` + auto-redirect countdown.
    - **Error**: Rose cross icon with error message + `"Return to Preferences"` button.
  - Call `GET /api/social-accounts` to synchronize the newly connected account.
  - Provide fallback manual button: `"Go to Preferences Now"`.
- **Non-functional**:
  - Fast rendering, `<Suspense>` wrapper for Next.js build safety.

## Related Code Files
- Create: `app-smuke/app/social/callback/page.tsx`

## Success Criteria
- [ ] `/social/callback` handles both successful and failed OAuth returns cleanly.
- [ ] Automatically synchronizes account state and redirects back to `/preferences`.

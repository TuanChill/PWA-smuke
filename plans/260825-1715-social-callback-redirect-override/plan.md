---
title: "Social OAuth Callback Page & redirect_url_override Support"
status: completed
priority: P1
effort: "2.5h"
created: "2026-08-25T17:15:00.000Z"
phases:
  - id: "01"
    title: "Backend & API redirect_url_override Parameter Support"
    status: completed
  - id: "02"
    title: "Dedicated Social OAuth Callback Page"
    status: completed
  - id: "03"
    title: "Automated Tests & End-to-End Verification"
    status: completed
---

# Social OAuth Callback Page & redirect_url_override Support

## Executive Summary
Implement support for passing an optional `redirect_url_override` parameter across both `smukeAI-be` PostForMe integration and `app-smuke` BFF proxy, and build a dedicated `/social/callback` page that handles OAuth redirection, updates connected channel states, and smoothly transitions users back to `/preferences`.

## Key Deliverables
1. **`redirect_url_override` Query & Payload Support**:
   - Backend `smukeAI-be`: Update `GET /social-accounts/connect/:platform` and `PostformeService.createAuthUrl` to pass `redirect_url_override`.
   - Frontend BFF `POST /api/social-accounts/connect`: Accept `redirect_url_override?: string` and forward as query parameter to backend.
   - Frontend Component `SocialAccountsCard.tsx`: Dynamically construct and pass `${window.location.origin}/social/callback` as `redirect_url_override`.
2. **Social Callback Page (`/social/callback`)**:
   - Clean UI with loading spinner, success checkmark, or error display.
   - Automatically refreshes connected accounts via `GET /api/social-accounts`.
   - Countdown timer (1.5s) with automated smooth redirection back to `/preferences` + manual action buttons.
3. **Automated Tests**:
   - Unit tests verifying `redirect_url_override` parsing and serialization.

## Phase Roadmap
- **Phase 01**: Backend & API redirect_url_override Parameter Support (`phase-01-backend-and-api-redirect-override.md`)
- **Phase 02**: Dedicated Social OAuth Callback Page (`phase-02-social-callback-page.md`)
- **Phase 03**: Automated Tests & End-to-End Verification (`phase-03-tests-and-verification.md`)

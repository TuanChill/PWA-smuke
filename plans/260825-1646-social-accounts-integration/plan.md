---
title: "Connected Social Accounts on Preferences Page (Option A)"
status: completed
priority: P1
effort: "4h"
created: "2026-08-25T16:46:00.000Z"
phases:
  - id: "01"
    title: "Social Accounts API & BFF Proxy Routes"
    status: completed
  - id: "02"
    title: "Connected Channels UI & OAuth Flow"
    status: completed
  - id: "03"
    title: "Automated Tests & End-to-End Verification"
    status: completed
---

# Connected Social Accounts on Preferences Page (Option A)

## Executive Summary
Integrate a dedicated "Connected Social Channels" card directly inside the `/preferences` page of `app-smuke`, connecting to `smukeAI-be`'s PostForMe OAuth endpoints for LinkedIn, X (Twitter), and Threads. Users can connect their social channels, view active connection statuses, disconnect accounts, and prepare for 1-tap social publishing.

## Key Deliverables
1. **BFF Proxy Routes & Social State**:
   - `GET /api/social-accounts`: Proxies to Backend `GET /social-accounts/list` with fallback store.
   - `POST /api/social-accounts/connect`: Proxies to Backend `GET /social-accounts/connect/:platform` to initiate OAuth flow.
   - `DELETE /api/social-accounts?id=:id`: Proxies to Backend `DELETE /social-accounts/:id`.
2. **Connected Channels Component (`SocialAccountsCard.tsx`)**:
   - Supported channels: **LinkedIn**, **X / Twitter**, **Threads**.
   - Connected state: Avatar, `@username`, green `Active` status badge, Disconnect button.
   - Disconnected state: Value-prop description, prominent `+ Connect` action button.
   - Guest state: Friendly banner prompting Google Sign-in to unlock social integrations.
   - OAuth return handler: Detects `?connected=:platform` in URL query and triggers auto-refresh + toast notification.
3. **Preferences Skeleton & Page Integration**:
   - Updates `PreferencesSkeleton.tsx` with social accounts shimmer rows.
   - Integrates `SocialAccountsCard` between Profile and Onboarding sections.

## Phase Roadmap
- **Phase 01**: Social Accounts API & BFF Proxy Routes (`phase-01-api-and-state.md`)
- **Phase 02**: Connected Channels UI & OAuth Flow (`phase-02-ui-components-and-oauth-flow.md`)
- **Phase 03**: Automated Tests & End-to-End Verification (`phase-03-tests-and-verification.md`)

---
phase: 1
title: "Backend & API redirect_url_override Parameter Support"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 01: Backend & API redirect_url_override Parameter Support

## Overview
Enable the optional `redirect_url_override` parameter in both NestJS backend `smukeAI-be` and Next.js frontend BFF routes so that PostForMe OAuth flows can be redirected to custom callback URLs (e.g. `/social/callback`).

## Requirements
- **Backend (`smukeAI-be`)**:
  - In `src/api/social-account/social-account.controller.ts`:
    - Add `@Query('redirect_url_override') redirectUrlOverride?: string` to `@Get('connect/:platform')`.
    - Pass `redirectUrlOverride` into `this.postformeService.createAuthUrl(...)`.
  - In `src/core/third-party-services/postforme/postforme.service.ts`:
    - Add `redirectUrlOverride?: string` to `CreateAuthUrlOptions`.
    - In `createAuthUrl(options)`: Set `requestBody.redirect_url_override = options.redirectUrlOverride` when present.
- **Frontend BFF (`app-smuke`)**:
  - In `app/api/social-accounts/connect/route.ts`:
    - Add `redirect_url_override: z.string().optional()` to `connectSchema`.
    - Append `?redirect_url_override=${encodeURIComponent(body.redirect_url_override)}` when calling backend.
  - In `components/SocialAccountsCard.tsx`:
    - Send `redirect_url_override: `${window.location.origin}/social/callback`` in connect payload.

## Related Code Files
- Modify: `smukeAI-be/src/api/social-account/social-account.controller.ts`
- Modify: `smukeAI-be/src/core/third-party-services/postforme/postforme.service.ts`
- Modify: `app-smuke/app/api/social-accounts/connect/route.ts`
- Modify: `app-smuke/components/SocialAccountsCard.tsx`

## Success Criteria
- [ ] Backend controller passes `redirect_url_override` into PostForMe SDK.
- [ ] Frontend connect API accepts and propagates `redirect_url_override`.

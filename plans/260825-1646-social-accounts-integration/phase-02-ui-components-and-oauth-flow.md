---
phase: 2
title: "Connected Channels UI & OAuth Flow"
status: completed
priority: P1
effort: "1.5h"
dependencies: ["01"]
---

# Phase 02: Connected Channels UI & OAuth Flow

## Overview
Build the `SocialAccountsCard.tsx` component and embed it within `app/preferences/page.tsx`, supporting OAuth initiation, callback query handling, status badges, and disconnection.

## Requirements
- **Functional**:
  - List 3 key platforms: **LinkedIn**, **X / Twitter**, **Threads**.
  - **Connected Item**: Shows platform icon, avatar, display name, handle (`@...`), green `Active` indicator, and a `Disconnect` button.
  - **Disconnected Item**: Shows platform icon, description ("1-tap thought leadership publishing"), and a prominent `+ Connect` button.
  - **OAuth Trigger**: Clicking `Connect` calls `/api/social-accounts/connect`, redirects user to PostForMe OAuth page, and handles return back to `/preferences?connected=:platform`.
  - **Guest Banner**: When not signed in, show subtle banner prompting sign-in.
  - **Preferences Skeleton**: Update `PreferencesSkeleton.tsx` with skeleton placeholders for the Social Accounts card.
- **Non-functional**:
  - Mobile-responsive layout, smooth button state transitions with Framer Motion.

## Related Code Files
- Create: `app-smuke/components/SocialAccountsCard.tsx`
- Modify: `app-smuke/components/PreferencesSkeleton.tsx`
- Modify: `app-smuke/app/preferences/page.tsx`

## Implementation Steps
1. Create `components/SocialAccountsCard.tsx` with interactive connect/disconnect states.
2. Add OAuth return detection using `useSearchParams` (`?connected=linkedin`, etc.) with success banner.
3. Update `PreferencesSkeleton.tsx` with Shimmer placeholder rows.
4. Mount `SocialAccountsCard` in `app/preferences/page.tsx`.

## Success Criteria
- [ ] Card renders cleanly with 3 platforms.
- [ ] Connect button triggers OAuth flow.
- [ ] Disconnect button removes connection with instant optimistic UI update.
- [ ] Skeleton renders smoothly during initial data fetch.

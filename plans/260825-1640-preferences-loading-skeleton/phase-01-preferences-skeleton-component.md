---
phase: 1
title: "Preferences Skeleton Component"
status: completed
priority: P2
effort: "1h"
dependencies: []
---

# Phase 01: Preferences Skeleton Component

## Overview
Create a dedicated `PreferencesSkeleton.tsx` component designed specifically around the layout of `/preferences` (profile card, onboarding radar, and preference graph cards) with pulse shimmer animations.

## Requirements
- **Functional**:
  - Matches 1:1 with the real `/preferences` geometry to prevent layout shift (CLS).
  - Profile header skeleton: Avatar circle (56px), name/email placeholder rectangles.
  - Onboarding survey skeleton: Section header, category pill placeholders (3-5 chips), objectives placeholders.
  - Preference node cards skeleton (3 item placeholders): NodeType tag, Title bar, Score badge, and Confidence progress bar.
- **Non-functional**:
  - Consistent styling with Smuke's warm `#f7f4ee` paper aesthetic and subtle `#e8e5dc` fog shimmer.

## Related Code Files
- Create: `app-smuke/components/PreferencesSkeleton.tsx`

## Implementation Steps
1. Create `PreferencesSkeleton.tsx`.
2. Structure sections:
   - Header profile card skeleton (`bg-white rounded-3xl p-6 shadow-panel`).
   - Radar survey card skeleton (`bg-white rounded-3xl p-6 shadow-panel`).
   - Preference graph skeleton with 3 card items.
3. Use Tailwind `animate-pulse`, `bg-fog/80`, and rounded borders.

## Success Criteria
- [ ] Skeleton mirrors exact layout structure of `/preferences`.
- [ ] Visual transitions are smooth without flickering.

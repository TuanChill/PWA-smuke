---
phase: 2
title: "Landing Page CTA Dynamic Routing"
status: completed
priority: P1
effort: "45m"
dependencies: [1]
---

# Phase 2: Landing Page CTA Dynamic Routing

## Overview
Connect the "Start onboarding" and "Open feed" buttons on `http://localhost:3001/` to `useAuthStore` to perform smart 3-way conditional routing.

## Requirements
- If `!token || !user` $\rightarrow$ redirect to `/login`.
- If `token && user` and `!onboarding?.completed` $\rightarrow$ push to `/onboarding`.
- If `token && user` and `onboarding?.completed === true` $\rightarrow$ push to `/feed`.

## Success Criteria
- [x] `<LandingCta />` and `<LandingNavActions />` created in `components/LandingCta.tsx`.
- [x] `app/page.tsx` updated with smart dynamic routing.
- [x] Tested all 3 routing branches.

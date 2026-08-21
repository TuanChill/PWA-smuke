---
phase: 3
title: "Interactive Onboarding Screen & Backend Persistence"
status: completed
priority: P1
effort: "1h"
dependencies: [2]
---

# Phase 3: Interactive Onboarding Screen & Backend Persistence

## Overview
Build an interactive survey UI in `app-smuke` (`components/OnboardingClient.tsx`), allowing Google-authenticated users to select topics, objectives, role, and privacy consents, and persist directly to `POST /api/v1/users/onboarding`.

## Requirements
- Topics selection (AI, Crypto, Markets, Startups, Policy, Tech...).
- Professional objectives selection.
- Role & company input.
- Privacy & consent toggles.
- Submits data to `POST /api/v1/users/onboarding` and navigates to `/feed`.

## Success Criteria
- [x] Multi-step topic & objective pills selection with toggle interactions.
- [x] Onboarding submissions persist to `POST /api/v1/users/onboarding`.
- [x] Automatically transitions to `/feed` upon completion.

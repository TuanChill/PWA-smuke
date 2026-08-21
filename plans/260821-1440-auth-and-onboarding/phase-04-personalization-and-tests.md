---
phase: 4
title: "Personalized Feed Alignment & Automated Tests"
status: completed
priority: P1
effort: "0.5h"
dependencies: [3]
---

# Phase 4: Personalized Feed Alignment & Automated Tests

## Overview
Connect user's Google JWT token into feed queries, update `FeedService` to boost articles matching `UserOnboarding.selectedTopics`, display user profile in Preferences page, and write unit tests.

## Requirements
- `FeedService` queries `UserOnboarding` by `userId` to boost user's selected topics.
- `app/preferences/page.tsx` displays Google profile and selected topics with Sign out action.
- Write unit tests in `smukeAI-be` and `app-smuke`.

## Success Criteria
- [x] FeedService dynamically applies $+35\%$ boost to user's onboarded topics.
- [x] Preferences page renders Google user account and survey results.
- [x] All unit tests pass in both backend (9/9) and frontend (13/13).

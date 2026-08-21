---
phase: 1
title: "UserOnboarding Entity & Endpoints in smukeAI-be"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: UserOnboarding Entity & Endpoints in smukeAI-be

## Overview
Create `UserOnboarding` entity (`user_onboardings` collection) linked to `User` without modifying `User` entity, and add `GET /users/onboarding` & `POST /users/onboarding`.

## Requirements
- `UserOnboarding` entity: `user` (OneToOne Ref<User>), `selectedTopics`, `objectives`, `role`, `profession`, `company`, `consents`, `completed`, `completedAt`.
- `SubmitOnboardingDto` for request validation.
- Register entity in `user.module.ts`.
- `UserService.getOnboarding(userId)` and `UserService.saveOnboarding(userId, dto)`.
- `GET /api/v1/users/onboarding` & `POST /api/v1/users/onboarding`.

## Success Criteria
- [x] `User` entity kept completely unmodified.
- [x] `UserOnboarding` entity registered in `UserModule` and `FeedModule`.
- [x] All backend unit tests pass (9/9 passed).

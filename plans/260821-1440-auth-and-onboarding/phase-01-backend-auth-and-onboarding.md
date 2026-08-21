---
phase: 1
title: "UserOnboarding Entity & Endpoints in smukeAI-be"
status: pending
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

## Related Files
- Create: `../smukeAI-be/src/api/user/entities/user-onboarding.entity.ts`
- Create: `../smukeAI-be/src/api/user/dto/onboarding.dto.ts`
- Modify: `../smukeAI-be/src/api/user/user.module.ts`
- Modify: `../smukeAI-be/src/api/user/user.service.ts`
- Modify: `../smukeAI-be/src/api/user/user.controller.ts`

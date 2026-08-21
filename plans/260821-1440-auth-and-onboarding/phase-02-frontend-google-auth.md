---
phase: 2
title: "Frontend Google Auth, Callback & Session Management"
status: completed
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 2: Frontend Google Auth, Callback & Session Management

## Overview
Implement `AuthProvider` context in `app-smuke` tailored exclusively for Google OAuth, create `app/login/page.tsx`, and handle callback in `app/auth/callback/page.tsx` and `app/auth/page.tsx`.

## Requirements
- `AuthContext`: Token storage in localStorage/cookies, `loginWithGoogle()`, `logout()`, `onboardingStatus`.
- `app/login/page.tsx`: Clean Google Sign-in landing screen.
- `app/auth/callback/page.tsx` & `app/auth/page.tsx`: Extracts OAuth params, checks onboarding status, and routes to `/onboarding` or `/feed`.

## Success Criteria
- [x] `AuthProvider` created and registered in `app/layout.tsx`.
- [x] `app/login/page.tsx` renders Google Sign-in button with clean editorial design.
- [x] `app/auth/callback/page.tsx` and `app/auth/page.tsx` handle OAuth parameters cleanly.

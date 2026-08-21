---
phase: 2
title: "Frontend Google Auth, Callback & Session Management"
status: pending
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

## Related Files
- Create: `lib/auth/auth-context.tsx`
- Create: `app/login/page.tsx`
- Create: `app/auth/callback/page.tsx`
- Create: `app/auth/page.tsx`
- Modify: `app/layout.tsx`

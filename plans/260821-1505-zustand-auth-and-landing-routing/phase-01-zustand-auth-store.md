---
phase: 1
title: "Install Zustand & Create useAuthStore"
status: completed
priority: P1
effort: "45m"
dependencies: []
---

# Phase 1: Install Zustand & Create useAuthStore

## Overview
Install `zustand` in `app-smuke` and build `lib/store/use-auth-store.ts` with `persist` middleware to manage authentication, session state, and onboarding status.

## Requirements
- `npm install zustand` in `app-smuke`.
- `useAuthStore` with `token`, `user`, `onboarding`, `setSession`, `logout`, `loginWithGoogle`, `fetchOnboarding`, `submitOnboarding`, and `handleOnboardingCta`.
- Sync session with `localStorage` and `cookie` (`smuke_token`).

## Success Criteria
- [x] `zustand` installed in `app-smuke/package.json`.
- [x] `useAuthStore` created with persistent storage and cookie synchronization.
- [x] `lib/auth/auth-context.tsx` bridges cleanly to `useAuthStore`.

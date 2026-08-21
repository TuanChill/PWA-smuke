---
title: "Google OAuth & Dedicated UserOnboarding Entity Integration"
status: completed
priority: P1
effort: "3.5h"
phases:
  - id: 1
    file: "phase-01-backend-user-onboarding-entity.md"
    title: "UserOnboarding Entity & Endpoints in smukeAI-be"
    status: completed
  - id: 2
    file: "phase-02-frontend-google-auth.md"
    title: "Frontend Google Auth, Callback & Session Management"
    status: completed
  - id: 3
    file: "phase-03-interactive-onboarding-ui.md"
    title: "Interactive Onboarding Screen & Backend Persistence"
    status: completed
  - id: 4
    file: "phase-04-personalization-and-tests.md"
    title: "Personalized Feed Alignment & Automated Tests"
    status: completed
---

# Plan: Google OAuth & Dedicated UserOnboarding Entity Integration

## Overview
Implement exclusive Google OAuth sign-in, create a dedicated `UserOnboarding` entity (`user_onboardings` collection/table) without modifying `User`, and persist onboarding survey data (topics, objectives, role, company, consents) to personalize the feed in `app-smuke`.

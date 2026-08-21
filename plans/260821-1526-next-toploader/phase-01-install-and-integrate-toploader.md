---
phase: 1
title: "Install nextjs-toploader and Add to RootLayout"
status: completed
priority: P2
effort: "20m"
dependencies: []
---

# Phase 1: Install nextjs-toploader and Add to RootLayout

## Overview
- Run `npm install nextjs-toploader` in `app-smuke`.
- Add `<NextTopLoader color="#315a4f" height={3} showSpinner={false} />` inside `app/layout.tsx`.
- Run tests and verify.

## Success Criteria
- [x] `nextjs-toploader` installed in `package.json`.
- [x] `RootLayout` renders `NextTopLoader`.
- [x] `vitest run` and `tsc --noEmit` pass with 0 errors.

---
phase: 1
title: "Seamless Editorial Card & Tactile Gesture Deck"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Seamless Editorial Card & Tactile Gesture Deck

## Overview
Redesign the card in `components/FeedClient.tsx` to eliminate the two-tone split, add real-time visual swipe stamps (*RELEVANT* / *PASS*), and add the floating tactile action dock.

## Success Criteria
- [x] Seamless white card canvas with `rounded-[2rem] shadow-xl ring-1 ring-ink/5`.
- [x] Publisher metadata bar (`Source • time ago • read time`) and category badge.
- [x] High-contrast typography for headline and AI summary.
- [x] Single-row unified tags and reason pill.
- [x] Swipe stamps with opacity transforms on drag ($dx$).
- [x] Action dock under card: Skip, Undo, Bookmark, Like.

---
phase: 1
title: "Calibrate Thresholds, Directional Lock & Spring Fly-out Physics"
status: completed
priority: P1
effort: "45m"
dependencies: []
---

# Phase 1: Calibrate Thresholds, Directional Lock & Spring Fly-out Physics

## Overview
Update `SwipeCard` in `components/FeedClient.tsx`:
- Configure `axis: 'x'` on `useDrag` and `touchAction: "pan-y"` to prevent vertical scrolling from triggering swipes.
- Increase distance threshold to `135px` and velocity threshold to `0.85` (with min 40px drag).
- Add spring snap-back animation (`type: "spring", stiffness: 450, damping: 30`) when releasing below threshold.
- Add smooth fly-out exit animation ($x = \pm 650\text{px}$) before calling `onCommit`.

## Success Criteria
- [x] Dragging lightly (<135px) bounces back to center with spring physics.
- [x] Dragging with intent (>135px or fast flick) flies card off-screen before switching cards.
- [x] Vertical scrolling inside card does not trigger horizontal swipe.

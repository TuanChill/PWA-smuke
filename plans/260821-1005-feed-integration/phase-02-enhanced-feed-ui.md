---
phase: 2
title: "Topic Filter, Sort Selector & Infinite Deck UI"
status: completed
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: Topic Filter, Sort Selector & Infinite Deck UI

## Overview
Upgrade `FeedClient.tsx` with topic pills bar, sort toggle (`For You`, `Trending`, `Latest`), infinite deck auto-replenishment, and card image support.

## Requirements
- Render horizontal scrollable topic pills (`All`, `AI`, `Crypto`, `Tech`, etc.).
- Add sort selector toggle.
- Auto-replenish cards when remaining count $\le 3$.
- Display `imageUrl` in card hero header when present.

## Related Files
- Modify: `components/FeedClient.tsx`

## Success Criteria
- [x] Topic switching triggers dynamic re-fetching.
- [x] Sort selector switches between For You, Trending, Latest.
- [x] Infinite deck auto-replenishes in background when 3 cards left.
- [x] Image banners render with gradient overlay.

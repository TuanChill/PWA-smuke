---
phase: 2
title: "In-Deck Comment & Social Draft Drawer Component"
status: completed
priority: P1
effort: "1.5h"
dependencies: ["phase-01-ai-and-backend-pipeline.md"]
---

# Phase 2: In-Deck Comment & Social Draft Drawer Component

## Overview
Build a high-end mobile-first Bottom Sheet Drawer component (`CommentDrawer.tsx`) using `framer-motion` that overlays the active card deck. It includes article context, quick perspective chips, custom text input, platform selector, generation trigger, and draft preview with 1-tap copy / web share.

## Requirements
- Smooth spring entry & swipe-to-dismiss gesture handling.
- Article Context header: Source badge, title, 1-sentence compressed intent.
- Perspective Chips: "🔥 Bullish", "🧐 Skeptical", "💼 B2B Impact", "💡 Takeaway", "🚀 Tech Insight".
- Platform Selector Tabs: LinkedIn, Twitter/X, Executive Memo.
- Generation state with skeleton animation.
- Result box with copy to clipboard (and visual toast feedback), Web Share API integration, and direct save to drafts.

## Related Code Files
- Create: `app-smuke/components/CommentDrawer.tsx`

## Implementation Steps
1. Create `CommentDrawer.tsx` with Framer Motion `AnimatePresence` and backdrop blur.
2. Implement perspective chip click to populate or set angle state.
3. Integrate API call to `POST /api/commentary-drafts`.
4. Render draft result with formatted markdown/text, copy button, and share action.

## Success Criteria
- [ ] Drawer slides up cleanly over the card deck without gesture conflicts.
- [ ] User can type comment or click chips, trigger generation, and copy formatted social post.

---
phase: 3
title: "Feed Action Dock Integration & Drafts Hub Page"
status: completed
priority: P1
effort: "1h"
dependencies: ["phase-02-comment-drawer-component.md"]
---

# Phase 3: Feed Action Dock Integration & Drafts Hub Page

## Overview
Wire the Comment Drawer into the Feed screen Floating Action Dock (`FeedClient.tsx`) and update the `/commentary` drafts review page (`app/commentary/page.tsx`) to show full drafts with platform badges and one-tap copy/delete actions.

## Requirements
- Add Comment action button (`💬`) into the 5-button Floating Action Dock.
- Connect active card state to `CommentDrawer`.
- Upgrade `/commentary` page with platform badges (LinkedIn / X / Memo), article source links, status tags, and copy buttons.

## Related Code Files
- Modify: `app-smuke/components/FeedClient.tsx`
- Modify: `app-smuke/app/commentary/page.tsx`

## Implementation Steps
1. Add Comment button to `FeedClient.tsx` Floating Action Dock.
2. Add `selectedCommentCard` state and open `CommentDrawer` when user clicks Comment on active card.
3. Update `app/commentary/page.tsx` with rich card layout and quick copy buttons.

## Success Criteria
- [ ] Comment button is visible and responsive in Floating Action Dock.
- [ ] Drafts saved from the drawer appear on `/commentary`.

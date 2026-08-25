---
phase: 2
title: "Collapsible Accordion Cards with Framer Motion"
status: completed
priority: P1
effort: "1.5h"
dependencies: ["01"]
---

# Phase 02: Collapsible Accordion Cards with Framer Motion

## Overview
Transform draft cards into collapsible accordion elements that are collapsed by default to present a clean, high-density overview, expanding smoothly on tap to reveal the full generated draft and action suite.

## Requirements
- **Functional**:
  - **Default Collapsed State**: Shows platform badge, source name, timestamp, article headline, user take snippet, 2-line draft preview, chevron toggle, and quick copy/delete buttons.
  - **Expanded State**: Smoothly unrolls to reveal full formatted draft, editable textarea toggle, strategic rationale block (`💡`), canonical source link (`Source article ↗`), and primary actions ("📋 Copy Post", "📤 Share", "🗑️ Delete").
  - **Interactive Toggles**: Clicking card header or chevron expands/collapses the individual card.
  - **Global Controls**: "Expand All" / "Collapse All" toggle button at the top toolbar.
  - **Copy Feedback**: Micro-interaction toast/badge ("Copied! ✓") on copy.
- **Non-functional**:
  - Smooth 60fps spring transitions with Framer Motion (`AnimatePresence` and `layout` prop).
  - Accessible keyboard navigation (`Enter` / `Space` to toggle, `aria-expanded`).

## Related Code Files
- Modify / Create: `app-smuke/components/CommentaryCard.tsx` (or inside `CommentaryClient.tsx`)
- Modify: `app-smuke/components/CommentaryClient.tsx`

## Implementation Steps
1. Maintain `expandedIds` state (`Set<string>`) in `CommentaryClient.tsx`. Default is empty (`new Set()`) so all cards start collapsed.
2. Build accordion header with:
   - Platform badge + Source name.
   - Date + Quick Delete button.
   - Article Title (`📰 ...`).
   - User Take snippet (`💡 ...`).
   - 2-line truncated preview text when collapsed.
   - Rotating chevron indicator (`▾` rotating 180° when expanded).
3. Build accordion body wrapped with `motion.div` (`initial={{ height: 0, opacity: 0 }}`, `animate={{ height: "auto", opacity: 1 }}`):
   - Formatted draft content surface.
   - Strategic rationale footnote.
   - Action bar with Copy Post, Share, Source Link, and Delete.
4. Add "Expand All / Collapse All" button next to draft count in the header toolbar.

## Success Criteria
- [ ] Draft cards are collapsed by default on page load.
- [ ] Tapping anywhere on the card header expands the card with smooth animation.
- [ ] Tapping "Expand All" opens all visible cards; "Collapse All" folds them back.
- [ ] Quick copy button works in both collapsed and expanded states.

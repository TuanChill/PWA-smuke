---
phase: 1
title: "Search, Filter & Pagination Engine"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 01: Search, Filter & Pagination Engine

## Overview
Implement robust client-side search, multi-criteria filtering by target platform, sorting, and pagination logic in `CommentaryClient.tsx`.

## Requirements
- **Functional**:
  - Search across `draft.draft`, `draft.articleTitle`, `draft.userComment`, and `draft.sourceName`.
  - Platform filter buttons: All (`all`), LinkedIn (`linkedin`), X / Twitter (`twitter_x`), Executive Memo (`executive_memo`) with live count badges for each category.
  - Sorting options: `newest` (default, created timestamp descending) and `oldest` (created timestamp ascending).
  - Pagination slicing with 5 items per page default (configurable).
  - Page navigation controls: Previous, Page number indicators, Next, and range summary ("Showing 1–5 of 12 drafts").
  - Auto-reset page to 1 when search query or filter changes.
- **Non-functional**:
  - Zero lag instant filtering with memoization (`useMemo`).
  - Graceful empty states for zero total drafts and zero search/filter matches with "Clear Filters" CTA.

## Related Code Files
- Modify: `app-smuke/components/CommentaryClient.tsx`
- Modify: `app-smuke/app/commentary/page.tsx`

## Implementation Steps
1. Add state variables: `searchQuery`, `platformFilter`, `sortOrder`, `currentPage`, `pageSize`.
2. Compute `filteredAndSortedDrafts` using `useMemo`.
3. Compute `totalPages = Math.ceil(filtered.length / pageSize)` and `paginatedDrafts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)`.
4. Build Search Bar UI with search icon, clear button (`✕`), and keyboard shortcut hint.
5. Build Platform Filter Chips with counts (e.g. `All (8)`, `LinkedIn (5)`, `X (2)`, `Memo (1)`).
6. Build Pagination control bar with Previous/Next and page index buttons.
7. Add "Reset filters" button when search/filter returns empty results.

## Success Criteria
- [ ] Typing in the search input filters drafts instantly across title, content, take, and source.
- [ ] Clicking platform tabs filters down to only drafts for that platform with correct count badges.
- [ ] Changing page navigates smoothly between slices of 5 drafts.
- [ ] Changing filter or search query resets page index to 1.

---
title: "Commentary Hub: Collapsible Accordion Cards, Search, Filter & Pagination"
status: completed
priority: P1
effort: "4h"
created: "2026-08-25T16:35:00.000Z"
phases:
  - id: "01"
    title: "Search, Filter & Pagination Engine"
    status: completed
  - id: "02"
    title: "Collapsible Accordion Cards with Framer Motion"
    status: completed
  - id: "03"
    title: "Unit Tests & UX Verification"
    status: completed
---

# Commentary Hub: Collapsible Accordion Cards, Search, Filter & Pagination

## Executive Summary
Enhance the `/commentary` Social Post Drafts page from a simple static list into an efficient, scalable Drafts Management Hub. Cards will be collapsed by default into compact summaries to maximize vertical scanability, with 1-click expand/collapse, instant multi-field search, platform filter chips (LinkedIn, X, Exec Memo), and paginated navigation.

## Key Deliverables
1. **Collapsible Accordion Cards (Default Collapsed)**:
   - Compact preview: Platform badge, Source, Date, Article Title, User Take snippet, and Action buttons.
   - Smooth animated expansion to view full draft, edit text, copy, share, and view rationale.
   - Global "Expand All / Collapse All" toggle.
2. **Real-time Search & Multi-Criteria Filtering**:
   - Search bar querying draft text, article titles, user comments, and source names.
   - Platform filter pills (`All`, `LinkedIn`, `X / Twitter`, `Exec Memo`) with live count badges.
   - Sort toggle (`Newest first`, `Oldest first`).
3. **Pagination & Responsive Layout**:
   - Clean page controls (`Prev`, `1`, `2`, `Next`, "Showing X-Y of Z").
   - Configurable page size (default 5 items per page).
   - Empty search results state with 1-tap reset.

## Phase Roadmap
- **Phase 01**: Search, Filter & Pagination Engine (`phase-01-search-filter-pagination.md`)
- **Phase 02**: Collapsible Accordion Cards with Framer Motion (`phase-02-accordion-collapsible-cards.md`)
- **Phase 03**: Unit Tests & UX Verification (`phase-03-tests-and-polish.md`)

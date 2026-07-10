# Production Scale Plan

This is the Ponytail review of the current Smuke build: keep the useful product surface, remove needless moving parts, and move stateful work to the few managed systems that actually need to exist.

## Current Build Verdict

The app is a strong demo and product prototype. It is not production-ready for 1,000 concurrent users while it relies on the local file-backed `memoryStore`.

What already holds:

- Next.js app shell, mobile feed, gesture interactions.
- Server-side ingestion adapters for RSS and GDELT discovery.
- Source allowlist and relevance filtering.
- Raw event tracking, user memory snapshots, search ranking, ad ranking.
- Supabase migrations for the production data shape.

What does not hold for live traffic:

- `lib/store/memory-store.ts` writes JSON to local disk. This breaks on serverless, races under concurrency, and cannot scale horizontally.
- Feed queue refresh currently runs in-request. It is okay for demos, not for a busy feed.
- AI processing happens inline during ingestion. That must become a worker job before high-volume ingestion.
- Admin surfaces are not a full RBAC product yet. The ingest route is now token-gated, but production should use authenticated admin roles.
- Legacy preference graph files still exist for UI compatibility. New writes should use raw events -> scores -> memory snapshots.

## Overcomplications To Cut

1. Two preference systems
   - Keep: raw events, topic/source scores, memory snapshots.
   - Retire next: direct `PreferenceNode` graph mutation and the old graph update path.

2. In-process persistence
   - Keep only for local demo.
   - Replace with Supabase repositories before public launch.

3. Inline ingestion and AI processing
   - Keep the adapter code.
   - Move execution to scheduled/background jobs.

4. Manual feed refresh button logic
   - Keep client-side optimistic swipes.
   - Feed API should read cached queue only; ranking refresh should happen asynchronously.

## Target Architecture

```txt
Browser PWA
  -> Next.js API/BFF
  -> Supabase Auth
  -> Supabase Postgres + pgvector
  -> Redis feed/session cache
  -> Worker queue
       -> source ingestion
       -> AI summarisation/classification
       -> embedding creation
       -> user score updates
       -> feed queue refresh
  -> Object storage for voice/audio later
  -> Observability: Sentry + metrics
```

No frontend route should call external news APIs. Users read from cached feed queues. Ingestion is scheduled or admin-triggered server-side only.

## 1,000 Concurrent Users

Use this as the first production target.

- App hosting: 2-3 Next.js instances or serverless with warm capacity.
- Database: Supabase Postgres with pooled connections.
- Cache: Redis for hot feed queues and per-session state.
- Queue: one worker pool for ingestion and one for user/profile jobs.
- Feed API: reads `user_feed_queue` by `user_id`, `rank_score`, cursor.
- Event API: append-only insert into `user_events`; queue score update.
- Ranking: precompute top 100-300 cards per active user.
- Ingestion: every 5-15 minutes depending on source tier.

Latency targets:

- `GET /api/feed`: p95 under 300ms from cache/db.
- `POST /api/events`: p95 under 150ms append-only.
- Swipe UI: optimistic, never waits for ranking.

## 100k Active Users

Do not solve this by making Next.js smarter. Split hot paths.

- Keep Next.js as BFF/UI only.
- Event writes remain append-only and cheap.
- Use Redis Streams, SQS, or a managed queue for fan-out.
- Partition feed queue and user scores by `user_id`.
- Batch user score updates; do not update memory snapshots on every click synchronously.
- Refresh active-user feed queues first; cold users refresh on login.
- Add CDN/static caching for public assets only, not personalised feed JSON.
- Add read replicas or analytical store for admin analytics.

Data volume planning:

- 100k active users * 50 events/day = 5M events/day.
- Keep raw event logs partitioned by month.
- Keep hot event windows in Postgres; archive old raw events to object storage or analytics DB.
- User memory snapshots stay compact and serving-friendly.

## Production Migration Steps

1. Replace `memoryStore` with repository interfaces backed by Supabase.
   - `ArticleRepository`
   - `EventRepository`
   - `UserMemoryRepository`
   - `FeedQueueRepository`

2. Keep local file store only behind `NODE_ENV !== "production"`.

3. Make `/api/events` append-only.
   - Insert event.
   - Enqueue preference update.
   - Return immediately.

4. Move `refreshFeedQueue()` to a worker.
   - Trigger after score update.
   - Also run scheduled refresh for active users.

5. Move `/api/admin/ingest` to scheduled workers.
   - Token-gated route can stay for manual ops.
   - Add source/job status tables and retry backoff.

6. Connect Supabase Auth.
   - Replace `demoUser`.
   - Enforce owner-scoped reads/writes through RLS.

7. Add rate limits.
   - `/api/events`: per user/session.
   - `/api/search`: per user/IP.
   - `/api/admin/*`: admin only.

8. Add observability.
   - Sentry errors.
   - Queue depth.
   - Ingestion success/failure by source.
   - Feed p95 latency.
   - Event write latency.

## Minimal Launch Gate

Do not launch to real users until these are true:

- `memoryStore` is not used in production runtime.
- Supabase Auth identifies real users.
- `/api/admin/ingest` is admin-only.
- Feed reads from persisted `user_feed_queue`.
- Event writes are append-only and do not block on AI.
- External source calls only happen in worker/admin context.
- Sensitive ad targeting blocklist is enforced.
- Export/delete data paths use persisted user records.

## Current Code Changes From This Review

- Removed unused `zustand`.
- Added `ADMIN_INGEST_TOKEN` gate for ingestion.
- Stopped interaction/comment routes from also mutating the legacy graph path.
- Kept the existing local file store only as a demo bridge, not a production plan.


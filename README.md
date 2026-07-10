# Smuke.app

Smuke.app is a mobile-first PWA for personalised AI-curated news intelligence. It ingests live or mock news, normalises and compresses each story, ranks cards against a user preference graph, and lets users train the feed through fast swipe interactions and comments.

## Tech Stack

- Next.js 15, React 19, strict TypeScript
- Tailwind CSS
- Framer Motion and `@use-gesture/react` for mobile swipe interactions
- Zod for API and AI output validation
- Supabase Postgres/Auth/RLS migration foundation
- MiniMax production AI provider behind an abstract interface
- Mock AI provider for local development

## Architecture

```txt
News API/RSS/mock source
-> raw item normalisation
-> AI summary/classification/entity extraction
-> structured article object
-> ranking engine
-> cached feed queue
-> swipe feed
-> raw user events
-> short/medium/long preference scores
-> user memory snapshot
-> ranking/ad/search serving layer
-> feed refresh
```

Feed interactions are optimistic: the UI advances immediately and backend graph/ranking work runs after the interaction write.
Core data principle: raw events are the source of truth, user memory snapshots are the serving layer, ranking consumes scores, and LLMs read structured memory rather than raw logs by default.

## Local Setup

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Use `.env.local` for local secrets. `.env*` files are ignored by git.

```bash
SMUKE_AI_PROVIDER=mock
MINIMAX_API_KEY=
MINIMAX_BASE_URL=https://api.minimax.chat/v1/text/chatcompletion_v2
MINIMAX_MODEL=MiniMax-Text-01
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REDIS_URL=
SENTRY_DSN=
```

Set `SMUKE_AI_PROVIDER=minimax` only when `MINIMAX_API_KEY` is available in the runtime environment.

## Supabase Setup

The SQL migrations are in:

- `supabase/migrations/001_smuke_core.sql`
- `supabase/migrations/002_user_intelligence_layer.sql`

```bash
supabase db reset
```

The first migration creates users, consents, sources, raw items, articles, classifications, embeddings, feed queues, preference nodes, interactions, comments, commentary drafts, and RLS policies for user-owned data.
The second migration adds content cache tables, raw event logs, topic/source/sentiment scores, structured memory snapshots, ad campaigns, ad events, and RLS policies.

## Seed and Worker Commands

```bash
npm run ingest:mock
npm run worker:mock
```

The current MVP uses an in-memory store for local development. Production wiring should replace `lib/store/memory-store.ts` with Supabase-backed repositories and BullMQ workers.

## Test Commands

```bash
npm run typecheck
npm test
```

## Data Intelligence APIs

```txt
POST /api/events
GET  /api/events
GET  /api/user-memory
POST /api/user-memory/preferences
GET  /api/search?q=bitcoin+etf
GET  /api/ads
```

Events are validated with Zod and weighted before preference updates. The local demo writes them to `.data/smuke-local-store.json`; production should persist the same model into Supabase using `supabase/migrations/002_user_intelligence_layer.sql`.

The LLM-readable memory contract is available through `/api/user-memory`. It returns stable preferences, short-term intent, negative preferences, source affinity, and an explanation summary without exposing unlimited raw behaviour logs.

## MiniMax AI Mode

The AI provider interface lives in `lib/ai`. Local development defaults to `mock`; production can opt into MiniMax with:

```bash
SMUKE_AI_PROVIDER=minimax
MINIMAX_API_KEY=<provided-by-runtime>
```

All AI outputs are parsed through Zod schemas before entering article, sentiment, or commentary flows.

## Adding News Sources

- Mock source: `lib/ingestion/mock-source.ts`
- RSS source adapter: `lib/ingestion/rss-source.ts`
- GDELT discovery adapter: `lib/ingestion/gdelt-source.ts`
- Approved source catalog: `lib/ingestion/source-catalog.ts`
- Normalisation and AI processing: `lib/ingestion/normalise.ts`

Do not store full article bodies unless the license explicitly allows it. Store source URL, title, timestamp, short summary, metadata, tags, and embeddings.

Run live ingestion from `/admin` or:

```bash
curl -X POST -H "x-admin-token: $ADMIN_INGEST_TOKEN" -F mode=live http://localhost:3010/api/admin/ingest
```

The live path combines GDELT discovery and public RSS feeds, then applies the approved-source allowlist before AI processing. If a publisher feed blocks automated access or changes format, the fetch is skipped and the rest of the source set continues.
In production, `ADMIN_INGEST_TOKEN` must be set and supplied as `x-admin-token`; public users should never trigger external ingestion directly.

## Privacy and Consent

Consent flags are represented in `lib/types.ts` and seeded in `lib/store/seed.ts`. Sensitive sentiment is gated in `lib/privacy/consent.ts`; when sensitive tracking is disabled, sensitive labels are removed and replaced with generic non-sensitive public-affairs tags.

## Deployment Notes

- Configure Supabase env vars and run migrations.
- Configure MiniMax env vars if using production AI mode.
- Move in-memory repositories to Supabase-backed repositories before multi-user production.
- Add Redis/BullMQ workers for ingestion, graph updates, and feed refresh jobs.
- Add Sentry DSN and route-level rate limiting.

See `docs/production-scale-plan.md` for the Ponytail production review, overcomplication cuts, and the path from 1,000 concurrent users to 100k active users.

## Known Limitations

- Auth UI is scaffolded but not connected to Supabase Auth yet.
- Local data is in-memory and resets on server restart.
- RSS ingestion adapter exists, but scheduled workers are not wired.
- MiniMax voice transcription is a placeholder until the speech endpoint is selected.
- Admin authorization is not enforced in the local mock UI.

## Next Steps

1. Replace memory store with Supabase repositories.
2. Add Supabase Auth pages and server clients.
3. Add BullMQ queues for ingestion, AI processing, graph updates, and feed refresh.
4. Add Playwright E2E coverage for onboarding, feed swipes, comments, drafts, and privacy export.

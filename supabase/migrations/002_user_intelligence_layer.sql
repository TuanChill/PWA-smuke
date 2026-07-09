create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.news_sources(id) on delete set null,
  canonical_url text not null unique,
  title text not null,
  abstract text,
  image_url text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  language text not null default 'en',
  region text,
  content_hash text,
  cluster_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.content_topics (
  content_id uuid not null references public.content_items(id) on delete cascade,
  topic text not null,
  confidence numeric(5,4) not null default 0,
  primary key (content_id, topic)
);

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_id text not null,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  topic text,
  topics text[] not null default '{}',
  source_id text,
  value numeric(8,3) not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists user_events_user_created_idx on public.user_events(user_id, created_at desc);
create index if not exists user_events_topic_idx on public.user_events using gin(topics);

create table if not exists public.user_topic_scores (
  user_id uuid not null references public.users(id) on delete cascade,
  topic text not null,
  short_score numeric(8,3) not null default 0,
  medium_score numeric(8,3) not null default 0,
  long_score numeric(8,3) not null default 0,
  negative_score numeric(8,3) not null default 0,
  explicit boolean not null default false,
  muted boolean not null default false,
  last_updated_at timestamptz not null default now(),
  primary key (user_id, topic)
);

create table if not exists public.user_source_scores (
  user_id uuid not null references public.users(id) on delete cascade,
  source_id text not null,
  source_name text not null,
  affinity_score numeric(8,3) not null default 0,
  trust_score numeric(5,4) not null default 0.5,
  fatigue_score numeric(8,3) not null default 0,
  last_updated_at timestamptz not null default now(),
  primary key (user_id, source_id)
);

create table if not exists public.user_sentiment_scores (
  user_id uuid not null references public.users(id) on delete cascade,
  entity text not null,
  sentiment_type text not null,
  score numeric(8,3) not null default 0,
  window text not null,
  last_updated_at timestamptz not null default now(),
  primary key (user_id, entity, sentiment_type, window)
);

create table if not exists public.user_memory_snapshots (
  user_id uuid primary key references public.users(id) on delete cascade,
  stable_preferences jsonb not null default '{}',
  short_term_intent jsonb not null default '{}',
  negative_preferences jsonb not null default '{}',
  source_affinity jsonb not null default '{}',
  search_style jsonb not null default '{}',
  ad_affinity jsonb not null default '{}',
  recent_sentiment jsonb not null default '{}',
  llm_summary text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_name text not null,
  title text not null,
  description text,
  target_topics text[] not null default '{}',
  blocked_topics text[] not null default '{}',
  bid_value numeric(8,3) not null default 0,
  freshness_score numeric(5,4) not null default 0.5,
  regulatory_risk numeric(5,4) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  ad_campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  event_type text not null,
  value numeric(8,3) not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.content_items enable row level security;
alter table public.content_topics enable row level security;
alter table public.user_events enable row level security;
alter table public.user_topic_scores enable row level security;
alter table public.user_source_scores enable row level security;
alter table public.user_sentiment_scores enable row level security;
alter table public.user_memory_snapshots enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_events enable row level security;

create policy "authenticated can read content items" on public.content_items
  for select to authenticated
  using (true);

create policy "authenticated can read content topics" on public.content_topics
  for select to authenticated
  using (true);

create policy "users can insert own events" on public.user_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can read own events" on public.user_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own topic scores" on public.user_topic_scores
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can update own topic scores" on public.user_topic_scores
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can read own source scores" on public.user_source_scores
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own sentiment scores" on public.user_sentiment_scores
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own memory snapshot" on public.user_memory_snapshots
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can update own memory snapshot" on public.user_memory_snapshots
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "authenticated can read active ad campaigns" on public.ad_campaigns
  for select to authenticated
  using (active = true);

create policy "users can read own ad events" on public.ad_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own ad events" on public.ad_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

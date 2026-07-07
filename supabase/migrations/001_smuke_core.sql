create extension if not exists vector;

create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text,
  avatar_url text,
  role text not null default 'user',
  company text,
  profession text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  consent_preference_tracking boolean not null default true,
  consent_comment_analysis boolean not null default true,
  consent_voice_transcription boolean not null default false,
  consent_sensitive_sentiment_tracking boolean not null default false,
  consent_personalised_commentary boolean not null default true,
  consent_model_training boolean not null default false,
  consent_marketing_personalisation boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.consent_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  consent_type text not null,
  old_value boolean not null,
  new_value boolean not null,
  changed_at timestamptz not null default now(),
  ip_hash text,
  user_agent_hash text
);

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('api', 'rss', 'manual', 'partner', 'mock')),
  base_url text,
  feed_url text,
  api_provider text,
  licence_type text,
  source_tier text not null default 'tier_2',
  active boolean not null default true,
  fetch_frequency_minutes integer not null default 15,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raw_ingested_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.news_sources(id) on delete set null,
  external_id text,
  raw_payload jsonb not null,
  raw_title text,
  raw_url text,
  raw_excerpt text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.news_sources(id) on delete set null,
  source_name text not null,
  source_url text not null,
  canonical_url text not null unique,
  title text not null,
  summary text,
  compressed_intent text,
  primary_category text,
  importance_score numeric(4,3) not null default 0,
  freshness_score numeric(4,3) not null default 0,
  source_tier text not null default 'tier_2',
  duplicate_cluster_id text,
  semantic_hash text,
  published_at timestamptz,
  ingested_at timestamptz not null default now(),
  processed_at timestamptz,
  language text not null default 'en',
  processing_status text not null default 'raw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.article_classifications (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  secondary_categories text[] not null default '{}',
  topic_tags text[] not null default '{}',
  entity_tags text[] not null default '{}',
  region_tags text[] not null default '{}',
  sector_tags text[] not null default '{}',
  audience_tags text[] not null default '{}',
  professional_relevance_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.article_embeddings (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  embedding vector(1536),
  model text not null default 'mock',
  created_at timestamptz not null default now()
);

create table if not exists public.user_preference_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  node_type text not null,
  label text not null,
  score numeric(8,3) not null default 0,
  confidence numeric(4,3) not null default 0,
  sensitive boolean not null default false,
  evidence_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, node_type, label)
);

create table if not exists public.user_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  interaction_type text not null,
  interaction_weight numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_feed_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  rank_score numeric(8,4) not null,
  reason_tags text[] not null default '{}',
  queued_at timestamptz not null default now(),
  seen_at timestamptz,
  unique (user_id, article_id)
);

create table if not exists public.user_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  comment_text text not null,
  sentiment_output jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.user_commentary_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  draft text not null,
  rationale text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.user_consents enable row level security;
alter table public.consent_audit_logs enable row level security;
alter table public.user_preference_nodes enable row level security;
alter table public.user_interactions enable row level security;
alter table public.user_feed_queue enable row level security;
alter table public.user_comments enable row level security;
alter table public.user_commentary_drafts enable row level security;
alter table public.news_sources enable row level security;
alter table public.raw_ingested_items enable row level security;
alter table public.articles enable row level security;
alter table public.article_classifications enable row level security;
alter table public.article_embeddings enable row level security;

create policy "users can read own profile" on public.users for select to authenticated using ((select auth.uid()) = id);
create policy "users can update own profile" on public.users for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users can read own consents" on public.user_consents for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can update own consents" on public.user_consents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can read own preference nodes" on public.user_preference_nodes for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can mutate own preference nodes" on public.user_preference_nodes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can read own feed queue" on public.user_feed_queue for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can write own interactions" on public.user_interactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users can read own comments" on public.user_comments for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can write own comments" on public.user_comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users can read own drafts" on public.user_commentary_drafts for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can mutate own drafts" on public.user_commentary_drafts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "authenticated can read ready articles" on public.articles for select to authenticated using (processing_status = 'ready' and deleted_at is null);
create policy "authenticated can read classifications for ready articles" on public.article_classifications for select to authenticated using (exists (select 1 from public.articles a where a.id = article_id and a.processing_status = 'ready' and a.deleted_at is null));

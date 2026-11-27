-- PHASE 02 — AI Music Lab: subscriptions, curriculum content, mix analysis, AI coach, set builder.

-- Stripe customer for subscriptions / billing portal
alter table public.users add column if not exists stripe_customer_id text unique;

alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
create unique index if not exists subscriptions_one_live_per_user
  on public.subscriptions(user_id) where status in ('trialing','active','past_due','incomplete');

-- skill scores can come from rule-based audio measurement (not an AI judgement)
alter table public.skill_scores drop constraint if exists skill_scores_source_check;
alter table public.skill_scores add constraint skill_scores_source_check check (source in ('ai','instructor','self','analysis'));

-- Mix Lab: in-browser analysis keeps the audio on the user's device by default.
alter table public.audio_uploads add column if not exists stored boolean not null default false;
alter table public.mix_analysis_results add column if not exists title text;
alter table public.mix_analysis_results add column if not exists analyzer text not null default 'browser-v1';
alter table public.mix_analysis_results add column if not exists shared_with_instructor boolean not null default false;
create index if not exists mix_results_user_idx on public.mix_analysis_results(user_id, created_at desc);

-- Instructor feedback on a student's analysis — always stored separately from measured/rule-based values.
create table if not exists public.analysis_reviews (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.mix_analysis_results(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  comment text not null check (length(comment) between 1 and 4000),
  scores jsonb not null default '{}'::jsonb,   -- {skill: 0..100}
  created_at timestamptz not null default now()
);
create index if not exists analysis_reviews_result_idx on public.analysis_reviews(result_id);

-- Learning: quiz attempts are kept for history
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  score int not null check (score between 0 and 100),
  answers jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts(user_id, created_at desc);

-- Set Builder: personal track library (rekordbox XML / CSV import) and saved sets
create table if not exists public.library_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  artist text not null default '',
  bpm numeric(6,2),
  camelot text check (camelot ~ '^(1[0-2]|[1-9])[AB]$'),
  duration_sec int,
  genre text not null default '',
  energy smallint check (energy between 1 and 10),
  source text not null default 'manual' check (source in ('manual','csv','rekordbox')),
  created_at timestamptz not null default now()
);
create index if not exists library_tracks_user_idx on public.library_tracks(user_id);

create table if not exists public.dj_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  context jsonb not null default '{}'::jsonb,   -- {minutes, venue, slot, genre, bpmMin, bpmMax}
  tracks jsonb not null default '[]'::jsonb,    -- ordered [{title, artist, bpm, camelot, minutes, energy}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dj_sets_user_idx on public.dj_sets(user_id, updated_at desc);

alter table public.analysis_reviews enable row level security;
alter table public.analysis_reviews force row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempts force row level security;
alter table public.library_tracks enable row level security;
alter table public.library_tracks force row level security;
alter table public.dj_sets enable row level security;
alter table public.dj_sets force row level security;

create policy own_quiz on public.quiz_attempts for select using (user_id = auth.uid());
create policy own_library on public.library_tracks for select using (user_id = auth.uid());
create policy own_sets on public.dj_sets for select using (user_id = auth.uid());
create policy review_read on public.analysis_reviews for select using (
  exists (select 1 from public.mix_analysis_results r where r.id = result_id and r.user_id = auth.uid())
  or exists (select 1 from public.instructors i where i.id = instructor_id and i.user_id = auth.uid())
);

grant select on public.analysis_reviews, public.quiz_attempts, public.library_tracks, public.dj_sets to authenticated;
revoke select on public.users from anon, authenticated;
grant select (id, email, role, locale, timezone, status, created_at, updated_at) on public.users to authenticated;

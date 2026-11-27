-- THE DJ COLLECTIVE — initial schema
-- Runs on Supabase Postgres (auth schema provided by Supabase) and on local
-- Postgres after supabase/local/00_auth_stub.sql.
--
-- Access model
--   * The Next.js server talks to Postgres with a privileged connection and
--     enforces permissions in server code (src/lib/auth/*, src/lib/guards.ts).
--   * Row Level Security is enabled on EVERY table as defence in depth, so the
--     public anon/authenticated API keys can only ever see what the policies
--     below allow. Tables without a policy are invisible to those roles.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------------------
-- identity
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'member' check (role in ('member','instructor','admin')),
  locale text not null default 'en' check (locale in ('en','ja','th')),
  timezone text not null default 'Asia/Bangkok',
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  totp_secret text,               -- admin 2FA (base32). never exposed to clients
  totp_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index users_role_idx on public.users(role);

create table public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null default '',
  dj_name text,
  avatar_url text,
  bio text,
  experience_level text not null default 'beginner' check (experience_level in ('beginner','intermediate','advanced')),
  goal text check (goal in ('start','improve','club','online','analyze','community')),
  genres text[] not null default '{}',
  equipment text[] not null default '{}',
  languages text[] not null default '{}',
  country text,
  city text,
  weekly_practice_hours numeric(4,1),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supabase Auth -> public.users / profiles
create or replace function public.handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, locale)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'locale', 'en'))
  on conflict (id) do nothing;
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin' and status = 'active')
$$;

-- ---------------------------------------------------------------------------
-- academy: instructors, studios, lessons, availability, bookings
-- ---------------------------------------------------------------------------
create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  slug text not null unique,
  dj_name text not null,
  photo_url text,
  base_city text,
  bio jsonb not null default '{}'::jsonb,          -- {en,ja,th}
  genres text[] not null default '{}',
  languages text[] not null default '{}',
  achievements jsonb not null default '[]'::jsonb, -- [{title, venue, year, verified}]
  equipment text[] not null default '{}',
  mix_urls text[] not null default '{}',
  social jsonb not null default '{}'::jsonb,       -- {instagram, soundcloud, ...}
  intro_video_url text,
  timezone text not null default 'Asia/Bangkok',
  is_published boolean not null default false,
  is_placeholder boolean not null default false,   -- true = demo data, must be replaced
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null default 'Bangkok',
  map_query text,
  access_notes jsonb not null default '{}'::jsonb,
  equipment text[] not null default '{}',
  is_placeholder boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  mode text not null check (mode in ('in_person','online')),
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  duration_min int not null check (duration_min between 15 and 480),
  price_satang int not null check (price_satang >= 0),  -- THB minor units
  currency text not null default 'THB',
  levels text[] not null default '{beginner,intermediate,advanced}',
  is_provisional boolean not null default true,         -- price not yet confirmed by the school
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),   -- 0 = Sunday, instructor-local
  start_time time not null,
  end_time time not null,
  mode text not null default 'both' check (mode in ('in_person','online','both')),
  studio_id uuid references public.studios(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index instructor_availability_idx on public.instructor_availability(instructor_id, weekday);

create table public.instructor_time_off (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index instructor_time_off_idx on public.instructor_time_off(instructor_id, starts_at);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off int check (percent_off between 1 and 100),
  amount_off_satang int check (amount_off_satang > 0),
  valid_until timestamptz,
  max_redemptions int,
  redemptions int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((percent_off is null) <> (amount_off_satang is null))
);

-- Booking state machine:
--   held -> pending_payment -> confirmed -> completed
--   held/pending_payment -> expired | payment_failed | cancelled
--   confirmed -> cancelled -> refunded
-- Double booking is prevented by the database itself: two "active" bookings of
-- the same instructor can never overlap in time (exclusion constraint below).
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  instructor_id uuid not null references public.instructors(id) on delete restrict,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  studio_id uuid references public.studios(id) on delete set null,
  mode text not null check (mode in ('in_person','online')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  period tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  status text not null default 'held' check (status in
    ('held','pending_payment','confirmed','completed','cancelled','refunded','expired','payment_failed')),
  hold_expires_at timestamptz,
  genre text,
  level text check (level in ('beginner','intermediate','advanced')),
  equipment text,
  language text,
  user_timezone text,
  notes text,
  price_satang int not null,
  discount_satang int not null default 0,
  currency text not null default 'THB',
  coupon_id uuid references public.coupons(id),
  meeting_provider text,
  meeting_url text,
  rescheduled_from uuid references public.bookings(id),
  reminder_sent_at timestamptz,
  instructor_notes text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint bookings_no_overlap exclude using gist (
    instructor_id with =, period with &&
  ) where (status in ('held','pending_payment','confirmed','completed'))
);
create index bookings_user_idx on public.bookings(user_id, starts_at desc);
create index bookings_instructor_idx on public.bookings(instructor_id, starts_at);
create index bookings_status_idx on public.bookings(status, hold_expires_at);

-- ---------------------------------------------------------------------------
-- curriculum
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  level int not null unique check (level between 1 and 12),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  min_plan text not null default 'free',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  sort_order int not null default 0,
  title jsonb not null,
  kinds text[] not null default '{text}',  -- video,text,practice,quiz,practical,instructor_review,ai_review
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_modules_course_idx on public.course_modules(course_id, sort_order);

create table public.learning_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  quiz_score int,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table public.audio_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime text not null check (mime in ('audio/mpeg','audio/wav','audio/x-wav','audio/aiff','audio/x-aiff','audio/mp4','audio/x-m4a')),
  size_bytes bigint not null check (size_bytes > 0),
  duration_sec int,
  sha256 text,
  visibility text not null default 'private' check (visibility in ('private','community','public')),
  rights_confirmed boolean not null default false,
  ai_training_consent boolean not null default false,  -- never true without explicit opt-in
  created_at timestamptz not null default now(),
  check (visibility = 'private' or rights_confirmed)
);
create index audio_uploads_user_idx on public.audio_uploads(user_id, created_at desc);
create index audio_uploads_sha_idx on public.audio_uploads(sha256);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  course_module_id uuid references public.course_modules(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  created_at timestamptz not null default now()
);
create index assignments_user_idx on public.assignments(user_id);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  audio_upload_id uuid references public.audio_uploads(id) on delete set null,
  body text,
  status text not null default 'submitted' check (status in ('submitted','reviewed','returned')),
  instructor_score int check (instructor_score between 0 and 100),
  instructor_feedback text,
  ai_score int check (ai_score between 0 and 100),  -- kept separate from the human score on purpose
  ai_feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- AI (phase 02 — tables exist so quotas/usage can be tracked from day one)
-- ---------------------------------------------------------------------------
create table public.mix_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.audio_uploads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('uploading','queued','processing','completed','failed')),
  attempts int not null default 0,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index mix_jobs_status_idx on public.mix_analysis_jobs(status, created_at);

create table public.mix_analysis_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.mix_analysis_jobs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  measured jsonb not null,    -- values extracted from the audio (bpm curve, loudness, clipping ...)
  estimated jsonb not null,   -- inferred values (key, transitions ...) with confidence
  scores jsonb not null default '{}'::jsonb,
  advice jsonb not null default '[]'::jsonb,  -- LLM wording grounded on `measured`/`estimated`
  created_at timestamptz not null default now()
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'coach',
  messages jsonb not null default '[]'::jsonb,
  uses_learning_context boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid references public.users(id) on delete set null,
  feature text not null,
  units int not null default 1,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,5) not null default 0,
  period_month date not null default date_trunc('month', now())::date,
  created_at timestamptz not null default now()
);
create index ai_usage_user_month_idx on public.ai_usage(user_id, period_month, feature);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mode text not null,
  duration_sec int not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.skill_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill text not null,
  score int not null check (score between 0 and 100),
  source text not null check (source in ('ai','instructor','self')),
  source_id uuid,
  created_at timestamptz not null default now()
);
create index skill_scores_user_idx on public.skill_scores(user_id, skill, created_at desc);

-- ---------------------------------------------------------------------------
-- membership & payments
-- ---------------------------------------------------------------------------
create table public.plans (
  code text primary key,
  name text not null,
  price_satang int not null check (price_satang >= 0),
  currency text not null default 'THB',
  billing_interval text not null default 'month',
  features jsonb not null default '{}'::jsonb,  -- {en:[],ja:[],th:[]}
  quotas jsonb not null default '{}'::jsonb,    -- {ai_coach_messages, mix_analyses, max_upload_mb, max_minutes}
  stripe_price_id text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status text not null check (status in ('trialing','active','past_due','cancelled','incomplete')),
  provider text not null default 'stripe',
  provider_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions(user_id, status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null check (provider in ('stripe','demo')),
  provider_ref text unique,           -- checkout session / payment intent id
  amount_satang int not null,
  currency text not null default 'THB',
  method text,                        -- card, promptpay ...
  status text not null default 'pending' check (status in ('pending','succeeded','failed','refunded','expired')),
  refunded_satang int not null default 0,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_booking_idx on public.payments(booking_id);
create index payments_user_idx on public.payments(user_id, created_at desc);

create table public.webhook_events (
  id text primary key,  -- provider event id (idempotency)
  provider text not null,
  type text not null,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- community (phase 03)
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('mix','video','photo','text','gear_question','track_advice','lesson_review','event','activity')),
  body text,
  media_url text,
  audio_upload_id uuid references public.audio_uploads(id) on delete set null,
  genres text[] not null default '{}',
  hashtags text[] not null default '{}',
  region text,
  visibility text not null default 'members' check (visibility in ('public','members','followers','private')),
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_feed_idx on public.posts(status, visibility, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments(post_id, created_at);

create table public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'like' check (kind in ('like','bookmark')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);

create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_pair_idx on public.messages(recipient_id, sender_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete set null,
  target_type text not null check (target_type in ('post','comment','user','message','audio')),
  target_id uuid not null,
  reason text not null,
  ai_triage jsonb,
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  resolved_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table public.dj_battles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  rules text,
  weights jsonb not null default '{"ai":40,"instructor":40,"community":20}'::jsonb,
  submission_opens_at timestamptz,
  submission_closes_at timestamptz,
  voting_closes_at timestamptz,
  status text not null default 'draft' check (status in ('draft','open','voting','judging','closed')),
  created_at timestamptz not null default now()
);

create table public.battle_entries (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.dj_battles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  audio_upload_id uuid not null references public.audio_uploads(id),
  status text not null default 'submitted' check (status in ('submitted','approved','rejected','disqualified')),
  ai_score int, created_at timestamptz not null default now(),
  unique (battle_id, user_id)
);

create table public.battle_votes (
  battle_id uuid not null references public.dj_battles(id) on delete cascade,
  entry_id uuid not null references public.battle_entries(id) on delete cascade,
  voter_id uuid not null references public.users(id) on delete cascade,
  ip_hash text,
  created_at timestamptz not null default now(),
  primary key (battle_id, voter_id)   -- one vote per account per battle
);

create table public.judge_scores (
  entry_id uuid not null references public.battle_entries(id) on delete cascade,
  judge_id uuid not null references public.users(id) on delete cascade,
  score int not null check (score between 0 and 100),
  comment text,
  created_at timestamptz not null default now(),
  primary key (entry_id, judge_id)
);

-- ---------------------------------------------------------------------------
-- artist ecosystem (phase 04)
-- ---------------------------------------------------------------------------
create table public.artist_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  slug text not null unique,
  logo_url text,
  photo_url text,
  bio jsonb not null default '{}'::jsonb,
  genres text[] not null default '{}',
  mixes text[] not null default '{}',
  gigs_history jsonb not null default '[]'::jsonb,
  social jsonb not null default '{}'::jsonb,
  visible_sections text[] not null default '{bio,genres}',
  is_public boolean not null default false,
  booking_requests_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  venue_name text,
  venue_address text,
  city text not null default 'Bangkok',
  starts_at timestamptz not null,
  ends_at timestamptz,
  genres text[] not null default '{}',
  lineup text[] not null default '{}',
  ticket_url text,
  image_url text,
  is_showcase boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_start_idx on public.events(status, starts_at);

create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  venue_name text,
  starts_at timestamptz,
  play_minutes int,
  genres text[] not null default '{}',
  experience_level text,
  compensation text,
  requirements text,
  status text not null default 'open' check (status in ('draft','open','closed')),
  created_at timestamptz not null default now()
);

create table public.gig_applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text,
  ai_relevance numeric(4,3),       -- advisory only, never auto-rejects
  status text not null default 'submitted' check (status in ('submitted','shortlisted','accepted','declined','withdrawn')),
  created_at timestamptz not null default now(),
  unique (gig_id, user_id)
);

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  target_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'b2b',
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  unique (requester_id, target_id, kind),
  check (requester_id <> target_id)
);

-- ---------------------------------------------------------------------------
-- compliance, content, audit
-- ---------------------------------------------------------------------------
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('terms','privacy','marketing','ai_learning_context','ai_training','audio_rights')),
  granted boolean not null,
  version text not null,
  created_at timestamptz not null default now()
);
create index consent_user_idx on public.consent_records(user_id, kind, created_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  diff jsonb,
  ip text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create table public.site_content (
  key text not null,
  locale text not null check (locale in ('en','ja','th','*')),
  value jsonb not null,
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  body text not null,
  locale text,
  status text not null default 'new' check (status in ('new','answered','archived')),
  created_at timestamptz not null default now()
);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['users','profiles','instructors','studios','lessons','bookings','courses',
    'course_modules','ai_conversations','subscriptions','payments','posts','artist_profiles','events']
  loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security (defence in depth for anon/authenticated API keys)
-- ---------------------------------------------------------------------------
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('alter table public.%I force row level security', t.tablename);
  end loop;
end $$;

-- own rows only
create policy users_self on public.users for select using (id = auth.uid() or public.is_admin());
create policy profiles_read on public.profiles for select using (is_public or user_id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- public catalogue
create policy instructors_read on public.instructors for select using (is_published or user_id = auth.uid() or public.is_admin());
create policy studios_read on public.studios for select using (is_active);
create policy lessons_read on public.lessons for select using (is_active);
create policy availability_read on public.instructor_availability for select using (true);
create policy courses_read on public.courses for select using (is_published);
create policy modules_read on public.course_modules for select using (is_published);
create policy plans_read on public.plans for select using (is_active);
create policy events_read on public.events for select using (status = 'published' or public.is_admin());
create policy battles_read on public.dj_battles for select using (status <> 'draft' or public.is_admin());
create policy artists_read on public.artist_profiles for select using (is_public or user_id = auth.uid());
create policy gigs_read on public.gigs for select using (status = 'open' or organizer_id = auth.uid());

-- bookings: the student, the instructor of that booking, or an admin
create policy bookings_read on public.bookings for select using (
  user_id = auth.uid()
  or exists (select 1 from public.instructors i where i.id = instructor_id and i.user_id = auth.uid())
  or public.is_admin());

-- strictly private per-user data
create policy own_progress on public.learning_progress for select using (user_id = auth.uid());
create policy own_uploads on public.audio_uploads for select using (user_id = auth.uid() or visibility = 'public');
create policy own_jobs on public.mix_analysis_jobs for select using (user_id = auth.uid());
create policy own_results on public.mix_analysis_results for select using (user_id = auth.uid());
create policy own_conversations on public.ai_conversations for select using (user_id = auth.uid());
create policy own_ai_usage on public.ai_usage for select using (user_id = auth.uid());
create policy own_practice on public.practice_sessions for select using (user_id = auth.uid());
create policy own_skills on public.skill_scores for select using (user_id = auth.uid());
create policy own_subscriptions on public.subscriptions for select using (user_id = auth.uid());
create policy own_payments on public.payments for select using (user_id = auth.uid());
create policy own_notifications on public.notifications for select using (user_id = auth.uid());
create policy own_consents on public.consent_records for select using (user_id = auth.uid());
create policy own_submissions on public.assignment_submissions for select using (user_id = auth.uid());
create policy own_assignments on public.assignments for select using (user_id = auth.uid());
create policy messages_party on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy follows_read on public.follows for select using (true);
create policy match_party on public.match_requests for select using (requester_id = auth.uid() or target_id = auth.uid());
create policy gig_app_party on public.gig_applications for select using (
  user_id = auth.uid() or exists (select 1 from public.gigs g where g.id = gig_id and g.organizer_id = auth.uid()));

-- community visibility
create policy posts_read on public.posts for select using (
  status = 'published' and (visibility = 'public' or (visibility = 'members' and auth.uid() is not null))
  or user_id = auth.uid());
create policy comments_read on public.comments for select using (
  status = 'published' and exists (select 1 from public.posts p where p.id = post_id))
;
create policy reactions_read on public.reactions for select using (true);

-- site_content is public read (homepage copy/media)
create policy site_content_read on public.site_content for select using (true);

-- No policies (=> invisible to API roles): coupons, webhook_events, audit_logs,
-- reports, blocks, battle_votes, judge_scores, battle_entries, contact_messages,
-- instructor_time_off.

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant update on public.profiles to authenticated;

-- never expose 2FA secrets through the API, even to the owner
revoke select on public.users from anon, authenticated;
grant select (id, email, role, locale, timezone, status, created_at, updated_at) on public.users to authenticated;

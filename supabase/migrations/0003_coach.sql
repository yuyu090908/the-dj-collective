-- AI DJ Coach: conversation title and attached context (mix analysis / DJ set ids)
alter table public.ai_conversations add column if not exists title text not null default '';
alter table public.ai_conversations add column if not exists context jsonb not null default '{}'::jsonb;
create index if not exists ai_conversations_user_idx on public.ai_conversations(user_id, updated_at desc);

-- Paressilk — İletişim formu mesajları (admin panelinde görüntülenir + info@'dan cevaplanır)
-- Supabase SQL Editor'de BİR KEZ çalıştırın.

create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  name        text,
  email       text,
  phone       text,
  subject     text,
  message     text,
  status      text default 'new',   -- new | replied
  reply       text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;
grant all on table public.messages to service_role;

notify pgrst, 'reload schema';

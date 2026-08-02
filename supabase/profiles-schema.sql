-- Paressilk — Müşteri profilleri (iletişim + fatura bilgileri + otomatik müşteri no)
-- Supabase SQL Editor'de BİR KEZ çalıştırın.
-- E-posta anahtarlı (hem Google hem e-posta/şifre kullanıcıları e-postaya çözümlenir).
-- customer_no: sistem tarafından otomatik, sıralı (PRS-M###### olarak gösterilir).

create table if not exists public.profiles (
  email       text primary key,
  customer_no bigint generated always as identity,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Müşteri numarası 1000'den başlasın (daha kurumsal görünür)
alter table public.profiles alter column customer_no restart with 1000;

-- RLS: herkese kapalı, erişim yalnızca SERVICE_KEY kullanan Netlify Functions üzerinden.
alter table public.profiles enable row level security;
grant all on table public.profiles to service_role;

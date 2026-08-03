-- Paressilk — Siparişler (havale/EFT + Stripe ortak)
-- Supabase SQL Editor'de BİR KEZ çalıştırın.
-- Erişim yalnızca SERVICE_KEY kullanan Netlify Functions üzerinden (place-bank-order,
-- reveal-bank-info, list-orders, list-my-orders, confirm-payment, stripe-webhook).

create table if not exists public.orders (
  stripe_session_id text primary key,          -- sipariş numarası (havalede PS-XXXX, Stripe'ta session id)
  email             text,
  customer_name     text,
  amount_total      bigint,                     -- KURUŞ cinsinden toplam
  currency          text default 'try',
  payment_status    text,                       -- awaiting_bank_transfer | paid ...
  status            text,                       -- awaiting_payment | processing | shipped ...
  items             jsonb not null default '[]'::jsonb,
  shipping_address  jsonb not null default '{}'::jsonb,  -- accessCode burada tutulur (asla client'a dönmez)
  billing           jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists orders_email_idx      on public.orders (email);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- RLS: herkese kapalı, erişim yalnızca service_role (Netlify Functions).
alter table public.orders enable row level security;
grant all on table public.orders to service_role;

-- PostgREST şema önbelleğini hemen yenile (yoksa PGRST205 hatası birkaç dakika sürebilir).
notify pgrst, 'reload schema';

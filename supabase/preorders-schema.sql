-- Paressilk — Ön sipariş talepleri (stokta olmayan ürünler için, para alınmaz).
-- Supabase SQL Editor'de BİR KEZ çalıştırın. save-preorder.js buraya upsert eder
-- (onConflict: product_id,email → aynı müşteri aynı ürüne bir kez).

create table if not exists public.preorders (
  id             bigint generated always as identity primary key,
  preorder_number text,
  product_id     text not null,
  product_name   text,
  product_sku    text,
  customer_name  text,
  email          text not null,
  phone          text,
  address        text,
  note           text,
  notified       boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (product_id, email)
);

create index if not exists preorders_created_at_idx on public.preorders (created_at desc);

alter table public.preorders enable row level security;
grant all on table public.preorders to service_role;

notify pgrst, 'reload schema';

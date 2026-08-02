-- Paressilk — Ürün kataloğu Supabase şeması
-- Supabase Dashboard → SQL Editor'de BİR KEZ çalıştırın.
-- Mimari: ürünün tamamı `data` (jsonb) içinde tutulur (frontend ile birebir
-- aynı şekil); id/category/active/featured/sort_order sorgulama için ayrı kolon.
-- Böylece ileride ürüne yeni alan eklerken şema değiştirmek gerekmez.

create table if not exists public.products (
  id          text primary key,
  data        jsonb not null,
  category    text,
  active      boolean not null default true,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx on public.products (sort_order);

-- RLS: herkese kapalı. Tüm erişim SERVICE_KEY kullanan Netlify Functions üzerinden.
alter table public.products enable row level security;
-- (Politika eklenmiyor → anon/authenticated doğrudan erişemez; service key RLS'i baypas eder.)

-- ============================================================
-- STORAGE: ürün görselleri için herkese-açık-okuma bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

// Ürün backend'i için ortak yardımcılar: CORS başlıkları, admin JWT doğrulama,
// Supabase service-client. Tüm ürün fonksiyonları bunu kullanır.

const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://paressilk.com',
  'https://paressilk.netlify.app',
  'http://localhost:5173',
];

function getHeaders(event, methods = 'GET, POST, OPTIONS') {
  const origin = event.headers?.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function verifyAdmin(event) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) return { ok: false, code: 500, msg: 'Sunucu yapılandırma hatası' };
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { ok: false, code: 401, msg: 'Yetkisiz' };
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'admin') return { ok: false, code: 403, msg: 'Yetkisiz' };
    return { ok: true };
  } catch {
    return { ok: false, code: 401, msg: 'Geçersiz oturum' };
  }
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// DB satırı -> frontend ürün objesi. Kolonlardaki active/featured, data içine
// yazılır (tek doğruluk kaynağı frontend için data objesi).
function rowToProduct(row) {
  const p = row.data || {};
  return { ...p, id: row.id, active: row.active, featured: row.featured };
}

// Frontend ürün objesi -> DB satırı (upsert için).
function productToRow(product, index) {
  const id = product.id || `product-${Date.now()}`;
  const data = { ...product, id };
  const row = {
    id,
    data,
    category: product.category || null,
    active: product.active !== false,
    featured: !!product.featured,
    updated_at: new Date().toISOString(),
  };
  if (typeof index === 'number') row.sort_order = index;
  return row;
}

module.exports = { getHeaders, verifyAdmin, getSupabase, rowToProduct, productToRow, ALLOWED_ORIGINS };

// Ön sipariş / talep toplama — "Stok Gelince Haber Ver".
// Para ALINMAZ; yalnızca ürün stoğa girince bilgilendirmek için iletişim toplar.
// Hangi ürüne ne kadar talep olduğu admin panelinde görülür (üretim kararı için).
// KVKK: açık rıza zorunlu; veriler yalnızca stok bildirimi için kullanılır.

const { createClient } = require('@supabase/supabase-js');
const PRODUCTS = require('../../src/data/products.json');

const PRODUCT_IDS = new Set(PRODUCTS.map(p => String(p.id)));

const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://paressilk.com',
  'https://paressilk.netlify.app',
];

function getHeaders(event) {
  const origin = event.headers?.origin || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function normalizePhoneTR(phone) {
  if (!phone) return null;
  let p = String(phone).replace(/\D/g, '');
  if (p.startsWith('90')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return /^5\d{9}$/.test(p) ? `0${p}` : null;
}

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { productId, email, phone, consent } = JSON.parse(event.body || '{}');

    if (!PRODUCT_IDS.has(String(productId))) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz ürün' }) };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi giriniz' }) };
    }
    if (!consent) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bilgilendirme için onay vermelisiniz' }) };
    }
    const normPhone = phone ? normalizePhoneTR(phone) : null;
    if (phone && !normPhone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir telefon numarası giriniz (05XX...)' }) };
    }

    const product = PRODUCTS.find(p => String(p.id) === String(productId));
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Aynı e-posta + ürün için tekrarları önle (upsert)
    const { error } = await supabase
      .from('preorders')
      .upsert(
        {
          product_id: String(productId),
          product_name: product?.name || null,
          product_sku: product?.sku || null,
          email: String(email).toLowerCase().trim(),
          phone: normPhone,
          notified: false,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'product_id,email' }
      );

    if (error) {
      console.error('preorder upsert error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Kayıt yapılamadı. Lütfen tekrar deneyin.' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, message: 'Talebiniz alındı. Ürün stoğa girince size haber vereceğiz.' }),
    };
  } catch (err) {
    console.error('save-preorder error:', err.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

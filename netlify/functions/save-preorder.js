// Ön sipariş — stokta olmayan ürünler için talep + iletişim/teslimat bilgisi.
// PARA ALINMAZ. Ad/soyad/telefon/e-posta/adres alınır, Supabase'e kaydedilir,
// "Ön siparişiniz onaylandı" e-postası + SMS gönderilir. Ürün stoğa girince
// admin bu listedeki müşterilere öncelik verir. KVKK: açık rıza zorunlu.

const { createClient } = require('@supabase/supabase-js');
const { sendPreorderEmail, sendPreorderSms } = require('../lib/notify.cjs');
const { loadProducts } = require('../lib/product-store.cjs');

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

// Spam koruması: IP başına dakikada 5, günde 30
const RATE_WINDOW_MS = 60 * 1000, RATE_MAX = 5, DAY_MS = 86400000, DAY_MAX = 30;
const hits = new Map();
function checkRate(ip) {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h) { h = { w: now, c: 0, d: now, dc: 0 }; hits.set(ip, h); }
  if (now - h.w > RATE_WINDOW_MS) { h.w = now; h.c = 0; }
  if (now - h.d > DAY_MS) { h.d = now; h.dc = 0; }
  h.c++; h.dc++;
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.d > DAY_MS) hits.delete(k);
  return h.c <= RATE_MAX && h.dc <= DAY_MAX;
}

function normalizePhoneTR(phone) {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('90')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return /^5\d{9}$/.test(p) ? `0${p}` : null;
}

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));

// Rastgele/bot ismi tespiti: aşırı uzun tek kelime ya da çok düşük sesli harf oranı
function looksLikeGibberish(s) {
  const t = String(s || '').trim();
  if (!t) return false;
  if (t.split(/\s+/).some(w => w.length > 18)) return true;
  const letters = t.replace(/[^A-Za-zçğıöşüÇĞİÖŞÜ]/g, '');
  if (letters.length >= 8) {
    const vowels = (letters.match(/[aeıioöuüAEIİOÖUÜ]/g) || []).length;
    if (vowels / letters.length < 0.18) return true;
  }
  return false;
}

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const ip = event.headers['x-nf-client-connection-ip']
    || event.headers['client-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!checkRate(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Çok fazla istek. Lütfen biraz sonra tekrar deneyin.' }) };
  }

  try {
    const { productId, firstName, lastName, email, phone, address, note, kvkkConsent, website, elapsedMs } = JSON.parse(event.body || '{}');

    // --- BOT KORUMASI ---
    // Bota "başarılı" görünen sahte yanıt (tekrar denemesin), ama KAYDETME.
    const fakeOk = () => ({ statusCode: 200, headers, body: JSON.stringify({ preorderNumber: `POS-${Date.now().toString(36).toUpperCase()}`, emailSent: false, smsSent: false }) });
    // 1) Honeypot dolduysa → bot
    if (website && String(website).trim() !== '') return fakeOk();
    // 2) Form çok hızlı gönderildiyse (< 2.5 sn) → bot
    if (typeof elapsedMs === 'number' && elapsedMs >= 0 && elapsedMs < 2500) return fakeOk();
    // 3) Ad/soyad rastgele dizi (gibberish) ise → reddet
    if (looksLikeGibberish(firstName) || looksLikeGibberish(lastName)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir ad soyad giriniz' }) };
    }

    const products = await loadProducts();
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz ürün' }) };
    }
    if (!firstName || !lastName || String(firstName).trim().length < 2 || String(lastName).trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ad ve soyad gerekli' }) };
    }
    if (!validEmail(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi gerekli' }) };
    }
    const normPhone = normalizePhoneTR(phone);
    if (!normPhone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir telefon numarası gerekli (05XX XXX XX XX)' }) };
    }
    if (!address || String(address).trim().length < 10) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Teslimat adresi gerekli' }) };
    }
    if (!kvkkConsent) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Devam etmek için KVKK onayı gereklidir' }) };
    }

    const customerName = `${String(firstName).trim()} ${String(lastName).trim()}`;
    const preorderNumber = `POS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    // Aynı e-posta + ürün için tekrarı önle (upsert), bilgileri güncelle
    const { error } = await supabase.from('preorders').upsert(
      {
        preorder_number: preorderNumber,
        product_id: String(productId),
        product_name: product.name,
        product_sku: product.sku || null,
        customer_name: customerName,
        email: String(email).toLowerCase().trim(),
        phone: normPhone,
        address: String(address).trim().slice(0, 500),
        note: String(note || '').slice(0, 500),
        notified: false,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'product_id,email' }
    );
    if (error) {
      console.error('preorder upsert error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Ön sipariş kaydedilemedi. Lütfen tekrar deneyin.' }) };
    }

    // Onay bildirimleri (başarısız olsa da kayıt geçerli)
    const shippingInfo = { name: customerName, phone: normPhone, address: String(address).trim() };
    const [emailRes, smsRes] = await Promise.all([
      sendPreorderEmail({ preorderNumber, customerName, customerEmail: email, productName: product.name, sku: product.sku, shippingInfo }),
      sendPreorderSms({ phone: normPhone, customerName, productName: product.name, preorderNumber }),
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ preorderNumber, emailSent: emailRes.sent, smsSent: smsRes.sent }),
    };
  } catch (err) {
    console.error('save-preorder error:', err.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

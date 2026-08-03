// Havale banka bilgisini AÇAR — yalnızca doğru sipariş no + kod ile.
// Müşterinin e-postasına giden 6 haneli kod doğrulanır; eşleşirse IBAN döner.
// Böylece IBAN rastgele ziyaretçiye/bota gösterilmez.

const { createClient } = require('@supabase/supabase-js');
const { BANK_INFO } = require('../lib/bank.cjs');

const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://paressilk.com',
  'https://paressilk.netlify.app',
  'http://localhost:5173',
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

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { orderNumber, code } = JSON.parse(event.body || '{}');
    const on = String(orderNumber || '').trim().toUpperCase();
    const cd = String(code || '').replace(/\D/g, '');
    if (!on || cd.length !== 6) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sipariş numarası ve 6 haneli kod gereklidir.' }) };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    const { data: rows, error } = await supabase
      .from('orders')
      .select('stripe_session_id, amount_total, currency, status, shipping_address')
      .eq('stripe_session_id', on)
      .limit(1);

    if (error) {
      console.error('reveal-bank-info db error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu. Lütfen tekrar deneyin.' }) };
    }
    const data = Array.isArray(rows) ? rows[0] : null;
    if (!data) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Sipariş bulunamadı. Numarayı kontrol edin.' }) };
    }

    // Kaba kuvvet koruması: 5 yanlış denemede 10 dk kilit (sayaç sipariş kaydında tutulur).
    const MAX_ATTEMPTS = 5;
    const LOCK_MS = 10 * 60 * 1000;
    const now = Date.now();
    const sa = data.shipping_address || {};
    const lockUntil = Number(sa._revealLockUntil || 0);

    if (lockUntil && now < lockUntil) {
      const mins = Math.ceil((lockUntil - now) / 60000);
      return { statusCode: 429, headers, body: JSON.stringify({ error: `Çok fazla hatalı deneme. Lütfen ${mins} dakika sonra tekrar deneyin.` }) };
    }

    const stored = String(sa.accessCode || '');
    if (!stored || stored !== cd) {
      const attempts = Number(sa._revealAttempts || 0) + 1;
      const patch = { ...sa };
      let locked = false;
      if (attempts >= MAX_ATTEMPTS) {
        patch._revealAttempts = 0;
        patch._revealLockUntil = now + LOCK_MS;
        locked = true;
      } else {
        patch._revealAttempts = attempts;
      }
      await supabase.from('orders').update({ shipping_address: patch }).eq('stripe_session_id', on);
      if (locked) {
        return { statusCode: 429, headers, body: JSON.stringify({ error: 'Çok fazla hatalı deneme. Güvenlik için 10 dakika kilitlendi.' }) };
      }
      return { statusCode: 401, headers, body: JSON.stringify({ error: `Kod hatalı. Kalan deneme hakkınız: ${MAX_ATTEMPTS - attempts}.` }) };
    }

    // Doğru kod → deneme sayacını sıfırla (varsa)
    if (sa._revealAttempts || sa._revealLockUntil) {
      const clean = { ...sa };
      delete clean._revealAttempts;
      delete clean._revealLockUntil;
      await supabase.from('orders').update({ shipping_address: clean }).eq('stripe_session_id', on);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        orderNumber: data.stripe_session_id,
        amount: (data.amount_total || 0) / 100,
        currency: data.currency || 'try',
        status: data.status,
        bank: BANK_INFO,
        reference: data.stripe_session_id, // havale açıklamasına yazılacak
      }),
    };
  } catch (err) {
    console.error('reveal-bank-info error:', err.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'İşlem başarısız.' }) };
  }
};

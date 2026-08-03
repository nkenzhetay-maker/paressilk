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
      // GEÇİCİ TEŞHİS: gerçek Postgres hatasını yüzeye çıkar (sonra kaldırılacak)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu. Lütfen tekrar deneyin.', _debug: { message: error.message, code: error.code, details: error.details, hint: error.hint } }) };
    }
    const data = Array.isArray(rows) ? rows[0] : null;
    if (!data) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Sipariş bulunamadı. Numarayı kontrol edin.' }) };
    }

    const stored = String(data.shipping_address?.accessCode || '');
    if (!stored || stored !== cd) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Kod hatalı. E-postanıza gönderilen kodu girin.' }) };
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

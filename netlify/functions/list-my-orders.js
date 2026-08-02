// Giriş yapmış müşterinin KENDİ siparişlerini döndürür.
// Güvenlik: token doğrulanır (Supabase oturumu VEYA e-posta/şifre JWT'si),
// e-posta token'dan alınır — kimse başkasının siparişlerini isteyemez.

const { createClient } = require('@supabase/supabase-js');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Token'dan doğrulanmış e-posta çıkar: önce Supabase oturumu, sonra kendi JWT'miz.
async function resolveEmail(token, supabase) {
  if (!token) return null;
  // 1) Supabase oturum token'ı (Google / Supabase email-password)
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user?.email) return data.user.email.toLowerCase();
  } catch { /* dene: kendi JWT */ }
  // 2) Kendi auth-login JWT'miz
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    if (secret && secret.length >= 16) {
      const payload = jwt.verify(token, secret);
      if (payload?.email) return String(payload.email).toLowerCase();
    }
  } catch { /* geçersiz */ }
  return null;
}

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Yapılandırma eksik' }) };
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const email = await resolveEmail(token, supabase);
  if (!email) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Oturum doğrulanamadı' }) };

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('stripe_session_id, amount_total, currency, payment_status, status, items, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('list-my-orders error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Siparişler alınamadı' }) };
    }

    const orders = (data || []).map(o => ({
      orderNumber: o.stripe_session_id,
      total: (o.amount_total || 0) / 100,
      currency: o.currency || 'try',
      paymentStatus: o.payment_status,
      status: o.status,
      items: o.items || [],
      createdAt: o.created_at,
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ email, orders }) };
  } catch (err) {
    console.error('list-my-orders exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

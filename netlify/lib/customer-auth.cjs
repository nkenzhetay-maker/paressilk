// Müşteri (storefront) token doğrulama — Supabase oturumu VEYA e-posta/şifre JWT.
// Doğrulanmış e-postayı döndürür; kimse başkasının verisine erişemez.

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

function bearer(event) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

async function resolveEmail(token, supabase) {
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user?.email) return data.user.email.toLowerCase();
  } catch { /* dene: kendi JWT */ }
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

function formatCustomerNo(n) {
  return 'PRS-M' + String(n).padStart(6, '0');
}

module.exports = { getHeaders, bearer, resolveEmail, formatCustomerNo };

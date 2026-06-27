const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { email, items } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi gereklidir' }) };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sepet boş olamaz' }) };
    }

    const { error } = await supabase
      .from('abandoned_carts')
      .upsert(
        {
          email,
          items,
          reminder_sent: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Supabase upsert error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sepet kaydedilemedi' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Sepet kaydedildi' }),
    };
  } catch (error) {
    console.error('Save cart error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu' }) };
  }
};

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const ALLOWED_ORIGINS = [
  process.env.URL || 'https://paressilk.com',
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'E-posta ve şifre gereklidir' }) };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'E-posta veya şifre hatalı' }) };
    }

    const user = data.user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          emailVerified: user.email_confirmed_at !== null,
        },
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Giriş yapılamadı' }) };
  }
};

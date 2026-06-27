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
    const { email, password, firstName, lastName, phone, address, city, district, postalCode } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi girin' }) };
    }
    if (!password || password.length < 6) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Şifre en az 6 karakter olmalıdır' }) };
    }
    if (!firstName || firstName.trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ad alanı gereklidir' }) };
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName.trim(),
        last_name: (lastName || '').trim(),
        phone: (phone || '').trim(),
        address: (address || '').trim(),
        city: (city || '').trim(),
        district: (district || '').trim(),
        postal_code: (postalCode || '').trim(),
      },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'Bu e-posta adresi zaten kayıtlı' }) };
      }
      console.error('Register error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Kayıt oluşturulamadı' }) };
    }

    const { error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: `${process.env.SITE_URL || 'https://paressilk.com'}/email-verify`,
      },
    });

    if (linkError) {
      console.error('Email link error:', linkError);
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.',
        userId: data.user.id,
      }),
    };
  } catch (error) {
    console.error('Register error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu' }) };
  }
};

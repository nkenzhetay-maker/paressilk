const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://paressilk.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Kullanıcı adı ve şifre gerekli' }) };
    }

    if (username !== 'admin') {
      return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Geçersiz kullanıcı bilgileri' }) };
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!storedHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set');
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Sunucu yapılandırma hatası' }) };
    }

    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, storedHash);

    if (!valid) {
      return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Geçersiz kullanıcı bilgileri' }) };
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 16) {
      console.error('JWT_SECRET environment variable not set or too short');
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Sunucu yapılandırma hatası' }) };
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { role: 'admin', iat: Math.floor(Date.now() / 1000) },
      jwtSecret,
      { expiresIn: '4h' }
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error('Admin login error:', err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Giriş işlemi başarısız' }) };
  }
};

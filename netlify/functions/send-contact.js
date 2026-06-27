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
    const { name, email, phone, subject, message } = JSON.parse(event.body);

    if (!name || name.trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ad Soyad gereklidir' }) };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi girin' }) };
    }
    if (!message || message.trim().length < 10) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mesajınız en az 10 karakter olmalıdır' }) };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Paressilk İletişim <onboarding@resend.dev>',
        to: ['info@paressilk.com'],
        reply_to: email,
        subject: `İletişim Formu: ${subject || 'Genel Bilgi'} - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #B8860B; border-bottom: 2px solid #B8860B; padding-bottom: 10px;">Yeni İletişim Formu Mesajı</h2>
            <p><strong>Ad Soyad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
            <p><strong>Konu:</strong> ${subject || 'Genel Bilgi'}</p>
            <hr style="border: 1px solid #eee;" />
            <p><strong>Mesaj:</strong></p>
            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error('Resend error:', await res.text());
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Mesaj gönderilemedi' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Mesajınız başarıyla gönderildi' }),
    };
  } catch (error) {
    console.error('Contact error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu' }) };
  }
};

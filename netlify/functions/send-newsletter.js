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
    const { email } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi girin' }) };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Bu e-posta adresi zaten kayıtlı' }) };
    }

    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail, subscribed_at: new Date().toISOString() });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Kayıt oluşturulamadı' }) };
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Paressilk <onboarding@resend.dev>',
        to: [normalizedEmail],
        subject: 'Paressilk Bültene Hoş Geldiniz!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 30px; background: #0A0A0A;">
              <h1 style="color: #B8860B; font-size: 28px; margin: 0;">PARESSILK</h1>
              <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 5px;">%100 EL YAPIMI DOĞAL İPEK</p>
            </div>
            <div style="padding: 30px; background: #fff;">
              <h2 style="color: #1a1a1a;">Bültene Hoş Geldiniz!</h2>
              <p style="color: #555; line-height: 1.8;">
                Paressilk bültenine kaydınız başarıyla alınmıştır. Yeni koleksiyonlar, özel indirimler ve kampanyalardan ilk siz haberdar olacaksınız.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.SITE_URL || 'https://paressilk.com'}/shop" style="display: inline-block; padding: 14px 32px; background: #B8860B; color: white; text-decoration: none; font-size: 13px; letter-spacing: 1px;">KOLEKSİYONU KEŞFET</a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #888; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Paressilk. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `,
      }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Bültene başarıyla kaydoldunuz!' }),
    };
  } catch (error) {
    console.error('Newsletter error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Bir hata oluştu' }) };
  }
};

// Admin — bir müşteriye info@paressilk.com adresinden e-posta gönderir (Resend). JWT (admin) zorunlu.
// Genel amaçlı: ön sipariş "stoğa girdi" bildirimi, müşteri dönüşü vb.
// Body: { to, name?, subject, message }
const { getHeaders, verifyAdmin } = require('../lib/product-store.cjs');

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

exports.handler = async (event) => {
  const headers = getHeaders(event, 'POST, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = verifyAdmin(event);
  if (!auth.ok) return { statusCode: auth.code, headers, body: JSON.stringify({ error: auth.msg }) };

  try {
    const { to, name, subject, message } = JSON.parse(event.body || '{}');
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir alıcı e-postası gerekli' }) };
    }
    if (!subject || String(subject).trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Konu gerekli' }) };
    }
    if (!message || String(message).trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mesaj gerekli' }) };
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'E-posta yapılandırılmamış' }) };

    const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif;color:#222;">
      <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
        <div style="text-align:center;padding:14px 0;">
          <span style="font-size:22px;letter-spacing:2px;color:#B8860B;font-weight:bold;">PARESSILK</span>
        </div>
        <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;">
          ${name ? `<p style="margin:0 0 14px;">Merhaba <b>${esc(name)}</b>,</p>` : ''}
          <div style="white-space:pre-wrap;line-height:1.7;color:#333;">${esc(String(message).trim())}</div>
        </div>
        <div style="text-align:center;font-size:11px;color:#999;padding:16px 0;">Paressilk · paressilk.com · info@paressilk.com</div>
      </div></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'Paressilk <info@paressilk.com>',
        to: [to],
        reply_to: 'info@paressilk.com',
        subject: String(subject).trim().slice(0, 200),
        html,
      }),
    });
    if (!res.ok) {
      console.error('send-customer-email resend error', res.status, (await res.text().catch(() => '')).slice(0, 150));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'E-posta gönderilemedi' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('send-customer-email error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Gönderilemedi' }) };
  }
};

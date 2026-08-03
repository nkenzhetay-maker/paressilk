// Admin — bir iletişim mesajına info@paressilk.com adresinden cevap gönderir (Resend). JWT (admin) zorunlu.
// Body: { id, reply }. Cevap müşteriye e-posta olarak gider; mesaj "replied" olarak işaretlenir.
const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');

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

  const supabase = getSupabase();
  if (!supabase) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Veritabanı yapılandırılmamış' }) };

  try {
    const { id, reply } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mesaj id gerekli' }) };
    if (!reply || String(reply).trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cevap metni gerekli' }) };
    }

    // Mesajı bul (alıcı e-posta + konu)
    const { data: msg, error: findErr } = await supabase
      .from('messages')
      .select('id, name, email, subject, message')
      .eq('id', id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!msg) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Mesaj bulunamadı' }) };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email || '')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Müşteri e-postası geçersiz' }) };
    }

    const replyText = String(reply).trim();
    const key = process.env.RESEND_API_KEY;
    if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'E-posta yapılandırılmamış' }) };

    const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#f5f2ec;font-family:Arial,Helvetica,sans-serif;color:#222;">
      <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
        <div style="text-align:center;padding:14px 0;">
          <span style="font-size:22px;letter-spacing:2px;color:#B8860B;font-weight:bold;">PARESSILK</span>
        </div>
        <div style="background:#fff;border:1px solid #e8e2d5;border-radius:8px;padding:24px;">
          <p style="margin:0 0 14px;">Merhaba <b>${esc(msg.name || '')}</b>,</p>
          <div style="white-space:pre-wrap;line-height:1.7;color:#333;">${esc(replyText)}</div>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="font-size:12px;color:#888;margin:0;">Bu e-posta, ${esc(msg.subject || 'iletişim')} konulu mesajınıza yanıttır.</p>
        </div>
        <div style="text-align:center;font-size:11px;color:#999;padding:16px 0;">Paressilk · paressilk.com · info@paressilk.com</div>
      </div></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: 'Paressilk <info@paressilk.com>',
        to: [msg.email],
        reply_to: 'info@paressilk.com',
        subject: `Re: ${msg.subject || 'Mesajınız'} — Paressilk`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('reply-message resend error', res.status, (await res.text().catch(() => '')).slice(0, 150));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Cevap e-postası gönderilemedi' }) };
    }

    // Mesajı "replied" işaretle
    await supabase.from('messages')
      .update({ status: 'replied', reply: replyText, replied_at: new Date().toISOString() })
      .eq('id', id);

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id, status: 'replied' }) };
  } catch (err) {
    console.error('reply-message error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Cevap gönderilemedi' }) };
  }
};

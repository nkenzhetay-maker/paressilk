// Admin — ürün görselini Supabase Storage'a yükler, herkese-açık URL döner.
// JWT zorunlu. Body: { dataUrl: "data:image/jpeg;base64,...", ext?: "jpg" }
// Görseller admin panelinde zaten 1400px/JPEG'e sıkıştırılıp gönderilir.

const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');

const BUCKET = 'product-images';
const MAX_BYTES = 6 * 1024 * 1024; // güvenlik sınırı

exports.handler = async (event) => {
  const headers = getHeaders(event, 'POST, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = verifyAdmin(event);
  if (!auth.ok) return { statusCode: auth.code, headers, body: JSON.stringify({ error: auth.msg }) };

  const supabase = getSupabase();
  if (!supabase) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Depolama yapılandırılmamış' }) };

  try {
    const { dataUrl } = JSON.parse(event.body || '{}');
    const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || '');
    if (!m) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz görsel' }) };

    const mime = m[1];
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > MAX_BYTES) {
      return { statusCode: 413, headers, body: JSON.stringify({ error: 'Görsel çok büyük' }) };
    }
    const ext = mime.split('/')[1].replace('jpeg', 'jpg');
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(name, buffer, {
      contentType: mime,
      cacheControl: '31536000',
      upsert: false,
    });
    if (upErr) {
      console.error('upload-product-image error:', upErr.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Yüklenemedi' }) };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
    return { statusCode: 200, headers, body: JSON.stringify({ url: data.publicUrl }) };
  } catch (err) {
    console.error('upload-product-image exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

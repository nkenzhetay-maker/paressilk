// Admin — ürün sil. JWT zorunlu. Body: { id }
const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');

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
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id gerekli' }) };

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('delete-product error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Silinemedi' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('delete-product exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

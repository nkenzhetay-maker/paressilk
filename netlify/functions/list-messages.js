// Admin — iletişim formu mesajlarını listeler. JWT (admin) zorunlu.
const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');

exports.handler = async (event) => {
  const headers = getHeaders(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = verifyAdmin(event);
  if (!auth.ok) return { statusCode: auth.code, headers, body: JSON.stringify({ error: auth.msg }) };

  const supabase = getSupabase();
  if (!supabase) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Veritabanı yapılandırılmamış' }) };

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, name, email, phone, subject, message, status, reply, replied_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify({ messages: data || [] }) };
  } catch (err) {
    console.error('list-messages error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Mesajlar alınamadı' }) };
  }
};

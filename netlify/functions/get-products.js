// Public — tüm ürünleri döndürür (vitrin + admin ortak kaynağı).
// Supabase yapılandırılmamış/boşsa 204 döner; frontend products.json'a düşer.

const { getHeaders, getSupabase, rowToProduct } = require('../lib/product-store.cjs');

exports.handler = async (event) => {
  const headers = getHeaders(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const supabase = getSupabase();
  if (!supabase) {
    // Backend hazır değil — frontend yerel products.json ile devam etsin.
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, data, active, featured, sort_order')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('get-products error:', error.message);
      return { statusCode: 204, headers, body: '' }; // fallback
    }
    if (!data || data.length === 0) {
      return { statusCode: 204, headers, body: '' }; // henüz migrasyon yapılmadı
    }

    const products = data.map(rowToProduct);
    // 5 dakika CDN cache; admin değişikliğinden sonra kısa gecikmeyle yansır.
    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'public, max-age=60, s-maxage=60' },
      body: JSON.stringify({ products }),
    };
  } catch (err) {
    console.error('get-products exception:', err.message);
    return { statusCode: 204, headers, body: '' };
  }
};

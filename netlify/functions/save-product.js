// Admin — ürün oluştur/güncelle (upsert). JWT zorunlu.
// Body: { product: {...frontend ürün objesi...} }

const { getHeaders, verifyAdmin, getSupabase, productToRow, rowToProduct } = require('../lib/product-store.cjs');

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
    const { product } = JSON.parse(event.body || '{}');
    if (!product || typeof product !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ürün verisi gerekli' }) };
    }
    if (!product.name || String(product.name).trim().length < 2) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ürün adı gerekli' }) };
    }

    // Yeni ürünse sona ekle (en büyük sort_order + 1)
    let sortOrder = product.sort_order;
    if (typeof sortOrder !== 'number') {
      const { data: maxRow } = await supabase
        .from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
      sortOrder = (maxRow?.sort_order ?? -1) + 1;
    }

    const row = productToRow(product, sortOrder);
    const { data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' })
      .select('id, data, active, featured, sort_order')
      .single();

    if (error) {
      console.error('save-product error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Kaydedilemedi' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ product: rowToProduct(data) }) };
  } catch (err) {
    console.error('save-product exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

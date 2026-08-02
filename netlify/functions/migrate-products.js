// Admin — bir kerelik migrasyon: products.json'daki ürünleri Supabase'e aktarır.
// JWT zorunlu. Zaten var olan id'ler güncellenir (upsert), veri kaybı olmaz.
// Body (opsiyonel): { overwrite: false }  -> false ise mevcut kayıtlar korunur.

const { getHeaders, verifyAdmin, getSupabase, productToRow } = require('../lib/product-store.cjs');
const seed = require('../../src/data/products.json');

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
    const { overwrite } = JSON.parse(event.body || '{}');

    // overwrite=false (varsayılan): yalnızca tabloda OLMAYAN ürünleri ekle.
    let existingIds = new Set();
    if (!overwrite) {
      const { data: existing } = await supabase.from('products').select('id');
      existingIds = new Set((existing || []).map(r => r.id));
    }

    const rows = seed
      .map((p, i) => productToRow(p, i))
      .filter(r => overwrite || !existingIds.has(r.id));

    if (rows.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ inserted: 0, skipped: seed.length, message: 'Aktarılacak yeni ürün yok' }) };
    }

    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('migrate-products error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Migrasyon başarısız: ' + error.message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ inserted: rows.length, total: seed.length }) };
  } catch (err) {
    console.error('migrate-products exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

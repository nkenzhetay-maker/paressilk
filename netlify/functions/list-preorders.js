// Admin — ön sipariş (talep) listesi. Hangi ürüne kaç kişi "haber ver" dedi.
// Üretim/stok kararı için ürün bazında toplanır, talep sayısına göre sıralanır.
// GÜVENLİK: admin JWT zorunlu (Authorization: Bearer <token>) — açık değildir.

const { createClient } = require('@supabase/supabase-js');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function verifyAdmin(event) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) return { ok: false, code: 500, msg: 'Sunucu yapılandırma hatası' };
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { ok: false, code: 401, msg: 'Yetkisiz' };
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'admin') return { ok: false, code: 403, msg: 'Yetkisiz' };
    return { ok: true };
  } catch {
    return { ok: false, code: 401, msg: 'Geçersiz oturum' };
  }
}

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = verifyAdmin(event);
  if (!auth.ok) return { statusCode: auth.code, headers, body: JSON.stringify({ error: auth.msg }) };

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('preorders')
      .select('product_id, product_name, product_sku, preorder_number, customer_name, email, phone, address, note, notified, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('list-preorders error:', error.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Veri alınamadı' }) };
    }

    // Ürün bazında grupla
    const byProduct = new Map();
    for (const r of data || []) {
      const key = r.product_id;
      if (!byProduct.has(key)) {
        byProduct.set(key, {
          productId: r.product_id,
          productName: r.product_name,
          productSku: r.product_sku,
          count: 0,
          notified: 0,
          pending: 0,
          requests: [],
        });
      }
      const g = byProduct.get(key);
      g.count += 1;
      if (r.notified) g.notified += 1; else g.pending += 1;
      g.requests.push({
        preorderNumber: r.preorder_number,
        customerName: r.customer_name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        note: r.note,
        notified: r.notified,
        createdAt: r.created_at,
      });
    }

    const groups = [...byProduct.values()].sort((a, b) => b.count - a.count);
    const totalDemand = data?.length || 0;

    // Bildirim akışı: en yeni ön siparişler (kronolojik, düz liste)
    const recent = (data || []).slice(0, 50).map(r => ({
      preorderNumber: r.preorder_number,
      productId: r.product_id,
      productName: r.product_name,
      productSku: r.product_sku,
      customerName: r.customer_name,
      email: r.email,
      phone: r.phone,
      address: r.address,
      note: r.note,
      notified: r.notified,
      createdAt: r.created_at,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ totalDemand, products: groups, recent }),
    };
  } catch (err) {
    console.error('list-preorders exception:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

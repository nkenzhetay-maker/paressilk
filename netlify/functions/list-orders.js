// Admin — tüm siparişleri listeler. JWT (admin) zorunlu.
// accessCode ASLA döndürülmez; shipping_address/billing ham haliyle dışarı verilmez.

const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');
const { formatCustomerNo } = require('../lib/customer-auth.cjs');

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
    const { data: rows, error } = await supabase
      .from('orders')
      .select('stripe_session_id, email, customer_name, amount_total, currency, payment_status, status, items, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    const orders = rows || [];

    // Müşteri numaralarını toplu çek (N+1'den kaçın).
    const emails = [...new Set(orders.map(o => (o.email || '').toLowerCase()).filter(Boolean))];
    const customerNoByEmail = new Map();
    if (emails.length) {
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('email, customer_no')
        .in('email', emails);
      if (pErr) throw pErr;
      for (const p of profs || []) {
        if (p.email != null && p.customer_no != null) {
          customerNoByEmail.set(String(p.email).toLowerCase(), formatCustomerNo(p.customer_no));
        }
      }
    }

    const result = orders.map(o => ({
      orderNumber: o.stripe_session_id,
      customerNo: customerNoByEmail.get((o.email || '').toLowerCase()) || null,
      customerName: o.customer_name || null,
      email: o.email || null,
      total: typeof o.amount_total === 'number' ? o.amount_total / 100 : 0,
      currency: o.currency || 'try',
      paymentStatus: o.payment_status || null,
      status: o.status || null,
      items: Array.isArray(o.items) ? o.items : [],
      createdAt: o.created_at || null,
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ orders: result }) };
  } catch (err) {
    console.error('list-orders error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Siparişler alınamadı' }) };
  }
};

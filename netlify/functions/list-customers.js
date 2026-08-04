// Admin — müşteri bazlı görünüm: siparişleri e-postaya göre gruplar, profil (müşteri no/telefon) ile birleştirir.
// Sadakat/CRM için: her müşterinin sipariş geçmişi, toplam harcama, son sipariş, iptaller. JWT (admin) zorunlu.
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
    const { data: orders, error } = await supabase
      .from('orders')
      .select('stripe_session_id, email, customer_name, amount_total, currency, payment_status, status, items, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;

    const rows = orders || [];

    // Profil bilgisi (müşteri no + telefon) — tek sorguda çek
    const emails = [...new Set(rows.map(o => (o.email || '').toLowerCase()).filter(Boolean))];
    const profByEmail = new Map();
    if (emails.length) {
      const { data: profs } = await supabase.from('profiles').select('email, customer_no, data').in('email', emails);
      (profs || []).forEach(p => {
        if (p.email) profByEmail.set(String(p.email).toLowerCase(), p);
      });
    }

    // E-postaya göre grupla
    const map = new Map();
    for (const o of rows) {
      const key = (o.email || '').toLowerCase();
      if (!key) continue;
      if (!map.has(key)) {
        const prof = profByEmail.get(key);
        map.set(key, {
          email: o.email,
          customerNo: prof && prof.customer_no != null ? formatCustomerNo(prof.customer_no) : null,
          name: o.customer_name || (prof && prof.data && (prof.data.firstName ? `${prof.data.firstName} ${prof.data.lastName || ''}`.trim() : '')) || '',
          phone: (prof && prof.data && prof.data.phone) || '',
          ordersCount: 0,
          totalPaid: 0,       // ödenmiş siparişlerin toplamı (TL)
          totalAll: 0,        // tüm siparişlerin toplamı (TL)
          paidCount: 0,
          cancelledCount: 0,
          awaitingCount: 0,
          firstOrderAt: o.created_at,
          lastOrderAt: o.created_at,
          orders: [],
        });
      }
      const c = map.get(key);
      const tl = (o.amount_total || 0) / 100;
      c.ordersCount += 1;
      c.totalAll += tl;
      if (o.payment_status === 'paid') { c.totalPaid += tl; c.paidCount += 1; }
      if (o.status === 'cancelled' || o.payment_status === 'cancelled') c.cancelledCount += 1;
      else if (o.payment_status !== 'paid') c.awaitingCount += 1;
      if (new Date(o.created_at) > new Date(c.lastOrderAt)) c.lastOrderAt = o.created_at;
      if (new Date(o.created_at) < new Date(c.firstOrderAt)) c.firstOrderAt = o.created_at;
      if (!c.name && o.customer_name) c.name = o.customer_name;
      c.orders.push({
        orderNumber: o.stripe_session_id,
        total: tl,
        currency: o.currency || 'try',
        status: o.status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
        items: o.items || [],
      });
    }

    const customers = [...map.values()].sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt));
    return { statusCode: 200, headers, body: JSON.stringify({ customers }) };
  } catch (err) {
    console.error('list-customers error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Müşteriler alınamadı' }) };
  }
};

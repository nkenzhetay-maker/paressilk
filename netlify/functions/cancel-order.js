// Admin — havale/EFT siparişini iptal eder + müşteriye bildirim (e-posta/SMS). JWT (admin) zorunlu.
// Body: { orderNumber, reason? }. orders.stripe_session_id = orderNumber.

const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');
const { sendCancelEmail, sendCancelSms } = require('../lib/notify.cjs');

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
    const { orderNumber, reason } = JSON.parse(event.body || '{}');
    if (!orderNumber || typeof orderNumber !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sipariş numarası gerekli' }) };
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'cancelled' })
      .eq('stripe_session_id', orderNumber)
      .select('stripe_session_id, email, customer_name, shipping_address, status, payment_status')
      .maybeSingle();

    if (error) throw error;
    if (!updated) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Sipariş bulunamadı' }) };
    }

    // Müşteriye iptal bildirimi — hata verirse sessiz geç.
    const name = updated.customer_name || updated.shipping_address?.name || '';
    let emailSent = false, smsSent = false;
    try {
      const r = await sendCancelEmail({ customerEmail: updated.email, customerName: name, orderNumber: updated.stripe_session_id, reason });
      emailSent = r.sent;
    } catch (e) { console.error('cancel-order email error:', e.message); }
    try {
      const phone = updated.shipping_address?.phone;
      if (phone) {
        const r = await sendCancelSms({ phone, customerName: name, orderNumber: updated.stripe_session_id });
        smsSent = r.sent;
      }
    } catch (e) { console.error('cancel-order sms error:', e.message); }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        orderNumber: updated.stripe_session_id,
        status: updated.status,
        paymentStatus: updated.payment_status,
        emailSent,
        smsSent,
      }),
    };
  } catch (err) {
    console.error('cancel-order error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sipariş iptal edilemedi' }) };
  }
};

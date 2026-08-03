// Admin — havale/EFT ödemesini manuel onaylar. JWT (admin) zorunlu.
// Body: { orderNumber }. orders.stripe_session_id = orderNumber.

const { getHeaders, verifyAdmin, getSupabase } = require('../lib/product-store.cjs');
const { sendOrderSms, sendOrderEmail } = require('../lib/notify.cjs');

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
    const { orderNumber } = JSON.parse(event.body || '{}');
    if (!orderNumber || typeof orderNumber !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sipariş numarası gerekli' }) };
    }

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing' })
      .eq('stripe_session_id', orderNumber)
      .select('stripe_session_id, email, customer_name, shipping_address, status, payment_status')
      .maybeSingle();

    if (error) throw error;
    if (!updated) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Sipariş bulunamadı' }) };
    }

    // Müşteriye "ödemeniz onaylandı" bildirimi — hata verirse sessiz geç.
    try {
      const phone = updated.shipping_address?.phone;
      const name = updated.customer_name || updated.shipping_address?.name || '';
      if (phone) {
        await sendOrderSms({
          phone,
          customerName: name,
          orderNumber: updated.stripe_session_id,
          // accessCode YOK → "ödeme alındı / hazırlanıyor" mesajı gider.
        });
      }
    } catch (e) {
      console.error('confirm-payment notify (sms) error:', e.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        orderNumber: updated.stripe_session_id,
        status: updated.status,
        paymentStatus: updated.payment_status,
      }),
    };
  } catch (err) {
    console.error('confirm-payment error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Ödeme onaylanamadı' }) };
  }
};

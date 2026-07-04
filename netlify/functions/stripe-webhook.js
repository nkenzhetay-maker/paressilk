// Stripe webhook — ödeme onayının OTORİTE kaynağı.
// Client'ın success sayfasına gitmesi sipariş kaydı için yeterli değildir;
// gerçek sipariş yalnızca Stripe'ın imzalı `checkout.session.completed`
// olayıyla oluşturulur. İmza doğrulanmadan hiçbir veri işlenmez.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Sunucu yapılandırma hatası' }) };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!sig) {
    return { statusCode: 400, body: JSON.stringify({ error: 'İmza eksik' }) };
  }

  // İmza doğrulaması HAM gövde ister; Netlify base64 encode edebilir.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz imza' }) };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      // Yalnızca gerçekten ödenmiş oturumları işle
      if (session.payment_status !== 'paid') {
        return { statusCode: 200, body: JSON.stringify({ received: true, skipped: 'unpaid' }) };
      }

      // Sipariş kalemlerini Stripe'tan otoriter olarak çek (client'a güvenilmez)
      let lineItems = [];
      try {
        const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        lineItems = (li.data || []).map(item => ({
          name: item.description,
          quantity: item.quantity,
          amount_total: item.amount_total,
          currency: item.currency,
        }));
      } catch (e) {
        console.error('listLineItems error:', e.message);
      }

      let shippingAddress = {};
      try {
        shippingAddress = session.metadata?.shippingAddress
          ? JSON.parse(session.metadata.shippingAddress)
          : {};
      } catch { /* yut */ }

      // Idempotent: aynı session için webhook tekrar gelirse çift kayıt olmaz
      const { error: upsertError } = await supabase
        .from('orders')
        .upsert(
          {
            stripe_session_id: session.id,
            payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            email: session.customer_details?.email || session.customer_email || null,
            customer_name: session.customer_details?.name || null,
            amount_total: session.amount_total,
            currency: session.currency,
            payment_status: session.payment_status,
            status: 'paid',
            items: lineItems,
            shipping_address: shippingAddress,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_session_id' }
        );

      if (upsertError) {
        console.error('Order upsert error:', upsertError.message);
        // Stripe'ın tekrar denemesi için 500 dön
        return { statusCode: 500, body: JSON.stringify({ error: 'Sipariş kaydedilemedi' }) };
      }

      // Terk edilmiş sepeti temizle (varsa)
      const email = session.customer_details?.email || session.customer_email;
      if (email) {
        await supabase.from('abandoned_carts').delete().eq('email', email).then(
          () => {},
          (e) => console.error('cart clear error:', e?.message)
        );
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'İşlem başarısız' }) };
  }
};

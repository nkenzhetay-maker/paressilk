// Havale/EFT siparişi — sunucu tarafında kayıt + bildirim.
// Önceden havale siparişi yalnızca client'ta Date.now() ile "oluşuyordu";
// artık: fiyatlar sunucudan doğrulanır, Supabase'e kaydedilir,
// e-posta (dekont) + SMS gönderilir. Fatura bilgileri (TC / kurumsal) doğrulanır.

const { createClient } = require('@supabase/supabase-js');
const PRODUCTS = require('../../src/data/products.json');
const { applyPromo } = require('../lib/promos.cjs');
const { sendOrderEmail, sendOrderSms } = require('../lib/notify.cjs');
const { validateBilling, normalizeBilling } = require('../lib/billing.cjs');
const { generateAccessCode } = require('../lib/bank.cjs');

const PRICE_BY_ID = new Map(PRODUCTS.map(p => [String(p.id), Number(p.price)]));

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

exports.handler = async (event) => {
  const headers = getHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items, customerEmail, shippingInfo, billing, promoCode, note } = JSON.parse(event.body || '{}');

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz sepet' }) };
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta gerekli' }) };
    }
    if (!shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Teslimat bilgileri eksik' }) };
    }
    const billingError = validateBilling(billing);
    if (billingError) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: billingError }) };
    }

    // Fiyat otoritesi sunucu
    const orderItems = items.map(it => {
      const price = PRICE_BY_ID.get(String(it.id));
      if (price == null) throw new Error('Geçersiz ürün');
      const qty = Math.max(1, Math.min(99, Math.round(Number(it.qty) || 1)));
      return { id: String(it.id), name: String(it.name || '').slice(0, 200), price, qty };
    });
    const subtotal = orderItems.reduce((s, it) => s + it.price * it.qty, 0);
    const { promo, discountTL, freeShipping } = applyPromo(promoCode, subtotal);
    const shippingTL = freeShipping || (subtotal - discountTL) >= 6500 ? 0 : 300;
    const grandTotal = Math.round((subtotal - discountTL + shippingTL) * 100) / 100;

    const orderNumber = `PS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    // Havale erişim kodu: müşterinin e-posta/SMS'ine gider; bu kodu giren müşteriye IBAN gösterilir.
    const accessCode = generateAccessCode();

    // Supabase kaydı (havale bekleniyor durumunda)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from('orders').insert({
      stripe_session_id: orderNumber, // benzersiz kolon; havalede sipariş no kullanılır
      email: customerEmail,
      customer_name: shippingInfo.name,
      amount_total: Math.round(grandTotal * 100),
      currency: 'try',
      payment_status: 'awaiting_bank_transfer',
      status: 'awaiting_payment',
      items: orderItems,
      shipping_address: { ...shippingInfo, note: String(note || '').slice(0, 500), accessCode },
      billing: normalizeBilling(billing),
      created_at: new Date().toISOString(),
    });
    if (dbError) {
      console.error('bank order insert error:', dbError.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sipariş kaydedilemedi. Lütfen tekrar deneyin.' }) };
    }

    // Bildirimler (başarısız olsa da sipariş kaydı geçerli)
    const orderPayload = {
      orderNumber,
      customerName: shippingInfo.name,
      customerEmail,
      paymentLabel: 'Havale / EFT',
      accessCode,      // e-postada "ödeme kodu" olarak gösterilir
      items: orderItems,
      subtotal,
      discountTL,
      promoLabel: promo?.label || null,
      shippingTL,
      grandTotal,
      shippingInfo,
      billing,
    };
    const [emailRes, smsRes] = await Promise.all([
      sendOrderEmail(orderPayload),
      sendOrderSms({ phone: shippingInfo.phone, customerName: shippingInfo.name, orderNumber, accessCode }),
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        orderNumber,
        grandTotal,
        emailSent: emailRes.sent,
        smsSent: smsRes.sent,
      }),
    };
  } catch (err) {
    console.error('place-bank-order error:', err.message);
    const msg = err.message === 'Geçersiz ürün' ? 'Sepette geçersiz ürün var' : 'Sipariş oluşturulamadı';
    return { statusCode: 400, headers, body: JSON.stringify({ error: msg }) };
  }
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PRODUCTS = require('../../src/data/products.json');
const { applyPromo } = require('../lib/promos.cjs');
const { validateBilling, normalizeBilling } = require('../lib/billing.cjs');

// id -> gerçek fiyat eşlemesi (sunucu tarafı doğrulama için)
const PRICE_BY_ID = new Map(PRODUCTS.map(p => [String(p.id), Number(p.price)]));

const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://paressilk.com',
  'https://paressilk.netlify.app',
];

function getHeaders(event) {
  const origin = event.headers?.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  const headers = getHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items, customerEmail, shippingAddress, billing, promoCode } = JSON.parse(event.body);

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sepet boş' }) };
    }

    if (!customerEmail || !validateEmail(customerEmail)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçerli bir e-posta adresi gerekli' }) };
    }

    if (items.length > 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Çok fazla ürün' }) };
    }

    // Fatura bilgisi zorunlu: bireysel -> TC, kurumsal -> vergi bilgileri
    const billingError = validateBilling(billing);
    if (billingError) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: billingError }) };
    }
    const normalizedBilling = normalizeBilling(billing);

    const lineItems = items.map(item => {
      const productId = String(item.id);
      // Fiyat OTORİTESİ sunucudur: client'tan gelen item.price'a asla güvenilmez.
      const authoritativePrice = PRICE_BY_ID.get(productId);
      if (authoritativePrice == null) {
        throw new Error('Geçersiz ürün');
      }
      const price = Math.round(authoritativePrice * 100);
      const qty = Math.max(1, Math.min(99, Math.round(Number(item.qty))));

      if (!price || price < 100 || price > 10000000) {
        throw new Error('Geçersiz fiyat');
      }

      return {
        price_data: {
          currency: 'try',
          product_data: {
            name: String(item.name).slice(0, 200),
            images: item.images?.[0] ? [`https://paressilk.com${item.images[0]}`] : [],
            metadata: { productId: productId.slice(0, 50) },
          },
          unit_amount: price,
        },
        quantity: qty,
        _serverPrice: authoritativePrice,
        _qty: qty,
      };
    });

    // Toplam da sunucu fiyatlarından hesaplanır (kargo eşiği manipülasyonunu önler)
    const totalAmount = lineItems.reduce((sum, li) => sum + li._serverPrice * li._qty, 0);
    // Stripe'a giderken iç alanları temizle
    lineItems.forEach(li => { delete li._serverPrice; delete li._qty; });

    // Promosyon/hediye çeki SUNUCUDA doğrulanıp uygulanır (client indirimine güvenilmez)
    const { promo, discountTL, freeShipping } = applyPromo(promoCode, totalAmount);

    const shippingCost = freeShipping || (totalAmount - discountTL) >= 6500 ? 0 : 30000;
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'try',
          product_data: { name: 'Kargo Ücreti' },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    // Yüzdesel indirim: tek kullanımlık Stripe kuponu olarak uygulanır
    const discounts = [];
    if (discountTL > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountTL * 100),
        currency: 'try',
        duration: 'once',
        name: promo?.label || 'İndirim',
      });
      discounts.push({ coupon: coupon.id });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'tr',
      line_items: lineItems,
      customer_email: customerEmail,
      shipping_address_collection: { allowed_countries: ['TR'] },
      ...(discounts.length ? { discounts } : {}),
      success_url: `${process.env.SITE_URL || 'https://paressilk.com'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'https://paressilk.com'}/checkout`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress || {}),
        billing: JSON.stringify(normalizedBilling),
        promo: promo ? promo.code : '',
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Ödeme oluşturulamadı. Lütfen tekrar deneyin.' }),
    };
  }
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, customerEmail, shippingAddress } = JSON.parse(event.body);

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'try',
        product_data: {
          name: item.name,
          images: item.images?.[0] ? [`https://paressilk.com${item.images[0]}`] : [],
          metadata: { productId: item.id },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = totalAmount >= 1000 ? 0 : 4990;

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'tr',
      line_items: lineItems,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['TR'],
      },
      success_url: `${process.env.URL || 'https://paressilk.com'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://paressilk.com'}/checkout`,
      metadata: {
        shippingAddress: JSON.stringify(shippingAddress || {}),
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id, url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

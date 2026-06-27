const PROMO_CODES = {
  HOSGELDIN10: {
    type: 'percentage',
    value: 10,
    minAmount: 500,
    label: '%10 İndirim',
    singleUse: true,
  },
  IPEK20: {
    type: 'percentage',
    value: 20,
    minAmount: 1000,
    label: '%20 İndirim',
    singleUse: false,
  },
  KARGO: {
    type: 'shipping',
    value: 0,
    minAmount: 0,
    label: 'Ücretsiz Kargo',
    singleUse: false,
  },
  YAZ15: {
    type: 'percentage',
    value: 15,
    minAmount: 750,
    label: '%15 İndirim',
    singleUse: false,
  },
};

exports.handler = async (event) => {
  const origin = process.env.SITE_URL || 'https://paressilk.com';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ valid: false, message: 'Method not allowed' }),
    };
  }

  try {
    const { code } = JSON.parse(event.body);
    const normalized = (code || '').trim().toUpperCase();
    const promo = PROMO_CODES[normalized];

    if (!promo) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, message: 'Geçersiz promosyon kodu' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        discount: {
          type: promo.type,
          value: promo.value,
          code: normalized,
          minAmount: promo.minAmount,
          label: promo.label,
          singleUse: promo.singleUse,
        },
      }),
    };
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ valid: false, message: 'Geçersiz istek' }),
    };
  }
};

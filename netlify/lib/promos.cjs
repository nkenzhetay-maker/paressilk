// Promosyon/hediye çeki kodları — TEK doğruluk kaynağı.
// validate-promo (ön kontrol), create-checkout (Stripe'ta sunucu tarafı uygulama)
// ve place-bank-order (havale) aynı listeden okur; client'a asla güvenilmez.

const PROMO_CODES = {
  HOSGELDIN10: { type: 'percentage', value: 10, minAmount: 500, label: '%10 İndirim', singleUse: true },
  IPEK20: { type: 'percentage', value: 20, minAmount: 1000, label: '%20 İndirim', singleUse: false },
  KARGO: { type: 'shipping', value: 0, minAmount: 0, label: 'Ücretsiz Kargo', singleUse: false },
  YAZ15: { type: 'percentage', value: 15, minAmount: 750, label: '%15 İndirim', singleUse: false },
};

// Sunucu tarafında indirim hesabı. totalTL = ürünlerin sunucu fiyatlarıyla toplamı.
// Dönen: { promo, discountTL, freeShipping } — kod geçersiz/eşik altıysa hepsi boş.
function applyPromo(code, totalTL) {
  const normalized = String(code || '').trim().toUpperCase();
  const promo = PROMO_CODES[normalized];
  if (!promo) return { promo: null, discountTL: 0, freeShipping: false };
  if (promo.minAmount && totalTL < promo.minAmount) return { promo: null, discountTL: 0, freeShipping: false };
  if (promo.type === 'percentage') {
    return { promo: { ...promo, code: normalized }, discountTL: Math.round(totalTL * promo.value) / 100, freeShipping: false };
  }
  if (promo.type === 'shipping') {
    return { promo: { ...promo, code: normalized }, discountTL: 0, freeShipping: true };
  }
  return { promo: null, discountTL: 0, freeShipping: false };
}

module.exports = { PROMO_CODES, applyPromo };

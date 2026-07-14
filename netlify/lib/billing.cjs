// Fatura bilgisi doğrulama — bireysel (TC Kimlik No) / kurumsal (vergi bilgileri).
// create-checkout ve place-bank-order ortak kullanır.

// TC Kimlik No — resmi algoritma: 11 hane, ilk hane != 0,
// 10. hane = ((1,3,5,7,9. haneler toplamı × 7) − (2,4,6,8. haneler toplamı)) mod 10,
// 11. hane = ilk 10 hanenin toplamı mod 10.
function validateTcNo(tc) {
  const s = String(tc || '').trim();
  if (!/^[1-9]\d{10}$/.test(s)) return false;
  const d = s.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  if ((odd * 7 - even + 100) % 10 !== d[9]) return false;
  if ((d.slice(0, 10).reduce((a, b) => a + b, 0)) % 10 !== d[10]) return false;
  return true;
}

// Hata mesajı döner; geçerliyse null.
function validateBilling(billing) {
  if (!billing || typeof billing !== 'object') return 'Fatura bilgileri gerekli';
  if (billing.invoiceType === 'kurumsal') {
    if (!billing.companyName || String(billing.companyName).trim().length < 3) return 'Şirket ünvanı gerekli';
    if (!billing.taxOffice || String(billing.taxOffice).trim().length < 2) return 'Vergi dairesi gerekli';
    if (!/^\d{10}$/.test(String(billing.taxNo || '').trim())) return 'Vergi numarası 10 haneli olmalıdır';
    return null;
  }
  if (!validateTcNo(billing.tcNo)) return 'Geçerli bir TC Kimlik Numarası giriniz';
  return null;
}

// Kayıt/metadata için normalize edilmiş hali
function normalizeBilling(billing) {
  const kurumsal = billing.invoiceType === 'kurumsal';
  return {
    invoiceType: kurumsal ? 'kurumsal' : 'bireysel',
    tcNo: kurumsal ? null : String(billing.tcNo).trim(),
    companyName: kurumsal ? String(billing.companyName).trim().slice(0, 200) : null,
    taxOffice: kurumsal ? String(billing.taxOffice).trim().slice(0, 100) : null,
    taxNo: kurumsal ? String(billing.taxNo).trim() : null,
  };
}

module.exports = { validateTcNo, validateBilling, normalizeBilling };

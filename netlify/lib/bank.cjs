// Havale/EFT banka bilgileri — TEK KAYNAK.
// IBAN yalnızca e-postasına gönderilen 6 haneli kodu giren müşteriye gösterilir
// (reveal-bank-info fonksiyonu). Rastgele ziyaretçi/bot IBAN'ı göremez.

// İstenirse env ile override edilebilir; yoksa aşağıdaki değerler kullanılır.
const BANK_INFO = {
  bankName: process.env.BANK_NAME || 'Enpara.com (QNB)',
  iban: process.env.BANK_IBAN || 'TR44 0015 7000 0000 0088 2040 45',
  accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'MAHAMMAD FARAJOV',
};

// 6 haneli erişim kodu (100000–999999)
function generateAccessCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { BANK_INFO, generateAccessCode };

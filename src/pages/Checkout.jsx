import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^0?5\d{9}$/.test(phone.replace(/\s/g, ''));
}

// TC Kimlik No — resmi algoritma (sunucu da ayrıca doğrular)
function validateTcNo(tc) {
  const s = String(tc || '').trim();
  if (!/^[1-9]\d{10}$/.test(s)) return false;
  const d = s.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  if ((odd * 7 - even + 100) % 10 !== d[9]) return false;
  return d.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === d[10];
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', district: '', postalCode: '', note: '',
    invoiceType: 'bireysel', tcNo: '', companyName: '', taxOffice: '', taxNo: '',
  });
  const [billingError, setBillingError] = useState('');
  const [notifyStatus, setNotifyStatus] = useState(null);

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  const baseShipping = totalPrice >= 1000 ? 0 : 49.90;
  const shipping = promoDiscount?.type === 'shipping' ? 0 : baseShipping;
  const promoAmount = promoDiscount?.type === 'percentage' ? (totalPrice * promoDiscount.value / 100) : 0;
  const grandTotal = totalPrice - promoAmount + shipping;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/.netlify/functions/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (data.valid) {
        if (data.discount.minAmount && totalPrice < data.discount.minAmount) {
          setPromoError(`Bu kod minimum ${formatPrice(data.discount.minAmount)} sipariş gerektirir.`);
          setPromoDiscount(null);
        } else {
          setPromoDiscount(data.discount);
          setPromoError('');
        }
      } else {
        setPromoError(data.message);
        setPromoDiscount(null);
      }
    } catch {
      setPromoError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setPromoDiscount(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fatura alanlarını client'ta doğrula (sunucu ayrıca doğrular)
  const validateBillingFields = () => {
    if (formData.invoiceType === 'kurumsal') {
      if (formData.companyName.trim().length < 3) return 'Şirket ünvanı gerekli';
      if (formData.taxOffice.trim().length < 2) return 'Vergi dairesi gerekli';
      if (!/^\d{10}$/.test(formData.taxNo.trim())) return 'Vergi numarası 10 haneli olmalıdır';
      return '';
    }
    if (!validateTcNo(formData.tcNo)) return 'Geçerli bir TC Kimlik Numarası giriniz (11 hane)';
    return '';
  };

  const buildBilling = () => ({
    invoiceType: formData.invoiceType,
    tcNo: formData.tcNo.trim(),
    companyName: formData.companyName.trim(),
    taxOffice: formData.taxOffice.trim(),
    taxNo: formData.taxNo.trim(),
  });

  const buildShippingInfo = () => ({
    name: `${formData.firstName} ${formData.lastName}`,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    district: formData.district,
    postalCode: formData.postalCode,
  });

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, images: i.images })),
          promoCode: promoDiscount ? promoDiscount.code : null,
          customerEmail: formData.email,
          billing: buildBilling(),
          shippingAddress: buildShippingInfo(),
        }),
      });

      const data = await response.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        alert(data.error || 'Ödeme sayfası oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      alert('Bir hata oluştu. Lütfen tekrar deneyin veya WhatsApp ile iletişime geçin.');
    } finally {
      setLoading(false);
    }
  };

  // Havale siparişi artık SUNUCUDA oluşturulur: kayıt + e-posta dekontu + SMS
  const handleBankTransfer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/place-bank-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty })),
          customerEmail: formData.email,
          shippingInfo: buildShippingInfo(),
          billing: buildBilling(),
          promoCode: promoDiscount ? promoDiscount.code : null,
          note: formData.note,
        }),
      });
      const data = await response.json();
      if (response.ok && data.orderNumber) {
        setOrderNumber(data.orderNumber);
        setNotifyStatus({ email: data.emailSent, sms: data.smsSent });
        setOrderPlaced(true);
        clearCart();
      } else {
        alert(data.error || 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      alert('Bir hata oluştu. Lütfen tekrar deneyin veya WhatsApp ile iletişime geçin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      const err = validateBillingFields();
      if (err) { setBillingError(err); return; }
      setBillingError('');
      setStep(2);
      return;
    }
    if (paymentMethod === 'card') {
      handleStripeCheckout();
    } else {
      handleBankTransfer();
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5" style={{ marginBottom: 24 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: 12 }}>Siparişiniz Alındı!</h2>
          <p style={{ color: '#666', marginBottom: 8 }}>Sipariş numaranız: <strong>{orderNumber}</strong></p>
          {paymentMethod === 'bank' && (
            <div style={{ background: '#F5F0E8', padding: 24, maxWidth: 500, margin: '20px auto', textAlign: 'left', fontSize: '0.85rem', lineHeight: 1.8 }}>
              <p><strong>Havale/EFT Bilgileri:</strong></p>
              <p>Banka: XXXX Bank</p>
              <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
              <p>Hesap Sahibi: Paressilk</p>
              <p style={{ color: 'var(--gold-dark)', marginTop: 8 }}>Açıklama: <strong>{orderNumber}</strong></p>
            </div>
          )}
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>
            {notifyStatus?.email
              ? '📧 Sipariş dekontu e-posta adresinize gönderildi.'
              : 'Sipariş detayları e-posta adresinize gönderilecektir.'}
          </p>
          {notifyStatus?.sms && (
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>📱 Onay SMS'i telefonunuza gönderildi.</p>
          )}
          <div style={{ marginBottom: 32 }} />
          <Link to="/shop" className="btn btn--primary">Alışverişe Devam Et</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 16 }}>Sepetiniz Boş</h2>
          <Link to="/shop" className="btn btn--outline">Alışverişe Başla</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sipariş | Paressilk</title>
      </Helmet>

      <div className="checkout-page">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Ana Sayfa</Link> / <Link to="/shop">Koleksiyon</Link> / <span>Sipariş</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 40 }}>
            {[{ n: 1, label: 'Teslimat' }, { n: 2, label: 'Ödeme' }].map(s => (
              <div key={s.n} style={{ textAlign: 'center', opacity: step >= s.n ? 1 : 0.4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.n ? 'var(--gold)' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '0.8rem', fontWeight: 600 }}>{s.n}</div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="checkout-grid">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: 24 }}>Teslimat Bilgileri</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ad</label>
                      <input type="text" required value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Soyad</label>
                      <input type="text" required value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>E-Posta</label>
                    <input type="email" required value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Telefon</label>
                    <input type="tel" required placeholder="05XX XXX XX XX" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Adres</label>
                    <textarea rows="3" required value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>İl</label>
                      <input type="text" required value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>İlçe</label>
                      <input type="text" required value={formData.district} onChange={e => handleInputChange('district', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Posta Kodu</label>
                    <input type="text" value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} />
                  </div>

                  {/* Fatura Bilgileri */}
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: '32px 0 16px' }}>Fatura Bilgileri</h2>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    {[
                      { key: 'bireysel', label: 'Bireysel' },
                      { key: 'kurumsal', label: 'Kurumsal' },
                    ].map(opt => (
                      <label
                        key={opt.key}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '14px 12px',
                          border: `2px solid ${formData.invoiceType === opt.key ? 'var(--gold)' : '#eee'}`,
                          background: formData.invoiceType === opt.key ? '#FFFDF5' : '#fff',
                          cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500,
                        }}
                      >
                        <input
                          type="radio"
                          name="invoiceType"
                          value={opt.key}
                          checked={formData.invoiceType === opt.key}
                          onChange={() => { handleInputChange('invoiceType', opt.key); setBillingError(''); }}
                          style={{ accentColor: 'var(--gold)' }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>

                  {formData.invoiceType === 'bireysel' ? (
                    <div className="form-group">
                      <label>TC Kimlik No</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        required
                        placeholder="11 haneli TC Kimlik Numaranız"
                        value={formData.tcNo}
                        onChange={e => { handleInputChange('tcNo', e.target.value.replace(/\D/g, '')); setBillingError(''); }}
                      />
                      <p style={{ fontSize: '0.72rem', color: '#999', marginTop: 4 }}>
                        Fatura düzenlenebilmesi için yasal olarak zorunludur. Bilgileriniz KVKK kapsamında yalnızca fatura için kullanılır.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Şirket Ünvanı</label>
                        <input type="text" required placeholder="Örn. ABC Tekstil San. ve Tic. Ltd. Şti." value={formData.companyName} onChange={e => { handleInputChange('companyName', e.target.value); setBillingError(''); }} />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Vergi Dairesi</label>
                          <input type="text" required value={formData.taxOffice} onChange={e => { handleInputChange('taxOffice', e.target.value); setBillingError(''); }} />
                        </div>
                        <div className="form-group">
                          <label>Vergi No</label>
                          <input type="text" inputMode="numeric" maxLength={10} required placeholder="10 haneli" value={formData.taxNo} onChange={e => { handleInputChange('taxNo', e.target.value.replace(/\D/g, '')); setBillingError(''); }} />
                        </div>
                      </div>
                    </>
                  )}

                  {billingError && (
                    <p style={{ color: '#E74C3C', fontSize: '0.82rem', marginBottom: 12 }}>{billingError}</p>
                  )}

                  <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 16 }}>Ödemeye Geç</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: 24 }}>Ödeme Yöntemi</h2>

                  {/* Payment Method Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: 20,
                        border: `2px solid ${paymentMethod === 'card' ? 'var(--gold)' : '#eee'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: paymentMethod === 'card' ? '#FFFDF5' : '#fff',
                      }}
                    >
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: 'var(--gold)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                          <strong style={{ fontSize: '0.9rem' }}>Kredi / Banka Kartı</strong>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, marginLeft: 32 }}>Visa, Mastercard, Troy - SSL güvenli ödeme</p>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <svg width="32" height="20" viewBox="0 0 32 20"><rect width="32" height="20" rx="3" fill="#1A1F71"/><circle cx="12" cy="10" r="6" fill="#EB001B"/><circle cx="20" cy="10" r="6" fill="#F79E1B"/><path d="M16 5.5a6 6 0 010 9" fill="#FF5F00"/></svg>
                        <svg width="32" height="20" viewBox="0 0 32 20"><rect width="32" height="20" rx="3" fill="#0055A5"/><text x="16" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">VISA</text></svg>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: 20,
                        border: `2px solid ${paymentMethod === 'bank' ? 'var(--gold)' : '#eee'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: paymentMethod === 'bank' ? '#FFFDF5' : '#fff',
                      }}
                    >
                      <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} style={{ accentColor: 'var(--gold)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 2l10 5H2l10-5z"/>
                          </svg>
                          <strong style={{ fontSize: '0.9rem' }}>Havale / EFT</strong>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, marginLeft: 32 }}>Banka havalesi ile ödeme</p>
                      </div>
                    </label>
                  </div>

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank' && (
                    <div style={{ padding: 20, background: '#F5F0E8', marginBottom: 24, fontSize: '0.85rem', lineHeight: 1.8, borderRadius: 4 }}>
                      <p><strong>Havale / EFT Bilgileri</strong></p>
                      <p>Banka: XXXX Bank</p>
                      <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
                      <p>Hesap Sahibi: Paressilk</p>
                      <p style={{ marginTop: 8, color: 'var(--gold-dark)', fontSize: '0.8rem' }}>Sipariş onaylandıktan sonra 24 saat içinde havale yapılmalıdır.</p>
                    </div>
                  )}

                  {/* Stripe Security Badge */}
                  {paymentMethod === 'card' && (
                    <div style={{ padding: 20, background: '#F0FAF0', marginBottom: 24, fontSize: '0.82rem', lineHeight: 1.8, borderRadius: 4, border: '1px solid #D4EDDA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        <strong style={{ color: '#27AE60' }}>SSL Güvenli Ödeme</strong>
                      </div>
                      <p style={{ color: '#555' }}>Kart bilgileriniz Stripe altyapısı ile 256-bit SSL şifreleme ile korunur. Kart bilgileriniz sunucularımızda saklanmaz.</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Sipariş Notu (Opsiyonel)</label>
                    <textarea rows="3" placeholder="Hediye paketi, özel not vb." value={formData.note} onChange={e => handleInputChange('note', e.target.value)} />
                  </div>

                  <div style={{ padding: 16, border: '1px solid #eee', marginBottom: 24, background: '#FAFAFA' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={e => setAcceptTerms(e.target.checked)}
                        style={{ accentColor: 'var(--gold)', marginTop: 3, flexShrink: 0 }}
                        required
                      />
                      <span>
                        <Link to="/mesafeli-satis" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>Mesafeli Satış Sözleşmesi</Link>'ni ve{' '}
                        <Link to="/iade-politikasi" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>İade Politikası</Link>'nı okudum ve kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button type="button" className="btn btn--outline" onClick={() => setStep(1)} style={{ flex: 1 }}>Geri</button>
                    <button type="submit" className="btn btn--primary" style={{ flex: 2, position: 'relative' }} disabled={loading}>
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span className="loading__spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Yönlendiriliyor...
                        </span>
                      ) : paymentMethod === 'card' ? (
                        'Güvenli Ödemeye Geç'
                      ) : (
                        'Siparişi Onayla'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div>
              <div style={{ background: '#FAFAFA', padding: 30, border: '1px solid #eee' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Sipariş Özeti</h3>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <img src={item.images?.[0] || '/images/products/kelaghayi-1.jpg'} alt={item.name} style={{ width: 50, height: 60, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</p>
                      <p style={{ fontSize: '0.78rem', color: '#888' }}>Adet: {item.qty}</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                {/* Promo Code Section */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16 }}>
                  {!promoDiscount ? (
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block', color: '#555' }}>Promosyon Kodu</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={promoCode}
                          onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                          placeholder="Kodunuzu girin"
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          style={{
                            padding: '10px 18px', background: 'var(--gold)', color: '#fff', border: 'none',
                            fontSize: '0.8rem', fontWeight: 600, cursor: promoLoading || !promoCode.trim() ? 'not-allowed' : 'pointer',
                            opacity: promoLoading || !promoCode.trim() ? 0.5 : 1, letterSpacing: '0.05em', fontFamily: 'inherit',
                          }}
                        >
                          {promoLoading ? '...' : 'Uygula'}
                        </button>
                      </div>
                      {promoError && (
                        <p style={{ color: '#E74C3C', fontSize: '0.75rem', marginTop: 6 }}>{promoError}</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F5F0E8', border: '1px solid var(--gold)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-dark)' }}>{promoDiscount.code}</span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>— {promoDiscount.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1, color: '#999', fontSize: '1.1rem' }}
                        title="Kodu kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span>Ara Toplam</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {promoDiscount && promoDiscount.type === 'percentage' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem', color: '#27AE60' }}>
                      <span>İndirim ({promoDiscount.label})</span>
                      <span>−{formatPrice(promoAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span>Kargo</span>
                    <span style={{ color: shipping === 0 ? '#27AE60' : undefined }}>
                      {shipping === 0 ? (promoDiscount?.type === 'shipping' ? 'Ücretsiz (Promo)' : 'Ücretsiz') : formatPrice(shipping)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem', borderTop: '2px solid var(--gold)', paddingTop: 16, marginTop: 8 }}>
                    <span>Toplam</span>
                    <span style={{ color: 'var(--gold-dark)' }}>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                {totalPrice < 1000 && (
                  <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 12, textAlign: 'center' }}>
                    {formatPrice(1000 - totalPrice)} daha ekleyin, kargo ücretsiz!
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div style={{ marginTop: 20, padding: 20, border: '1px solid #eee', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '🔒', text: '256-bit SSL Güvenli Alışveriş' },
                    { icon: '🚚', text: '1.000 TL Üzeri Ücretsiz Kargo' },
                    { icon: '↩️', text: '14 Gün Koşulsuz İade Garantisi' },
                    { icon: '✅', text: '%100 Orijinal Ürün Garantisi' },
                  ].map((badge, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: '#555' }}>
                      <span style={{ fontSize: '1rem' }}>{badge.icon}</span>
                      {badge.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetch(`/.netlify/functions/verify-payment?session_id=${sessionId}`)
        .then(r => r.json())
        .then(setPayment)
        .catch(() => {});
    }
  }, [sessionId]);

  const formatPrice = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount / 100);
  };

  return (
    <>
      <Helmet>
        <title>Sipariş Onayı | Paressilk</title>
      </Helmet>

      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5" style={{ marginBottom: 24 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', marginBottom: 16 }}>Ödemeniz Başarıyla Alındı!</h2>

          {payment && (
            <div style={{ maxWidth: 400, margin: '0 auto 24px', textAlign: 'left', background: '#F5F0E8', padding: 24, fontSize: '0.9rem', lineHeight: 1.8 }}>
              <p><strong>Durum:</strong> <span style={{ color: '#27AE60' }}>Ödeme Onaylandı</span></p>
              {payment.customerEmail && <p><strong>E-Posta:</strong> {payment.customerEmail}</p>}
              {payment.amountTotal && <p><strong>Tutar:</strong> {formatPrice(payment.amountTotal)}</p>}
            </div>
          )}

          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: 8, maxWidth: 500, margin: '0 auto 8px' }}>
            Siparişiniz onaylanmıştır. Sipariş detayları ve kargo takip bilgisi e-posta adresinize gönderilecektir.
          </p>
          <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: 40 }}>
            Sorularınız için WhatsApp üzerinden bize ulaşabilirsiniz.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn--primary">Alışverişe Devam Et</Link>
            <Link to="/" className="btn btn--outline">Ana Sayfaya Dön</Link>
          </div>
        </div>
      </div>
    </>
  );
}

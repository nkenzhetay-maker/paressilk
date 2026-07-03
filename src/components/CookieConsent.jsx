import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('paressilk_cookie_consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const accept = (type) => {
    localStorage.setItem('paressilk_cookie_consent', type);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 5000,
      background: '#0A0A0A', color: '#fff', padding: '20px 0',
      borderTop: '1px solid rgba(200,164,86,0.3)',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#ccc' }}>
            Bu web sitesi, deneyiminizi iyileştirmek için çerezler kullanmaktadır.
            Sitemizi kullanarak <Link to="/kvkk" style={{ color: '#C8A456', textDecoration: 'underline' }}>KVKK Aydınlatma Metni</Link> ve{' '}
            <Link to="/cerez-politikasi" style={{ color: '#C8A456', textDecoration: 'underline' }}>Çerez Politikası</Link>'nı
            kabul etmiş sayılırsınız.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
          <button
            onClick={() => accept('essential')}
            style={{
              padding: '10px 20px', background: 'transparent', color: '#999',
              border: '1px solid #444', fontSize: '0.75rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', flex: '1 1 auto', minWidth: 0,
            }}
          >
            Sadece Zorunlu
          </button>
          <button
            onClick={() => accept('all')}
            style={{
              padding: '10px 24px', background: '#C8A456', color: '#0A0A0A',
              border: '1px solid #C8A456', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', flex: '1 1 auto', minWidth: 0,
            }}
          >
            Tümünü Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}

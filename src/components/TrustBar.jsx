import { useState, useEffect } from 'react';

export default function TrustBar() {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem('paressilk_trustbar_closed');
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('paressilk_trustbar_closed', 'true');
  };

  const desktopText = 'Ücretsiz Kargo (1000₺+) | %100 Doğal İpek | 14 Gün İade Garantisi | Güvenli Ödeme';
  const mobileText = 'Ücretsiz Kargo | Güvenli Ödeme | 14 Gün İade';

  return (
    <div
      style={{
        background: '#1a1a1a',
        color: '#ccc',
        fontSize: '0.7rem',
        textAlign: 'center',
        padding: '8px 40px 8px 16px',
        letterSpacing: '0.05em',
        position: 'relative',
        zIndex: 1001,
      }}
    >
      {isMobile ? mobileText : desktopText}
      <button
        onClick={handleClose}
        aria-label="Kapat"
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#ccc',
          fontSize: '0.85rem',
          cursor: 'pointer',
          padding: '2px 6px',
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  );
}

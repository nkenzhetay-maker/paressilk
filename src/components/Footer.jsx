import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="Paressilk" style={{ height: 36 }} />
            <p>%100 el yapımı doğal ipek ürünler. Geleneksel ipek sanatını modern dünyaya taşıyoruz. Her parça, yüzyıllık ustalığın modern yorumudur.</p>
          </div>
          <div>
            <h4 className="footer__heading">Koleksiyon</h4>
            <ul className="footer__links">
              <li><Link to="/shop?category=kelaghayi">Kelağayı</Link></li>
              <li><Link to="/shop?category=scarves">Eşarplar</Link></li>
              <li><Link to="/shop?category=chitme">Çitme</Link></li>
              <li><Link to="/shop?category=raw-silk">Ham İpek</Link></li>
              <li><Link to="/shop?category=carpet">Halılar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer__heading">Bilgi</h4>
            <ul className="footer__links">
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
              <li><Link to="/sss">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link to="/cerez-politikasi">Çerez Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi">Gizlilik Politikası</Link></li>
              <li><Link to="/uyelik-sozlesmesi">Üyelik Sözleşmesi</Link></li>
              <li><Link to="/mesafeli-satis">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link to="/iade-politikasi">İade Politikası</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer__heading">İletişim</h4>
            <ul className="footer__links">
              <li>info@paressilk.com</li>
              <li>+90 (533) 485 07 48</li>
              <li>İstanbul, Türkiye</li>
            </ul>
            <div className="footer__social" style={{ marginTop: '20px' }}>
              <a href="https://instagram.com/paressilk" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://wa.me/905334850748" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.108-1.14l-.29-.174-3.01.79.806-2.942-.19-.302A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Paressilk. Tüm hakları saklıdır.</p>
          <p style={{ fontSize: '0.7rem', color: '#666' }}>KVKK & Güvenli Alışveriş</p>
          <p style={{ fontSize: '0.66rem', color: '#777', marginTop: 6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Sitemizdeki bazı tanıtım ve atmosfer görselleri yapay zekâ destekli olarak üretilmiştir. Ürün desenleri gerçek fotoğraflara dayanır.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', opacity: 0.6, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Visa */}
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="3" fill="#1A1F71"/>
              <path d="M17.2 17H15L16.8 8H19L17.2 17ZM13.5 8L11.8 14.2L11.5 12.8L10.5 9.2C10.5 9.2 10.4 8 8.8 8H5.1L5 8.2C5 8.2 6.8 8.6 8.8 9.8L10.8 17H13.1L16 8H13.5ZM33 17L31 8H29.2C28.6 8 28.2 8.4 28 8.8L24.5 17H26.8L27.3 15.5H30.1L30.4 17H33ZM28 13.8L29.3 10.2L30 13.8H28ZM24.5 10.5L24.8 8.5C24.8 8.5 23.2 8 21.5 8C19.8 8 16.5 8.8 16.5 11.5C16.5 14 20 14 20 15.2C20 16.4 17 16.2 15.5 15L15.2 17.2C15.2 17.2 16.8 17.8 18.8 17.8C20.8 17.8 24.5 16.5 24.5 14C24.5 11.5 21 11.2 21 10.2C21 9.2 23.2 9.4 24.5 10.5Z" fill="white"/>
            </svg>
            {/* Mastercard */}
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="3" fill="#252525"/>
              <circle cx="16" cy="12.5" r="7" fill="#EB001B"/>
              <circle cx="24" cy="12.5" r="7" fill="#F79E1B"/>
              <path d="M20 7.3C21.6 8.6 22.6 10.4 22.6 12.5C22.6 14.6 21.6 16.4 20 17.7C18.4 16.4 17.4 14.6 17.4 12.5C17.4 10.4 18.4 8.6 20 7.3Z" fill="#FF5F00"/>
            </svg>
            {/* Troy */}
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="3" fill="#004B93"/>
              <text x="20" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">TROY</text>
            </svg>
            {/* SSL Secure */}
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" rx="3" fill="#2E7D32"/>
              <path d="M20 5C17.2 5 15 7.2 15 10V12H14C13.4 12 13 12.4 13 13V20C13 20.6 13.4 21 14 21H26C26.6 21 27 20.6 27 20V13C27 12.4 26.6 12 26 12H25V10C25 7.2 22.8 5 20 5ZM17 10C17 8.3 18.3 7 20 7C21.7 7 23 8.3 23 10V12H17V10ZM21 17.7V19H19V17.7C18.4 17.4 18 16.7 18 16C18 14.9 18.9 14 20 14C21.1 14 22 14.9 22 16C22 16.7 21.6 17.4 21 17.7Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}

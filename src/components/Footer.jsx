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
              <li><Link to="/shop?category=kelaghayi">Kelaghayi</Link></li>
              <li><Link to="/shop?category=scarves">Eşarplar</Link></li>
              <li><Link to="/shop?category=chitme">Chitme</Link></li>
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
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { setIsOpen, totalItems } = useCart();
  const { user, logout, setShowAuthModal } = useUser();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const headerClass = isHome && !scrolled ? 'header header--transparent' : 'header header--solid';

  return (
    <>
      <header className={headerClass}>
        <div className="header__inner">
          <Link to="/" className="header__logo">
            <img src="/images/logo.png" alt="Paressilk" style={{ height: 40 }} />
          </Link>

          <nav className="header__nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Ana Sayfa</Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Koleksiyon</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>Hakkımızda</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>İletişim</Link>
          </nav>

          <div className="header__icons">
            {user ? (
              <div style={{ position: 'relative' }}>
                <button className="header__icon" aria-label="Hesabım" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', minWidth: 180, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontSize: '0.82rem', color: '#888' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#333' }}>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="header__icon" onClick={() => setShowAuthModal(true)} aria-label="Giriş Yap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
            <Link to="/wishlist" className="header__icon" aria-label="Favoriler" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {wishlistCount > 0 && <span className="header__cart-count">{wishlistCount}</span>}
            </Link>
            <button className="header__icon" onClick={() => setIsOpen(true)} aria-label="Sepet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && <span className="header__cart-count">{totalItems}</span>}
            </button>
            <button className="header__menu-btn" onClick={() => setMobileOpen(true)} aria-label="Menü">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
        <button className="mobile-menu__close" onClick={() => setMobileOpen(false)} aria-label="Kapat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <Link to="/">Ana Sayfa</Link>
        <Link to="/shop">Koleksiyon</Link>
        <Link to="/about">Hakkımızda</Link>
        <Link to="/contact">İletişim</Link>
      </div>
    </>
  );
}

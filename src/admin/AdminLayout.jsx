import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <AdminLogin />;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Ürünler', icon: '🛍️' },
    { path: '/admin/orders', label: 'Siparişler', icon: '📦' },
    { path: '/admin/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <h2>PARESSILK</h2>
          <p>Yönetim Paneli</p>
        </div>
        <nav className="admin-sidebar__nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
          <Link to="/" target="_blank">
            <span>🌐</span> Siteyi Görüntüle
          </Link>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
            <span>🚪</span> Çıkış Yap
          </a>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

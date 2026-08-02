import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';

const STATUS_LABELS = {
  awaiting_payment: 'Ödeme Bekleniyor',
  awaiting_bank_transfer: 'Havale Bekleniyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargolandı',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
};

export default function Hesap() {
  const { user, token, logout } = useUser();
  const navigate = useNavigate();
  const { items: wishlist } = useWishlist();
  const [orders, setOrders] = useState(null); // null = yükleniyor
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/list-my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) { setError(data.error || 'Siparişler alınamadı'); setOrders([]); return; }
        setOrders(data.orders || []);
      } catch {
        if (alive) { setError('Bağlantı hatası'); setOrders([]); }
      }
    })();
    return () => { alive = false; };
  }, [token]);

  if (!user) return null;

  const fmt = (n, c = 'try') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (c || 'try').toUpperCase() }).format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      <Helmet><title>Hesabım | Paressilk</title><meta name="robots" content="noindex" /></Helmet>
      <div className="container" style={{ padding: '48px 20px 80px', maxWidth: 860 }}>
        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          {user.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} referrerPolicy="no-referrer" />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gold, #B8860B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontFamily: 'var(--font-heading, serif)' }}>
              {(user.firstName || user.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.8rem', margin: 0 }}>
              Merhaba, {user.firstName || 'Hoş geldiniz'}
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>{user.email}</p>
          </div>
        </div>

        {/* Hesap bilgileri */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.2rem', marginBottom: 16 }}>Hesap Bilgileri</h2>
          <div style={{ background: '#F5F0E8', padding: 20, borderRadius: 8, fontSize: '0.9rem', lineHeight: 2 }}>
            <div><strong>Ad Soyad:</strong> {`${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'}</div>
            <div><strong>E-posta:</strong> {user.email}</div>
          </div>
        </section>

        {/* Hızlı bağlantılar */}
        <section style={{ marginBottom: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/wishlist" style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 20, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.5rem' }}>♥</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Favorilerim</div>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>{wishlist?.length || 0} ürün</div>
          </Link>
          <Link to="/shop" style={{ flex: '1 1 200px', background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 20, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.5rem' }}>🧵</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Alışverişe Devam</div>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>Koleksiyonu keşfet</div>
          </Link>
        </section>

        {/* Siparişlerim */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.2rem', marginBottom: 16 }}>Siparişlerim</h2>
          {orders === null ? (
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Yükleniyor…</p>
          ) : orders.length === 0 ? (
            <div style={{ background: '#F5F0E8', padding: 24, borderRadius: 8, textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: 12 }}>{error ? error : 'Henüz siparişiniz yok.'}</p>
              <Link to="/shop" className="btn btn--primary" style={{ background: 'var(--gold, #B8860B)', color: '#fff', padding: '10px 24px', textDecoration: 'none', fontSize: '0.85rem' }}>Alışverişe Başla</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((o) => (
                <div key={o.orderNumber} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sipariş #{o.orderNumber}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{fmtDate(o.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{fmt(o.total, o.currency)}</div>
                      <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20, background: o.status === 'paid' || o.status === 'delivered' ? '#e6f4ea' : '#fdf3e3', color: o.status === 'paid' || o.status === 'delivered' ? '#1e7e34' : '#a06a00' }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#666' }}>
                    {(o.items || []).map((it, i) => (
                      <span key={i}>{it.name || it.title || 'Ürün'} × {it.qty || it.quantity || 1}{i < o.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <button onClick={() => { logout(); navigate('/'); }} className="btn btn--outline" style={{ padding: '10px 28px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
          Çıkış Yap
        </button>
      </div>
    </>
  );
}

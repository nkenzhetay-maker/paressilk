import { useState, useEffect, useCallback } from 'react';

const getToken = () => sessionStorage.getItem('paressilk_admin_token') || '';

const STATUS_LABELS = {
  awaiting_payment: 'Ödeme Bekleniyor', awaiting_bank_transfer: 'Havale Bekleniyor',
  paid: 'Ödendi', processing: 'Hazırlanıyor', shipped: 'Kargolandı',
  delivered: 'Teslim Edildi', cancelled: 'İptal',
};
const badge = (v) => ['paid', 'processing', 'delivered', 'shipped'].includes(v) ? '#e6f4ea'
  : v === 'cancelled' ? '#fdecec' : '#fdf3e3';
const badgeText = (v) => ['paid', 'processing', 'delivered', 'shipped'].includes(v) ? '#1e7e34'
  : v === 'cancelled' ? '#c0392b' : '#a06a00';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openEmail, setOpenEmail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/.netlify/functions/list-customers', { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Müşteriler alınamadı');
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (err) { setError(err.message || 'Yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmtPrice = (n, c) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (c || 'try').toUpperCase() }).format(n || 0);
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return iso; } };

  const q = search.trim().toLowerCase();
  const filtered = q ? customers.filter(c =>
    (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) ||
    (c.customerNo || '').toLowerCase().includes(q) || (c.phone || '').includes(q)) : customers;

  return (
    <div>
      <div className="admin-header">
        <h1>Müşteriler ({customers.length})</h1>
        <button className="btn btn--primary" onClick={load} disabled={loading}>{loading ? 'Yükleniyor...' : 'Yenile'}</button>
      </div>

      <div className="admin-card">
        <input type="text" placeholder="Ad, e-posta, müşteri no veya telefon ara..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: 20 }} />

        {error && <p style={{ textAlign: 'center', padding: 20, color: 'var(--error)' }}>{error}</p>}

        {loading && !customers.length ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>{customers.length === 0 ? 'Henüz müşteri yok.' : 'Müşteri bulunamadı.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => {
              const isOpen = openEmail === c.email;
              return (
                <div key={c.email} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {c.name || '—'} {c.customerNo && <span style={{ color: 'var(--gold-dark, #8a6600)', fontSize: '0.8rem', fontWeight: 500 }}>· {c.customerNo}</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', textAlign: 'center' }}>
                      <div><div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.ordersCount}</div><div style={{ fontSize: '0.68rem', color: '#999' }}>SİPARİŞ</div></div>
                      <div><div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e7e34' }}>{fmtPrice(c.totalPaid, 'try')}</div><div style={{ fontSize: '0.68rem', color: '#999' }}>ÖDENEN</div></div>
                      <div><div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{fmtDate(c.lastOrderAt)}</div><div style={{ fontSize: '0.68rem', color: '#999' }}>SON SİPARİŞ</div></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {c.paidCount > 0 && <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: '#e6f4ea', color: '#1e7e34' }}>{c.paidCount} ödendi</span>}
                    {c.awaitingCount > 0 && <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: '#fdf3e3', color: '#a06a00' }}>{c.awaitingCount} bekliyor</span>}
                    {c.cancelledCount > 0 && <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: '#fdecec', color: '#c0392b' }}>{c.cancelledCount} iptal</span>}
                    <a href={`mailto:${c.email}`} style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--gold-dark, #8a6600)', textDecoration: 'none', border: '1px solid var(--gold, #B8860B)', borderRadius: 6, padding: '5px 12px' }}>✉ Mail Gönder</a>
                    <button onClick={() => setOpenEmail(isOpen ? null : c.email)} style={{ fontSize: '0.78rem', background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                      {isOpen ? 'Gizle' : `Geçmiş (${c.ordersCount})`}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {c.orders.map(o => (
                        <div key={o.orderNumber} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '0.85rem', padding: '6px 0' }}>
                          <div>
                            <strong>#{o.orderNumber}</strong> · {fmtDate(o.createdAt)}
                            <div style={{ color: '#777', fontSize: '0.78rem' }}>{(o.items || []).map(it => `${it.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join(', ') || '—'}</div>
                          </div>
                          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600 }}>{fmtPrice(o.total, o.currency)}</div>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, background: badge(o.status), color: badgeText(o.status) }}>{STATUS_LABELS[o.status] || o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';

const getToken = () => sessionStorage.getItem('paressilk_admin_token') || '';

const STATUS_LABELS = {
  awaiting_payment: 'Ödeme Bekleniyor',
  awaiting_bank_transfer: 'Havale Bekleniyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargolandı',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
};

// badge sınıfı: paid/processing/delivered/shipped -> success, awaiting -> warning, cancelled -> error
const badgeClass = (value) => {
  if (!value) return '';
  if (['paid', 'processing', 'delivered', 'shipped'].includes(value)) return 'badge--success';
  if (value === 'cancelled') return 'badge--error';
  return 'badge--warning'; // awaiting_payment / awaiting_bank_transfer / bilinmeyen
};

const label = (value) => STATUS_LABELS[value] || value || '—';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [expanded, setExpanded] = useState({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/list-orders', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Siparişler alınamadı');
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || 'Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const confirmPayment = async (orderNumber) => {
    if (busyId) return;
    if (!window.confirm(`${orderNumber} numaralı siparişin ödemesini onaylıyor musunuz?`)) return;
    setBusyId(orderNumber);
    try {
      const res = await fetch('/.netlify/functions/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ödeme onaylanamadı');
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber
        ? { ...o, paymentStatus: data.paymentStatus || 'paid', status: data.status || 'processing' }
        : o));
    } catch (err) {
      window.alert(err.message || 'İşlem başarısız oldu.');
    } finally {
      setBusyId(null);
    }
  };

  const cancelOrder = async (orderNumber) => {
    if (busyId) return;
    if (!window.confirm(`${orderNumber} numaralı siparişi İPTAL etmek istiyor musunuz?\n\nMüşteriye "ödemeniz ulaşmadığı için siparişiniz iptal edildi" bildirimi (e-posta/SMS) gönderilecek.`)) return;
    setBusyId(orderNumber);
    try {
      const res = await fetch('/.netlify/functions/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Sipariş iptal edilemedi');
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber
        ? { ...o, status: 'cancelled', paymentStatus: 'cancelled' }
        : o));
      window.alert(data.emailSent || data.smsSent
        ? 'Sipariş iptal edildi ve müşteriye bildirim gönderildi.'
        : 'Sipariş iptal edildi. (Bildirim gönderilemedi — e-posta/SMS yapılandırmasını kontrol edin.)');
    } catch (err) {
      window.alert(err.message || 'İşlem başarısız oldu.');
    } finally {
      setBusyId(null);
    }
  };

  const formatPrice = (price, currency) => new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: (currency || 'try').toUpperCase(),
  }).format(price || 0);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return iso; }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? orders.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerNo || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q))
    : orders;

  const itemsSummary = (items) => {
    if (!Array.isArray(items) || items.length === 0) return '—';
    const parts = items.slice(0, 2).map(it => `${it.name} ×${Number(it.qty) || 1}`);
    if (items.length > 2) parts.push(`+${items.length - 2} ürün`);
    return parts.join(', ');
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Siparişler ({orders.length})</h1>
        <button className="btn btn--primary" onClick={loadOrders} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Sipariş no, müşteri no veya müşteri adı ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, padding: '10px 16px', border: '1px solid #ddd', fontSize: '0.85rem' }}
          />
        </div>

        {error && (
          <p style={{ textAlign: 'center', padding: 20, color: 'var(--error)' }}>{error}</p>
        )}

        {loading && !orders.length ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Siparişler yükleniyor...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri No</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Ödeme Durumu</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const isOpen = !!expanded[o.orderNumber];
                return (
                  <tr key={o.orderNumber}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>{o.customerNo || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td>
                      <div>{o.customerName || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{o.email || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>
                        {isOpen && Array.isArray(o.items) && o.items.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {o.items.map((it, i) => (
                              <li key={i}>{it.name} ×{Number(it.qty) || 1} — {formatPrice(it.price, o.currency)}</li>
                            ))}
                          </ul>
                        ) : itemsSummary(o.items)}
                        {Array.isArray(o.items) && o.items.length > 0 && (
                          <button
                            onClick={() => setExpanded(prev => ({ ...prev, [o.orderNumber]: !isOpen }))}
                            style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', cursor: 'pointer', padding: 0, marginTop: 2, fontSize: '0.75rem', textDecoration: 'underline' }}
                          >
                            {isOpen ? 'Gizle' : 'Detay'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{formatPrice(o.total, o.currency)}</td>
                    <td><span className={`badge ${badgeClass(o.paymentStatus)}`}>{label(o.paymentStatus)}</span></td>
                    <td><span className={`badge ${badgeClass(o.status)}`}>{label(o.status)}</span></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(o.createdAt)}</td>
                    <td>
                      {o.status === 'cancelled' ? (
                        <span style={{ color: '#c0392b', fontSize: '0.8rem' }}>İptal edildi</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                          {o.paymentStatus !== 'paid' && (
                            <button
                              className="btn btn--primary"
                              onClick={() => confirmPayment(o.orderNumber)}
                              disabled={busyId === o.orderNumber}
                              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                            >
                              {busyId === o.orderNumber ? 'Onaylanıyor...' : 'Ödemeyi Onayla'}
                            </button>
                          )}
                          <button
                            onClick={() => cancelOrder(o.orderNumber)}
                            disabled={busyId === o.orderNumber}
                            style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#fff', border: '1px solid #c0392b', color: '#c0392b', cursor: 'pointer', borderRadius: 4 }}
                          >
                            {busyId === o.orderNumber ? '...' : 'İptal Et'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length === 0 && !error && (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            {orders.length === 0 ? 'Henüz sipariş yok.' : 'Sipariş bulunamadı.'}
          </p>
        )}
      </div>
    </div>
  );
}

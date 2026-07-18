import { useState, useEffect, useCallback } from 'react';

// Admin — Ön Sipariş Talepleri. Hangi ürüne kaç kişi "stok gelince haber ver" dedi.
// Üretim/stok kararı için talep sayısına göre sıralı gösterilir.

export default function AdminPreorders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = sessionStorage.getItem('paressilk_admin_token');
      const res = await fetch('/.netlify/functions/list-preorders', {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const d = await res.json();
      if (res.ok) setData(d);
      else setError(d.error || 'Veri alınamadı');
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const card = { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 20 };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Ön Sipariş Talepleri</h1>
        <button onClick={load} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Yenile</button>
      </div>

      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 20 }}>
        "Stok gelince haber ver" diyen müşteriler. Talep sayısı yüksek ürünler üretim/stok önceliğinizdir.
      </p>

      {loading && <div style={{ ...card, textAlign: 'center', color: '#999' }}>Yükleniyor…</div>}
      {error && (
        <div style={{ ...card, background: '#fff5f5', border: '1px solid #f0c0c0', color: '#c62828' }}>
          {error}
          {error.includes('Yetkisiz') && <p style={{ fontSize: '0.8rem', marginTop: 6, color: '#999' }}>Oturumunuz sonlanmış olabilir. Çıkış yapıp tekrar giriş yapın.</p>}
        </div>
      )}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
            <div style={card}>
              <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 6 }}>Toplam Talep</p>
              <p style={{ fontSize: '1.7rem', fontFamily: 'var(--font-heading, serif)' }}>{data.totalDemand}</p>
            </div>
            <div style={card}>
              <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 6 }}>Talep Gören Ürün</p>
              <p style={{ fontSize: '1.7rem', fontFamily: 'var(--font-heading, serif)' }}>{data.products.length}</p>
            </div>
          </div>

          {data.products.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#aaa', padding: '48px 20px' }}>
              Henüz talep yok. Stokta olmayan ürün sayfalarındaki "Stok Gelince Haber Ver" formundan talepler buraya düşer.
            </div>
          ) : (
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px' }}>Ürün</th>
                      <th style={{ padding: '12px 14px' }}>SKU</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Talep</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Bekleyen</th>
                      <th style={{ padding: '12px 14px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map(p => (
                      <>
                        <tr key={p.productId} style={{ borderTop: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 500 }}>{p.productName || p.productId}</td>
                          <td style={{ padding: '12px 14px', color: '#888' }}>{p.productSku || '—'}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{ background: '#F5F0E8', color: 'var(--gold-dark, #B8860B)', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>{p.count}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: p.pending ? '#e65100' : '#999' }}>{p.pending}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              onClick={() => setExpanded(expanded === p.productId ? null : p.productId)}
                              style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.78rem' }}
                            >
                              {expanded === p.productId ? 'Gizle' : 'Kişileri Gör'}
                            </button>
                          </td>
                        </tr>
                        {expanded === p.productId && (
                          <tr>
                            <td colSpan={5} style={{ padding: 0, background: '#fafafa' }}>
                              <div style={{ padding: '12px 14px' }}>
                                {p.requests.map((r, i) => (
                                  <div key={i} style={{ display: 'flex', gap: 16, padding: '6px 0', fontSize: '0.8rem', borderBottom: i < p.requests.length - 1 ? '1px solid #eee' : 'none' }}>
                                    <span style={{ flex: 1 }}>{r.email}</span>
                                    <span style={{ width: 120, color: '#888' }}>{r.phone || '—'}</span>
                                    <span style={{ width: 90, color: r.notified ? '#27ae60' : '#e65100' }}>{r.notified ? 'Bildirildi' : 'Bekliyor'}</span>
                                    <span style={{ width: 90, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

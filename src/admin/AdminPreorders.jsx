import { useState, useEffect, useCallback } from 'react';

// Admin — Ön Sipariş Talepleri. Hangi ürüne kaç kişi "stok gelince haber ver" dedi.
// Üretim/stok kararı için talep sayısına göre sıralı gösterilir.

const SEEN_KEY = 'paressilk_preorders_seen_ts';

export default function AdminPreorders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  // Bir önceki ziyarette görülen en yeni kaydın zamanı — "YENİ" rozetini belirler
  const [seenTs, setSeenTs] = useState(() => Number(localStorage.getItem(SEEN_KEY) || 0));
  // info@'dan mail gönderme (ön siparişçiye)
  const [mailFor, setMailFor] = useState(null);
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailMsg, setMailMsg] = useState('');

  const openMail = (r, key) => {
    setMailFor(key);
    setMailSubject(`Paressilk — ${r.productName || 'Ön Siparişiniz'}`);
    setMailBody(`Merhaba ${r.customerName || ''},\n\nÖn sipariş verdiğiniz "${r.productName || ''}" ürünümüz stoğa girdi! Ön sipariş verdiğiniz için size öncelik tanıyoruz. Sipariş oluşturmak isterseniz bu e-postaya yanıt verebilir ya da sitemizden sipariş verebilirsiniz.\n\nSevgiler,\nParessilk`);
    setMailMsg('');
  };

  const sendMail = async (r) => {
    if (mailSending) return;
    if (!mailSubject.trim() || !mailBody.trim()) { setMailMsg('Konu ve mesaj gerekli.'); return; }
    setMailSending(true); setMailMsg('');
    try {
      const token = sessionStorage.getItem('paressilk_admin_token');
      const res = await fetch('/.netlify/functions/send-customer-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ to: r.email, name: r.customerName, subject: mailSubject, message: mailBody }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Gönderilemedi');
      setMailMsg(`✓ ${r.email} adresine info@paressilk.com'dan gönderildi`);
      setMailFor(null);
    } catch (e) { setMailMsg(e.message || 'Hata'); }
    finally { setMailSending(false); }
  };

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

  // Sayfa görüntülenince en yeni kaydın zamanını "görüldü" olarak işaretle
  useEffect(() => {
    if (data?.recent?.length) {
      const newest = new Date(data.recent[0].createdAt).getTime();
      const prev = Number(localStorage.getItem(SEEN_KEY) || 0);
      if (newest > prev) {
        const t = setTimeout(() => localStorage.setItem(SEEN_KEY, String(newest)), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [data]);

  const newCount = data?.recent?.filter(r => new Date(r.createdAt).getTime() > seenTs).length || 0;

  const card = { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 20 };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          Ön Sipariş Talepleri
          {newCount > 0 && (
            <span style={{ background: '#e53935', color: '#fff', fontSize: '0.75rem', fontWeight: 700, borderRadius: 12, padding: '2px 10px' }}>
              {newCount} yeni
            </span>
          )}
        </h1>
        <button onClick={load} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Yenile</button>
      </div>

      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 20 }}>
        Stokta olmayan ürünler için ön sipariş veren müşteriler (ad, telefon, e-posta, adres). Talep sayısı yüksek ürünler üretim/stok önceliğinizdir.
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

          {/* Bildirim akışı — son gelen ön siparişler */}
          {data.recent?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem' }}>🔔</span> Son Ön Siparişler
              </h2>
              {mailMsg && <p style={{ fontSize: '0.82rem', color: mailMsg.startsWith('✓') ? '#1e7e34' : '#c0392b', margin: '0 0 10px' }}>{mailMsg}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recent.slice(0, 12).map((r, i) => {
                  const isNew = new Date(r.createdAt).getTime() > seenTs;
                  return (
                    <div key={i} style={{
                      ...card, padding: '12px 16px',
                      borderLeft: `3px solid ${isNew ? '#e53935' : '#e0e0e0'}`,
                      background: isNew ? '#fffaf7' : '#fff',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: '0.9rem' }}>{r.customerName || '—'}</strong>
                            {isNew && <span style={{ background: '#e53935', color: '#fff', fontSize: '0.62rem', fontWeight: 700, borderRadius: 8, padding: '1px 7px' }}>YENİ</span>}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 2 }}>
                            <b style={{ color: 'var(--gold-dark, #B8860B)' }}>{r.productName}</b>{r.productSku ? ` · ${r.productSku}` : ''}
                          </div>
                        </div>
                        <div style={{ flex: '1 1 190px', fontSize: '0.76rem', color: '#777', minWidth: 0 }}>
                          <span style={{ color: '#1565c0' }}>{r.email}</span>{r.phone ? ` · ${r.phone}` : ''}
                        </div>
                        <button onClick={() => (mailFor === i ? setMailFor(null) : openMail(r, i))}
                          style={{ border: '1px solid var(--gold, #B8860B)', color: 'var(--gold-dark, #8a6600)', background: '#fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                          ✉ info@'dan Mail
                        </button>
                        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#999', whiteSpace: 'nowrap' }}>
                          <div style={{ color: r.notified ? '#27ae60' : '#e65100', fontWeight: 600 }}>{r.notified ? 'Bildirildi' : 'Bekliyor'}</div>
                          <div>{new Date(r.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      {mailFor === i && (
                        <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
                          <input value={mailSubject} onChange={e => setMailSubject(e.target.value)} placeholder="Konu"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', marginBottom: 8, boxSizing: 'border-box' }} />
                          <textarea value={mailBody} onChange={e => setMailBody(e.target.value)} rows={5}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => setMailFor(null)} style={{ padding: '8px 16px', border: '1px solid #ddd', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>Vazgeç</button>
                            <button onClick={() => sendMail(r)} disabled={mailSending} style={{ padding: '8px 18px', border: 'none', background: 'var(--gold, #B8860B)', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>{mailSending ? 'Gönderiliyor...' : "info@'dan Gönder"}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Ürün Bazında Talep
          </h2>
          {data.products.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#aaa', padding: '48px 20px' }}>
              Henüz talep yok. Stokta olmayan ürün sayfalarındaki "Ön Sipariş Ver" formundan talepler buraya düşer.
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
                                  <div key={i} style={{ padding: '10px 0', fontSize: '0.8rem', borderBottom: i < p.requests.length - 1 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 4 }}>
                                      <strong style={{ minWidth: 140 }}>{r.customerName || '—'}</strong>
                                      <a href={`mailto:${r.email}`} style={{ flex: 1, color: '#1565c0' }}>{r.email}</a>
                                      <a href={`tel:${r.phone}`} style={{ width: 120, color: '#333' }}>{r.phone || '—'}</a>
                                      <span style={{ width: 90, color: r.notified ? '#27ae60' : '#e65100', fontWeight: 600 }}>{r.notified ? 'Bildirildi' : 'Bekliyor'}</span>
                                      <span style={{ width: 80, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    {r.address && <div style={{ color: '#777', fontSize: '0.75rem', paddingLeft: 2 }}>📍 {r.address}{r.note ? ` · Not: ${r.note}` : ''}{r.preorderNumber ? ` · ${r.preorderNumber}` : ''}</div>}
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

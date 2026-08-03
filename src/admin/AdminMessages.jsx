import { useState, useEffect, useCallback } from 'react';

const getToken = () => sessionStorage.getItem('paressilk_admin_token') || '';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/.netlify/functions/list-messages', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Mesajlar alınamadı');
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err.message || 'Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openReply = (m) => {
    setOpenId(m.id);
    setReplyText(m.reply || '');
    setMsg('');
  };

  const sendReply = async (m) => {
    if (sending) return;
    if (!replyText.trim()) { setMsg('Cevap metni boş olamaz.'); return; }
    setSending(true); setMsg('');
    try {
      const res = await fetch('/.netlify/functions/reply-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id: m.id, reply: replyText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Cevap gönderilemedi');
      setMessages(prev => prev.map(x => x.id === m.id
        ? { ...x, status: 'replied', reply: replyText, replied_at: new Date().toISOString() } : x));
      setMsg(`Cevap ${m.email} adresine info@paressilk.com'dan gönderildi ✓`);
      setOpenId(null); setReplyText('');
    } catch (err) {
      setMsg(err.message || 'İşlem başarısız.');
    } finally {
      setSending(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return iso; }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? messages.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q))
    : messages;

  const newCount = messages.filter(m => m.status !== 'replied').length;

  return (
    <div>
      <div className="admin-header">
        <h1>Mesajlar ({messages.length}{newCount ? ` · ${newCount} yeni` : ''})</h1>
        <button className="btn btn--primary" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      <div className="admin-card">
        <input
          type="text"
          placeholder="Ad, e-posta, konu veya mesajda ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', border: '1px solid #ddd', fontSize: '0.85rem', marginBottom: 20 }}
        />

        {msg && <p style={{ color: msg.includes('✓') ? '#1e7e34' : '#c0392b', fontSize: '0.9rem', marginBottom: 16 }}>{msg}</p>}
        {error && <p style={{ textAlign: 'center', padding: 20, color: 'var(--error)' }}>{error}</p>}

        {loading && !messages.length ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            {messages.length === 0 ? 'Henüz mesaj yok.' : 'Mesaj bulunamadı.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(m => (
              <div key={m.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: m.status === 'replied' ? '#fafafa' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.name || '—'} <span style={{ color: '#888', fontWeight: 400, fontSize: '0.85rem' }}>&lt;{m.email}&gt;</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{m.subject}{m.phone ? ` · ${m.phone}` : ''} · {fmtDate(m.created_at)}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, height: 'fit-content',
                    background: m.status === 'replied' ? '#e6f4ea' : '#fdf3e3', color: m.status === 'replied' ? '#1e7e34' : '#a06a00' }}>
                    {m.status === 'replied' ? 'Cevaplandı' : 'Yeni'}
                  </span>
                </div>

                <p style={{ whiteSpace: 'pre-wrap', margin: '12px 0 0', padding: 12, background: '#f7f7f7', borderRadius: 6, fontSize: '0.9rem', lineHeight: 1.6 }}>{m.message}</p>

                {m.status === 'replied' && m.reply && (
                  <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '3px solid var(--gold, #B8860B)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a6600', marginBottom: 4 }}>Cevabınız (info@paressilk.com){m.replied_at ? ` · ${fmtDate(m.replied_at)}` : ''}</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: '#444' }}>{m.reply}</div>
                  </div>
                )}

                {openId === m.id ? (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={4}
                      placeholder={`${m.name || 'Müşteriye'} info@paressilk.com'dan cevap yazın...`}
                      style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setOpenId(null); setReplyText(''); }} style={{ padding: '8px 18px', border: '1px solid #ddd', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>Vazgeç</button>
                      <button onClick={() => sendReply(m)} disabled={sending} className="btn btn--primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                        {sending ? 'Gönderiliyor...' : "info@'dan Gönder"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => openReply(m)} style={{ padding: '7px 16px', border: '1px solid var(--gold, #B8860B)', color: 'var(--gold-dark, #8a6600)', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
                      {m.status === 'replied' ? '↻ Tekrar Cevapla' : '✉ Cevapla'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

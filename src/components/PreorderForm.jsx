import { useState } from 'react';
import { Link } from 'react-router-dom';

// "Stok Gelince Haber Ver" — talep toplama formu (para almaz).
// Ürün detay sayfasında stokta olmayan ürünlerde gösterilir.

export default function PreorderForm({ product }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta adresi giriniz'); return; }
    if (!consent) { setError('Bilgilendirme için onay vermelisiniz'); return; }
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/save-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, email, phone, consent }),
      });
      const data = await res.json();
      if (res.ok && data.ok) setDone(true);
      else setError(data.error || 'Kayıt yapılamadı. Lütfen tekrar deneyin.');
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ marginTop: 24, padding: '20px 24px', background: 'rgba(200,164,86,0.08)', border: '1px solid rgba(200,164,86,0.35)', borderRadius: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <strong style={{ color: '#1A1A1A', fontSize: '0.95rem' }}>Talebiniz alındı</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.7 }}>
          <strong>{product.name}</strong> stoğa girdiğinde size ilk siz haberdar olacaksınız.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, padding: '20px 24px', background: '#F5F0E8', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <strong style={{ fontSize: '0.95rem', color: '#1A1A1A' }}>Stok Gelince Haber Ver</strong>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#777', lineHeight: 1.7, marginBottom: 16 }}>
        Bu ürün geçici olarak tükendi. E-posta adresinizi bırakın, stoğa girer girmez ilk siz öğrenin. Herhangi bir ücret alınmaz.
      </p>

      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email" required placeholder="E-posta adresiniz *"
            value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
            style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
          />
          <input
            type="tel" placeholder="Telefon (opsiyonel, SMS için)"
            value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
            style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '12px 0', cursor: 'pointer', fontSize: '0.75rem', color: '#666', lineHeight: 1.6 }}>
          <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setError(''); }} style={{ accentColor: 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
          <span>
            İletişim bilgilerimin yalnızca stok bildirimi amacıyla işlenmesini onaylıyorum.{' '}
            <Link to="/kvkk" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>KVKK Aydınlatma Metni</Link>
          </span>
        </label>

        {error && <p style={{ color: '#E74C3C', fontSize: '0.8rem', marginBottom: 10 }}>{error}</p>}

        <button
          type="submit" disabled={loading}
          className="btn btn--primary"
          style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Kaydediliyor...' : 'Haber Ver'}
        </button>
      </form>
    </div>
  );
}

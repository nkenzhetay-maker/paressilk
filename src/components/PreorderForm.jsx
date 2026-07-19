import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Ön Sipariş formu — stokta olmayan ürünler için talep + iletişim/teslimat bilgisi.
// PARA ALINMAZ. Giriş yapmış kullanıcının bilgileri ön-doldurulur; misafirden
// ad/soyad/telefon/e-posta/adres istenir. Kayıt sonrası "onaylandı" bildirimi gider.

export default function PreorderForm({ product }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    note: '',
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) { setError('Ad ve soyad giriniz'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Geçerli bir e-posta adresi giriniz'); return; }
    if (!/^0?5\d{9}$/.test(form.phone.replace(/\s/g, ''))) { setError('Geçerli bir telefon numarası giriniz (05XX XXX XX XX)'); return; }
    if (form.address.trim().length < 10) { setError('Teslimat adresi giriniz'); return; }
    if (!consent) { setError('Devam etmek için KVKK onayı gereklidir'); return; }
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/save-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, ...form, kvkkConsent: consent }),
      });
      const data = await res.json();
      if (res.ok && data.preorderNumber) setResult(data);
      else setError(data.error || 'Ön sipariş kaydedilemedi. Lütfen tekrar deneyin.');
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '12px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' };

  if (result) {
    return (
      <div style={{ marginTop: 24, padding: '22px 24px', background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <strong style={{ color: '#1A1A1A', fontSize: '1rem' }}>Ön Siparişiniz Onaylandı</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7, marginBottom: 6 }}>
          <strong>{product.name}</strong> için ön siparişiniz alındı. Ürün stoğa girer girmez size öncelik vererek haber vereceğiz. Bu aşamada herhangi bir ücret alınmamıştır.
        </p>
        <p style={{ fontSize: '0.78rem', color: '#888' }}>Ön Sipariş No: <strong>{result.preorderNumber}</strong></p>
        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '0.75rem', color: '#888' }}>
          {result.emailSent && <span>📧 Onay e-postası gönderildi</span>}
          {result.smsSent && <span>📱 Onay SMS'i gönderildi</span>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, padding: '22px 24px', background: '#F5F0E8', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <strong style={{ fontSize: '0.95rem', color: '#1A1A1A' }}>Ön Sipariş Ver</strong>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#777', lineHeight: 1.7, marginBottom: 16 }}>
        Bu ürün şu an stokta yok. Ön sipariş bırakın, stoğa girer girmez size öncelik verelim. <strong>Şimdi ücret alınmaz.</strong>
        {!user && ' Hesabınız varsa giriş yaparak bilgilerinizi otomatik doldurabilirsiniz.'}
      </p>

      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" required placeholder="Ad *" value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle} />
            <input type="text" required placeholder="Soyad *" value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle} />
          </div>
          <input type="email" required placeholder="E-posta *" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
          <input type="tel" required placeholder="Telefon * (05XX XXX XX XX)" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} />
          <textarea rows="2" required placeholder="Teslimat adresi *" value={form.address} onChange={e => set('address', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
          <textarea rows="2" placeholder="Not (opsiyonel)" value={form.note} onChange={e => set('note', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '12px 0', cursor: 'pointer', fontSize: '0.75rem', color: '#666', lineHeight: 1.6 }}>
          <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setError(''); }} style={{ accentColor: 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
          <span>
            İletişim ve teslimat bilgilerimin ön sipariş sürecinde işlenmesini onaylıyorum.{' '}
            <Link to="/kvkk" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>KVKK Aydınlatma Metni</Link>
          </span>
        </label>

        {error && <p style={{ color: '#E74C3C', fontSize: '0.8rem', marginBottom: 10 }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Gönderiliyor...' : 'Ön Siparişi Onayla'}
        </button>
      </form>
    </div>
  );
}

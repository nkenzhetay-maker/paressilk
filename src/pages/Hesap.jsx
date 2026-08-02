import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';

const STATUS_LABELS = {
  awaiting_payment: 'Ödeme Bekleniyor',
  awaiting_bank_transfer: 'Havale Bekleniyor',
  paid: 'Ödendi', processing: 'Hazırlanıyor', shipped: 'Kargolandı',
  delivered: 'Teslim Edildi', cancelled: 'İptal Edildi',
};

const card = { background: '#fff', border: '1px solid #ececec', borderRadius: 10, padding: 24, marginBottom: 20 };
const h2 = { fontFamily: 'var(--font-heading, serif)', fontSize: '1.15rem', margin: '0 0 18px' };
const label = { display: 'block', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', marginBottom: 4 };
const val = { fontSize: '0.92rem', color: '#222' };
const input = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', background: '#fff' };
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };

export default function Hesap() {
  const { user, token, logout } = useUser();
  const navigate = useNavigate();
  const { items: wishlist } = useWishlist();

  const [customerNo, setCustomerNo] = useState('');
  const [form, setForm] = useState(null);      // düzenlenebilir profil
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [orders, setOrders] = useState(null);

  useEffect(() => { if (!user) navigate('/'); }, [user, navigate]);

  const authFetch = useCallback((path, opts = {}) =>
    fetch(`/.netlify/functions/${path}`, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } }), [token]);

  // Profil + siparişleri yükle
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const r = await authFetch('get-my-profile');
        const d = await r.json();
        if (!alive) return;
        if (r.ok) {
          setCustomerNo(d.customerNo || '');
          setForm({
            firstName: d.profile.firstName || user.firstName || '',
            lastName: d.profile.lastName || user.lastName || '',
            phone: d.profile.phone || '',
            address: d.profile.address || '', city: d.profile.city || '', district: d.profile.district || '', postalCode: d.profile.postalCode || '',
            tcNo: d.profile.tcNo || '',
            invoiceType: d.profile.invoiceType || 'bireysel',
            companyName: d.profile.companyName || '', taxOffice: d.profile.taxOffice || '', taxNo: d.profile.taxNo || '',
            billingSameAsShipping: d.profile.billingSameAsShipping !== false,
            billingAddress: d.profile.billingAddress || '', billingCity: d.profile.billingCity || '', billingDistrict: d.profile.billingDistrict || '', billingPostalCode: d.profile.billingPostalCode || '',
          });
        }
      } catch { /* yoksay */ }
      try {
        const r = await authFetch('list-my-orders');
        const d = await r.json();
        if (alive) setOrders(r.ok ? (d.orders || []) : []);
      } catch { if (alive) setOrders([]); }
    })();
    return () => { alive = false; };
  }, [token, authFetch, user]);

  if (!user || !form) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: '#888' }}>Yükleniyor…</div>;
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const r = await authFetch('save-my-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: form }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Kaydedilemedi');
      setEditing(false); setMsg('Bilgileriniz kaydedildi ✓');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.message); }
    finally { setSaving(false); }
  };

  const fmt = (n, c = 'try') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (c || 'try').toUpperCase() }).format(n);
  const fmtDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const Field = ({ lbl, children }) => (<div><span style={label}>{lbl}</span><div style={val}>{children || '—'}</div></div>);

  return (
    <>
      <Helmet><title>Hesabım | Paressilk</title><meta name="robots" content="noindex" /></Helmet>
      <div className="container" style={{ padding: '48px 20px 80px', maxWidth: 820 }}>
        {/* Başlık + müşteri no */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
          {user.avatar
            ? <img src={user.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} referrerPolicy="no-referrer" />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gold, #B8860B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontFamily: 'var(--font-heading, serif)' }}>{(form.firstName || user.email || '?').charAt(0).toUpperCase()}</div>}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.7rem', margin: 0 }}>Merhaba, {form.firstName || 'Hoş geldiniz'}</h1>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>{user.email}</p>
          </div>
          {customerNo && (
            <div style={{ textAlign: 'right' }}>
              <span style={label}>Müşteri No</span>
              <div style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.05rem', color: 'var(--gold-dark, #8a6600)', letterSpacing: '0.04em' }}>{customerNo}</div>
            </div>
          )}
        </div>

        {msg && <p style={{ color: msg.includes('✓') ? '#1e7e34' : '#c0392b', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</p>}

        {/* Düzenle / Kaydet */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{ padding: '9px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>Vazgeç</button>
              <button onClick={save} disabled={saving} style={{ padding: '9px 24px', border: 'none', background: 'var(--gold, #B8860B)', color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding: '9px 24px', border: '1px solid var(--gold, #B8860B)', color: 'var(--gold-dark, #8a6600)', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>Bilgileri Düzenle</button>
          )}
        </div>

        {/* Kişisel Bilgiler */}
        <div style={card}>
          <h2 style={h2}>Kişisel Bilgiler</h2>
          {editing ? (
            <>
              <div style={row2}>
                <div><span style={label}>Ad</span><input style={input} value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
                <div><span style={label}>Soyad</span><input style={input} value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
              </div>
              <div style={row2}>
                <div><span style={label}>Telefon</span><input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="05XX XXX XX XX" /></div>
                <div><span style={label}>TC Kimlik No</span><input style={input} value={form.tcNo} onChange={e => set('tcNo', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11 haneli" /></div>
              </div>
              <div><span style={label}>E-posta</span><input style={{ ...input, background: '#f5f5f5', color: '#999' }} value={user.email} disabled /></div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field lbl="Ad Soyad">{`${form.firstName} ${form.lastName}`.trim()}</Field>
              <Field lbl="E-posta">{user.email}</Field>
              <Field lbl="Telefon">{form.phone}</Field>
              <Field lbl="TC Kimlik No">{form.tcNo ? form.tcNo.replace(/^(\d{3})\d{5}(\d{3})$/, '$1•••••$2') : ''}</Field>
            </div>
          )}
        </div>

        {/* Teslimat Adresi */}
        <div style={card}>
          <h2 style={h2}>Teslimat Adresi</h2>
          {editing ? (
            <>
              <div style={{ marginBottom: 16 }}><span style={label}>Adres</span><input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Mahalle, cadde, no, daire" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div><span style={label}>İl</span><input style={input} value={form.city} onChange={e => set('city', e.target.value)} /></div>
                <div><span style={label}>İlçe</span><input style={input} value={form.district} onChange={e => set('district', e.target.value)} /></div>
                <div><span style={label}>Posta Kodu</span><input style={input} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} /></div>
              </div>
            </>
          ) : (
            <div style={val}>
              {form.address ? `${form.address}, ${form.district} / ${form.city} ${form.postalCode}` : <span style={{ color: '#aaa' }}>Henüz adres eklenmedi</span>}
            </div>
          )}
        </div>

        {/* Fatura Bilgileri */}
        <div style={card}>
          <h2 style={h2}>Fatura Bilgileri</h2>
          {editing ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <span style={label}>Fatura Tipi</span>
                <select style={input} value={form.invoiceType} onChange={e => set('invoiceType', e.target.value)}>
                  <option value="bireysel">Bireysel</option>
                  <option value="kurumsal">Kurumsal</option>
                </select>
              </div>
              {form.invoiceType === 'kurumsal' && (
                <div style={row2}>
                  <div><span style={label}>Şirket Ünvanı</span><input style={input} value={form.companyName} onChange={e => set('companyName', e.target.value)} /></div>
                  <div><span style={label}>Vergi Dairesi</span><input style={input} value={form.taxOffice} onChange={e => set('taxOffice', e.target.value)} /></div>
                  <div><span style={label}>Vergi No</span><input style={input} value={form.taxNo} onChange={e => set('taxNo', e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', margin: '4px 0 12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.billingSameAsShipping} onChange={e => set('billingSameAsShipping', e.target.checked)} />
                Fatura adresi teslimat adresiyle aynı
              </label>
              {!form.billingSameAsShipping && (
                <>
                  <div style={{ marginBottom: 16 }}><span style={label}>Fatura Adresi</span><input style={input} value={form.billingAddress} onChange={e => set('billingAddress', e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div><span style={label}>İl</span><input style={input} value={form.billingCity} onChange={e => set('billingCity', e.target.value)} /></div>
                    <div><span style={label}>İlçe</span><input style={input} value={form.billingDistrict} onChange={e => set('billingDistrict', e.target.value)} /></div>
                    <div><span style={label}>Posta Kodu</span><input style={input} value={form.billingPostalCode} onChange={e => set('billingPostalCode', e.target.value)} /></div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field lbl="Fatura Tipi">{form.invoiceType === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}</Field>
              {form.invoiceType === 'kurumsal'
                ? <Field lbl="Şirket">{form.companyName}</Field>
                : <Field lbl="Fatura Adresi">{form.billingSameAsShipping ? 'Teslimat adresiyle aynı' : (form.billingAddress || '')}</Field>}
            </div>
          )}
        </div>

        {/* Hızlı bağlantılar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link to="/wishlist" style={{ flex: '1 1 180px', ...card, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.4rem' }}>♥</div><div style={{ fontWeight: 600, marginTop: 6 }}>Favorilerim</div><div style={{ color: '#888', fontSize: '0.82rem' }}>{wishlist?.length || 0} ürün</div>
          </Link>
          <Link to="/shop" style={{ flex: '1 1 180px', ...card, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.4rem' }}>🧵</div><div style={{ fontWeight: 600, marginTop: 6 }}>Alışverişe Devam</div><div style={{ color: '#888', fontSize: '0.82rem' }}>Koleksiyonu keşfet</div>
          </Link>
        </div>

        {/* Siparişlerim */}
        <div style={card}>
          <h2 style={h2}>Siparişlerim</h2>
          {orders === null ? <p style={{ color: '#888', fontSize: '0.9rem' }}>Yükleniyor…</p>
            : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ color: '#888', marginBottom: 12 }}>Henüz siparişiniz yok.</p>
                <Link to="/shop" style={{ background: 'var(--gold, #B8860B)', color: '#fff', padding: '9px 22px', textDecoration: 'none', fontSize: '0.85rem', borderRadius: 6 }}>Alışverişe Başla</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(o => (
                  <div key={o.orderNumber} style={{ border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>#{o.orderNumber}</div><div style={{ color: '#888', fontSize: '0.78rem' }}>{fmtDate(o.createdAt)}</div></div>
                      <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600 }}>{fmt(o.total, o.currency)}</div>
                        <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: (o.status === 'paid' || o.status === 'delivered') ? '#e6f4ea' : '#fdf3e3', color: (o.status === 'paid' || o.status === 'delivered') ? '#1e7e34' : '#a06a00' }}>{STATUS_LABELS[o.status] || o.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '10px 28px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: '0.85rem', borderRadius: 6 }}>Çıkış Yap</button>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Genel Bilgi', message: '' });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/.netlify/functions/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>İletişim | Paressilk</title>
        <meta name="description" content="Paressilk ile iletişime geçin. İpek ürünler, kurumsal siparişler ve özel tasarım talepleriniz için bize ulaşın." />
      </Helmet>

      <div className="shop-page">
        <div className="shop-hero">
          <h1>İletişim</h1>
          <p>Size Nasıl Yardımcı Olabiliriz?</p>
        </div>

        <section className="section">
          <div className="container">
            <div className="contact-grid">
              <div>
                <div className="section__header" style={{ textAlign: 'left', marginBottom: 40 }}>
                  <p className="section__subtitle">Bize Ulaşın</p>
                  <h2 className="section__title" style={{ fontSize: '2rem' }}>Sorularınız İçin</h2>
                </div>

                <div className="contact-info-item">
                  <h4>E-Posta</h4>
                  <p>info@paressilk.com</p>
                </div>
                <div className="contact-info-item">
                  <h4>Telefon & WhatsApp</h4>
                  <p>+90 (533) 485 07 48</p>
                </div>
                <div className="contact-info-item">
                  <h4>Adres</h4>
                  <p>İstanbul, Türkiye</p>
                </div>
                <div className="contact-info-item">
                  <h4>Çalışma Saatleri</h4>
                  <p>Pazartesi - Cumartesi: 09:00 - 18:00</p>
                </div>
                <div className="contact-info-item">
                  <h4>Sosyal Medya</h4>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <a href="https://instagram.com/paressilk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dark)' }}>Instagram</a>
                  </div>
                </div>
              </div>

              <div>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 8 }}>Mesajınız Gönderildi</h3>
                    <p style={{ color: '#666' }}>En kısa sürede size dönüş yapacağız.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <p style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: 16, padding: '8px 12px', background: '#fdf0ef', borderRadius: 4 }}>{error}</p>
                    )}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ad Soyad</label>
                        <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>E-Posta</label>
                        <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Telefon</label>
                      <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Konu</label>
                      <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
                        <option>Genel Bilgi</option>
                        <option>Ürün Bilgisi</option>
                        <option>Kurumsal Sipariş</option>
                        <option>Özel Tasarım</option>
                        <option>İade & Değişim</option>
                        <option>Diğer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mesajınız</label>
                      <textarea rows="5" value={form.message} onChange={e => handleChange('message', e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useProducts } from '../context/ProductContext';

export default function AdminSettings() {
  const { resetProducts } = useProducts();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Ayarlar</h1>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Mağaza Bilgileri</h3>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Mağaza Adı</label>
              <input type="text" defaultValue="Paressilk" />
            </div>
            <div className="form-group">
              <label>E-Posta</label>
              <input type="email" defaultValue="info@paressilk.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefon</label>
              <input type="tel" defaultValue="+90 XXX XXX XX XX" />
            </div>
            <div className="form-group">
              <label>WhatsApp</label>
              <input type="tel" defaultValue="+90 XXX XXX XX XX" />
            </div>
          </div>
          <div className="form-group">
            <label>Adres</label>
            <textarea rows="2" defaultValue="İstanbul, Türkiye" />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input type="text" defaultValue="@paressilk" />
          </div>
          <button type="submit" className="btn btn--primary">
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Kargo Ayarları</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Ücretsiz Kargo Limiti (TRY)</label>
            <input type="number" value={6500} disabled />
          </div>
          <div className="form-group">
            <label>Kargo Ücreti (TRY)</label>
            <input type="number" value={300} disabled />
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
          Şu an aktif değerler: 6500₺ üzeri ücretsiz kargo, altında 300₺.
          Bu değerleri değiştirmek için lütfen geliştiriciye bildirin (site genelinde ve ödeme akışında güncellenir).
        </p>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20 }}>Veri Yönetimi</h3>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 16 }}>Ürün verilerini varsayılan haline sıfırlayabilirsiniz.</p>
        <button
          onClick={() => { if (window.confirm('Tüm ürün verileri varsayılana sıfırlanacak. Emin misiniz?')) resetProducts(); }}
          className="btn btn--outline"
          style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
        >
          Ürünleri Sıfırla
        </button>
      </div>
    </div>
  );
}

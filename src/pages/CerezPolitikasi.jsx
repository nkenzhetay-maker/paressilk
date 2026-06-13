import { Helmet } from 'react-helmet-async';

export default function CerezPolitikasi() {
  return (
    <>
      <Helmet>
        <title>Çerez Politikası | Paressilk</title>
        <meta name="description" content="Paressilk Çerez Politikası - Web sitemizde kullanılan çerezler hakkında bilgilendirme." />
      </Helmet>
      <div className="shop-page">
        <div className="shop-hero">
          <h1>Çerez Politikası</h1>
          <p>Cookie Policy</p>
        </div>
        <section className="section">
          <div className="container" style={{ maxWidth: 800 }}>
            <div style={{ fontSize: '0.9rem', lineHeight: 2, color: '#444' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: 16 }}>Çerez Nedir?</h3>
              <p>Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza (bilgisayar, tablet veya telefon) yerleştirilen küçük metin dosyalarıdır. Çerezler, web sitesinin düzgün çalışmasını sağlamak, kullanıcı deneyimini iyileştirmek ve site trafiğini analiz etmek amacıyla kullanılmaktadır.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Kullandığımız Çerez Türleri</h3>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '20px 0 8px' }}>Zorunlu Çerezler</h4>
              <p>Bu çerezler, web sitesinin temel fonksiyonlarının çalışması için gereklidir. Sepet bilgileri, oturum yönetimi ve güvenlik gibi işlevler bu çerezler aracılığıyla sağlanır. Bu çerezler olmadan site düzgün çalışamaz.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0 24px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Çerez Adı</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Amaç</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Süre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 12px' }}>paressilk_cart</td>
                    <td style={{ padding: '8px 12px' }}>Alışveriş sepeti bilgileri</td>
                    <td style={{ padding: '8px 12px' }}>Kalıcı</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 12px' }}>paressilk_cookie_consent</td>
                    <td style={{ padding: '8px 12px' }}>Çerez tercih bilgisi</td>
                    <td style={{ padding: '8px 12px' }}>1 yıl</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 12px' }}>paressilk_splash_seen</td>
                    <td style={{ padding: '8px 12px' }}>Açılış animasyonu kontrolü</td>
                    <td style={{ padding: '8px 12px' }}>Oturum</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '20px 0 8px' }}>Analitik Çerezler</h4>
              <p>Bu çerezler, ziyaretçilerin web sitemizi nasıl kullandığını anlamamıza yardımcı olur. Toplanan bilgiler anonim olup, site performansını iyileştirmek için kullanılır. Bu çerezler yalnızca onayınızla kullanılır.</p>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '20px 0 8px' }}>Pazarlama Çerezleri</h4>
              <p>Bu çerezler, size ilgi alanlarınıza uygun reklamlar göstermek amacıyla kullanılabilir. Üçüncü taraf hizmet sağlayıcıları tarafından yerleştirilebilir. Bu çerezler yalnızca onayınızla kullanılır.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Çerez Tercihlerinizi Yönetme</h3>
              <p>Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilir veya silebilirsiniz. Ancak zorunlu çerezlerin devre dışı bırakılması, web sitesinin bazı fonksiyonlarının çalışmamasına neden olabilir.</p>
              <p style={{ marginTop: 12 }}>Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Sayfanın alt kısmındaki "Çerez Ayarları" bağlantısını kullanarak tercihlerinizi güncelleyebilirsiniz.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>Üçüncü Taraf Çerezleri</h3>
              <p>Web sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:</p>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li><strong>Stripe:</strong> Güvenli ödeme işlemleri için</li>
                <li><strong>Google Fonts:</strong> Yazı tipi sağlama</li>
              </ul>
              <p>Bu hizmetlerin kendi çerez ve gizlilik politikaları bulunmaktadır.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>İletişim</h3>
              <p>Çerez politikamız hakkında sorularınız için <strong>info@paressilk.com</strong> adresinden bize ulaşabilirsiniz.</p>
              <p style={{ marginTop: 24, color: '#999', fontSize: '0.82rem' }}>Son güncelleme: Haziran 2026</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

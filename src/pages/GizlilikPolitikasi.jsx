import { Helmet } from 'react-helmet-async';

const H = ({ children, first }) => (
  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: first ? '0 0 16px' : '32px 0 16px' }}>{children}</h3>
);

export default function GizlilikPolitikasi() {
  return (
    <>
      <Helmet>
        <title>Gizlilik Politikası | Paressilk</title>
        <meta name="description" content="Paressilk Gizlilik Politikası - Kişisel verilerinizin toplanması, kullanımı ve korunması hakkında." />
      </Helmet>
      <div className="shop-page">
        <div className="shop-hero">
          <h1>Gizlilik Politikası</h1>
          <p>Verilerinizin Güvenliği Bizim İçin Önemli</p>
        </div>
        <section className="section">
          <div className="container" style={{ maxWidth: 800 }}>
            <div style={{ fontSize: '0.9rem', lineHeight: 2, color: '#444' }}>
              <p style={{ marginBottom: 8, color: '#888' }}>Son güncelleme: Ağustos 2026</p>

              <H first>1. Giriş</H>
              <p>Paressilk olarak gizliliğinize saygı duyuyoruz. Bu Gizlilik Politikası, paressilk.com'u kullandığınızda hangi kişisel verilerinizi topladığımızı, bu verileri nasıl kullandığımızı, kimlerle paylaştığımızı ve haklarınızı açıklar. Kişisel verilerin işlenmesine ilişkin detaylı bilgi için <a href="/kvkk" style={{ color: 'var(--gold-dark)' }}>KVKK Aydınlatma Metni</a>'ni de inceleyebilirsiniz.</p>

              <H>2. Topladığımız Veriler</H>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li><strong>Hesap bilgileri:</strong> ad, soyad, e-posta, telefon, teslimat ve fatura adresi, TC Kimlik No (fatura için)</li>
                <li><strong>Sipariş bilgileri:</strong> satın alınan ürünler, tutar, sipariş geçmişi</li>
                <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, çerez verileri, site kullanım istatistikleri</li>
                <li><strong>İletişim:</strong> form ve e-posta yoluyla ilettiğiniz mesajlar</li>
              </ul>

              <H>3. Verileri Kullanma Amaçlarımız</H>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Siparişlerinizi işlemek, hazırlamak ve teslim etmek</li>
                <li>Fatura düzenlemek ve yasal yükümlülükleri yerine getirmek</li>
                <li>Hesabınızı yönetmek ve müşteri desteği sağlamak</li>
                <li>Açık rızanız varsa kampanya ve fırsatlardan haberdar etmek</li>
                <li>Site güvenliğini ve deneyimini iyileştirmek</li>
              </ul>

              <H>4. Verilerin Paylaşımı</H>
              <p>Kişisel verileriniz yalnızca hizmetin sunulması için gerekli olan üçüncü taraflarla paylaşılır: kargo firmaları (teslimat için), ödeme sağlayıcıları (Stripe / banka — kart bilgileriniz tarafımızca saklanmaz), e-posta altyapısı (Resend) ve barındırma/veritabanı sağlayıcıları (Netlify, Supabase). Verileriniz pazarlama amacıyla üçüncü taraflara satılmaz.</p>

              <H>5. Çerezler</H>
              <p>Sitemiz zorunlu ve isteğe bağlı çerezler kullanır. Çerez tercihlerinizi site girişindeki çerez bildiriminden yönetebilirsiniz. Detaylar için <a href="/cerez-politikasi" style={{ color: 'var(--gold-dark)' }}>Çerez Politikası</a>'na bakınız.</p>

              <H>6. Veri Güvenliği ve Saklama</H>
              <p>Verileriniz güvenli sunucularda, erişim kısıtlamalı olarak saklanır. Ödeme kartı bilgileri sitemizde tutulmaz. Verileriniz, işlenme amacının gerektirdiği ve yasal saklama sürelerinin öngördüğü süre boyunca saklanır; sürenin sonunda silinir veya anonim hale getirilir.</p>

              <H>7. Haklarınız</H>
              <p>KVKK kapsamında; verilerinize erişme, düzeltilmesini veya silinmesini isteme, işlenmesine itiraz etme ve rızanızı geri çekme haklarına sahipsiniz. Taleplerinizi <a href="mailto:info@paressilk.com" style={{ color: 'var(--gold-dark)' }}>info@paressilk.com</a> adresine iletebilirsiniz.</p>

              <H>8. İletişim</H>
              <p>Gizlilikle ilgili sorularınız için: <a href="mailto:info@paressilk.com" style={{ color: 'var(--gold-dark)' }}>info@paressilk.com</a></p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

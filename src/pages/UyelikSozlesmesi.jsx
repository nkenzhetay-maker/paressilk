import { Helmet } from 'react-helmet-async';

const H = ({ children, first }) => (
  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: first ? '0 0 16px' : '32px 0 16px' }}>{children}</h3>
);

export default function UyelikSozlesmesi() {
  return (
    <>
      <Helmet>
        <title>Üyelik Sözleşmesi | Paressilk</title>
        <meta name="description" content="Paressilk Üyelik Sözleşmesi - Site üyeliği kullanım koşulları." />
      </Helmet>
      <div className="shop-page">
        <div className="shop-hero">
          <h1>Üyelik Sözleşmesi</h1>
          <p>Site Kullanım Koşulları</p>
        </div>
        <section className="section">
          <div className="container" style={{ maxWidth: 800 }}>
            <div style={{ fontSize: '0.9rem', lineHeight: 2, color: '#444' }}>
              <p style={{ marginBottom: 8, color: '#888' }}>Son güncelleme: Ağustos 2026</p>

              <H first>1. Taraflar ve Konu</H>
              <p>İşbu Üyelik Sözleşmesi, paressilk.com ("Site") ile Site'ye üye olan kullanıcı ("Üye") arasında, üyeliğin koşullarını düzenlemek amacıyla akdedilmiştir. Üye, kayıt işlemini tamamlayarak bu sözleşmeyi kabul etmiş sayılır.</p>

              <H>2. Üyelik</H>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Üyelik için verilen bilgilerin doğru ve güncel olması Üye'nin sorumluluğundadır.</li>
                <li>Hesap güvenliği (şifre gizliliği) Üye'ye aittir.</li>
                <li>18 yaşından küçükler ancak yasal temsilcilerinin izniyle üye olabilir.</li>
                <li>Üye, hesabını dilediği zaman kapatma hakkına sahiptir.</li>
              </ul>

              <H>3. Üyenin Yükümlülükleri</H>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Site'yi yasalara ve genel ahlaka uygun kullanmak</li>
                <li>Başkalarının haklarını ihlal edecek işlemlerde bulunmamak</li>
                <li>Site altyapısına zarar verecek girişimlerden kaçınmak</li>
              </ul>

              <H>4. Siparişler ve Ödeme</H>
              <p>Sipariş ve teslimat koşulları için <a href="/mesafeli-satis" style={{ color: 'var(--gold-dark)' }}>Mesafeli Satış Sözleşmesi</a>, iade koşulları için <a href="/iade-politikasi" style={{ color: 'var(--gold-dark)' }}>İade Politikası</a> geçerlidir.</p>

              <H>5. Kişisel Veriler</H>
              <p>Üye'nin kişisel verileri <a href="/kvkk" style={{ color: 'var(--gold-dark)' }}>KVKK Aydınlatma Metni</a> ve <a href="/gizlilik-politikasi" style={{ color: 'var(--gold-dark)' }}>Gizlilik Politikası</a> kapsamında işlenir.</p>

              <H>6. Fikri Mülkiyet</H>
              <p>Site'deki tüm içerik, tasarım ve markalar Paressilk'e aittir; izinsiz kullanılamaz.</p>

              <H>7. Sözleşme Değişiklikleri ve Fesih</H>
              <p>Paressilk, işbu sözleşmeyi güncelleme hakkını saklı tutar. Üye, koşulları ihlal etmesi halinde üyeliğinin askıya alınabileceğini veya sonlandırılabileceğini kabul eder.</p>

              <H>8. İletişim</H>
              <p>Sorularınız için: <a href="mailto:info@paressilk.com" style={{ color: 'var(--gold-dark)' }}>info@paressilk.com</a></p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

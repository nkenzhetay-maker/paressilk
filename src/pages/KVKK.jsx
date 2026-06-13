import { Helmet } from 'react-helmet-async';

export default function KVKK() {
  return (
    <>
      <Helmet>
        <title>KVKK Aydınlatma Metni | Paressilk</title>
        <meta name="description" content="Paressilk KVKK Aydınlatma Metni - Kişisel verilerin korunması hakkında bilgilendirme." />
      </Helmet>
      <div className="shop-page">
        <div className="shop-hero">
          <h1>KVKK Aydınlatma Metni</h1>
          <p>Kişisel Verilerin Korunması</p>
        </div>
        <section className="section">
          <div className="container" style={{ maxWidth: 800 }}>
            <div style={{ fontSize: '0.9rem', lineHeight: 2, color: '#444' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: 16 }}>1. Veri Sorumlusu</h3>
              <p>Paressilk ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel verilerinizin korunmasına büyük önem vermekteyiz. İşbu aydınlatma metni, kişisel verilerinizin işlenme amaçları, hukuki sebepleri, toplanma yöntemleri ve haklarınız hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>2. Toplanan Kişisel Veriler</h3>
              <p>Web sitemiz üzerinden aşağıdaki kişisel verileriniz toplanmaktadır:</p>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Kimlik bilgileri (ad, soyad)</li>
                <li>İletişim bilgileri (e-posta adresi, telefon numarası, adres)</li>
                <li>Sipariş ve işlem bilgileri</li>
                <li>Çerez verileri ve site kullanım bilgileri</li>
                <li>Ödeme bilgileri (kart bilgileri Stripe tarafından işlenir, tarafımızca saklanmaz)</li>
              </ul>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>3. Kişisel Verilerin İşlenme Amaçları</h3>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Siparişlerinizin işlenmesi ve teslimat süreçlerinin yürütülmesi</li>
                <li>Müşteri ilişkileri yönetimi ve iletişim</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Ürün ve hizmetlerimizin geliştirilmesi</li>
                <li>Pazarlama faaliyetleri (onayınız dahilinde)</li>
                <li>Web sitesi güvenliğinin sağlanması</li>
              </ul>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>4. Kişisel Verilerin Aktarılması</h3>
              <p>Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda; kargo şirketleri, ödeme hizmet sağlayıcıları (Stripe), yasal zorunluluk halinde kamu kurum ve kuruluşlarıyla paylaşılabilmektedir.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>5. Kişisel Veri Saklama Süresi</h3>
              <p>Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve yasal saklama süreleri kapsamında muhafaza edilmektedir. Süre sona erdiğinde verileriniz silinir, yok edilir veya anonim hale getirilir.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>6. Veri Güvenliği</h3>
              <p>Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınmaktadır. Ödeme işlemleriniz 256-bit SSL şifreleme ile korunmakta olup, kart bilgileriniz PCI DSS uyumlu Stripe altyapısı tarafından işlenmektedir.</p>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>7. Haklarınız</h3>
              <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
              </ul>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '32px 0 16px' }}>8. İletişim</h3>
              <p>KVKK kapsamındaki taleplerinizi aşağıdaki kanallardan iletebilirsiniz:</p>
              <p style={{ marginTop: 8 }}>
                <strong>E-posta:</strong> kvkk@paressilk.com<br/>
                <strong>Adres:</strong> İstanbul, Türkiye
              </p>
              <p style={{ marginTop: 24, color: '#999', fontSize: '0.82rem' }}>Son güncelleme: Haziran 2026</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

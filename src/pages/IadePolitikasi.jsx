import { Helmet } from 'react-helmet-async';

export default function IadePolitikasi() {
  return (
    <>
      <Helmet>
        <title>İade ve Değişim Politikası | Paressilk</title>
      </Helmet>
      <div className="legal-page">
        <div className="container" style={{ maxWidth: 800, padding: '80px 20px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 32 }}>İade ve Değişim Politikası</h1>

          <div className="legal-content">
            <h2>İade Koşulları</h2>
            <p>Paressilk olarak müşteri memnuniyetini ön planda tutuyoruz. Satın aldığınız ürünleri, teslim tarihinden itibaren <strong>14 gün</strong> içinde koşulsuz olarak iade edebilirsiniz.</p>

            <h2>İade İçin Gerekli Şartlar</h2>
            <ul>
              <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır.</li>
              <li>Ürün etiketi çıkarılmamış olmalıdır.</li>
              <li>Fatura aslı iade edilen ürünle birlikte gönderilmelidir.</li>
              <li>Ürün, hijyen koşullarına uygun şekilde iade edilmelidir.</li>
              <li>Kişiye özel üretilen veya özelleştirilen ürünler iade kapsamı dışındadır.</li>
            </ul>

            <h2>İade Kabul Edilmeyen Durumlar</h2>
            <p>Aşağıdaki durumlarda iade ve değişim talepleri kabul edilmemektedir:</p>
            <ul>
              <li><strong>Leklenme:</strong> Parfüm, makyaj, yiyecek-içecek veya herhangi bir madde ile lekelenmiş ürünler.</li>
              <li><strong>Kullanılma:</strong> Giyilmiş, takılmış veya kullanılmış olduğu tespit edilen ürünler.</li>
              <li><strong>Kirlenme:</strong> Toz, kir, ter veya herhangi bir nedenle kirlenmiş ürünler.</li>
              <li><strong>Hasar görme:</strong> Yırtılmış, sökülmüş, çekilmiş, yanmış veya herhangi bir fiziksel hasara uğramış ürünler.</li>
            </ul>
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
              İpek ürünler hassas yapıda olduğundan, teslim aldığınızda dikkatli bir şekilde kontrol etmenizi ve deneme sırasında parfüm, deodorant gibi maddelerden uzak tutmanızı rica ederiz.
            </p>

            <h2>İade Süreci</h2>
            <ol>
              <li><strong>Bildirim:</strong> İade talebinizi info@paressilk.com adresine veya +90 (533) 485 07 48 numarasına WhatsApp ile bildirin.</li>
              <li><strong>Onay:</strong> İade talebiniz 24 saat içinde değerlendirilir ve onaylanır.</li>
              <li><strong>Kargo:</strong> Onay sonrası ürünü belirtilen adrese kargo ile gönderin. İade kargo ücreti alıcıya aittir.</li>
              <li><strong>Kontrol:</strong> Ürün tarafımıza ulaştıktan sonra 3 iş günü içinde kontrol edilir.</li>
              <li><strong>Geri Ödeme:</strong> Kontrol sonrası 14 gün içinde ödeme iadesi gerçekleştirilir.</li>
            </ol>

            <h2>Değişim</h2>
            <p>Farklı bir ürünle değişim yapmak isterseniz, iade sürecini başlatmanız ve yeni ürün için ayrı sipariş vermeniz gerekmektedir.</p>

            <h2>Hasarlı/Hatalı Ürün</h2>
            <p>Teslim aldığınız ürün hasarlı veya hatalı ise, lütfen teslim tarihinden itibaren 3 gün içinde bizimle iletişime geçin. Bu durumda kargo ücreti tarafımıza aittir ve ürün ücretsiz olarak değiştirilir veya iade edilir.</p>

            <h2>Geri Ödeme Yöntemi</h2>
            <ul>
              <li><strong>Kredi kartı ile ödeme:</strong> İade bedeli, ödeme yapılan kredi kartına iade edilir. Bankanızın iadenizi hesabınıza yansıtması 5-10 iş günü sürebilir.</li>
              <li><strong>Havale/EFT ile ödeme:</strong> İade bedeli, belirttiğiniz banka hesabına havale ile gönderilir.</li>
            </ul>

            <h2>İletişim</h2>
            <p>İade ve değişim konusundaki tüm sorularınız için bize ulaşabilirsiniz:</p>
            <p>E-posta: info@paressilk.com<br />
            Telefon / WhatsApp: +90 (533) 485 07 48<br />
            Çalışma saatleri: Pazartesi - Cumartesi, 09:00 - 18:00</p>
          </div>
        </div>
      </div>
    </>
  );
}

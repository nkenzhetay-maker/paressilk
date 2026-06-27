import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const faqData = [
  {
    category: 'Ürünler',
    items: [
      { q: 'Ürünleriniz %100 doğal ipek mi?', a: 'Evet, tüm ürünlerimiz %100 doğal ipekten el işçiliğiyle üretilmektedir. Sentetik veya karışım malzeme kullanılmamaktadır.' },
      { q: 'Kelaghayi nedir?', a: 'Kelaghayi, UNESCO Somut Olmayan Kültürel Miras Listesi\'nde yer alan geleneksel ipek başörtüsüdür. Doğal ipek üzerine geleneksel baskı teknikleriyle üretilir ve her biri benzersiz bir sanat eseridir.' },
      { q: 'Ürünlerinizin boyutları nedir?', a: 'Her ürünün boyutu ürün sayfasında detaylı olarak belirtilmektedir. Genel olarak kelaghayilerimiz 150x150 cm, eşarplarımız ise 90x180 cm boyutlarındadır.' },
      { q: 'İpek eşarp nasıl bakılır?', a: 'İpek ürünlerimiz için kuru temizleme önerilir. Elde yıkama yapacaksanız soğuk suda, yumuşak deterjan ile yıkayıp gölgede kurutmanız tavsiye edilir. Ütüleme düşük ısıda, ters yüzden yapılmalıdır.' },
    ],
  },
  {
    category: 'Sipariş & Ödeme',
    items: [
      { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Kredi kartı (Visa, Mastercard, Troy) ve havale/EFT ile ödeme kabul ediyoruz. Tüm kart ödemeleri 256-bit SSL şifreleme ile Stripe altyapısı üzerinden güvenle gerçekleştirilir.' },
      { q: 'Siparişimi nasıl takip edebilirim?', a: 'Siparişiniz kargoya verildikten sonra kargo takip numaranız e-posta ile gönderilecektir. Bu numara ile kargo firmasının web sitesinden takip yapabilirsiniz.' },
      { q: 'Sipariş verdikten sonra değişiklik yapabilir miyim?', a: 'Siparişiniz kargoya verilmeden önce bizimle iletişime geçerek değişiklik talep edebilirsiniz. Kargoya verildikten sonra değişiklik yapılamamaktadır.' },
    ],
  },
  {
    category: 'Kargo & Teslimat',
    items: [
      { q: 'Kargo ücreti ne kadar?', a: '1.000 TL ve üzeri siparişlerde kargo ücretsizdir. 1.000 TL altı siparişlerde kargo ücreti 49,90 TL\'dir.' },
      { q: 'Teslimat süresi ne kadar?', a: 'Siparişler 1-5 iş günü içerisinde kargoya verilir. Teslimat süresi bulunduğunuz bölgeye göre 1-3 iş günü arasında değişmektedir.' },
      { q: 'Yurt dışına kargo yapıyor musunuz?', a: 'Şu anda sadece Türkiye içi teslimat yapmaktayız. Yurt dışı kargo için WhatsApp üzerinden bizimle iletişime geçebilirsiniz.' },
    ],
  },
  {
    category: 'İade & Değişim',
    items: [
      { q: 'İade yapabilir miyim?', a: 'Evet, teslim tarihinden itibaren 14 gün içinde koşulsuz iade hakkınız bulunmaktadır. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.' },
      { q: 'İade kargo ücreti kime ait?', a: 'Normal iade işlemlerinde kargo ücreti alıcıya aittir. Hasarlı veya hatalı ürün teslimatlarında kargo ücreti tarafımıza aittir.' },
      { q: 'Geri ödeme ne zaman yapılır?', a: 'Ürün tarafımıza ulaşıp kontrol edildikten sonra 14 gün içinde geri ödeme yapılır. Kredi kartına iade, bankanıza bağlı olarak 5-10 iş günü sürebilir.' },
    ],
  },
  {
    category: 'Kurumsal & Özel Sipariş',
    items: [
      { q: 'Kurumsal hediye siparişi verebilir miyim?', a: 'Evet, kurumsal etkinlikleriniz ve hediyeleriniz için toplu sipariş verebilirsiniz. Özel ambalaj, logo baskısı ve kişiselleştirme seçenekleri mevcuttur. Detaylar için bizimle iletişime geçin.' },
      { q: 'Özel tasarım yaptırabiliyor muyum?', a: 'Özel etiket ve ambalaj tasarımı yapılabilir. Minimum sipariş miktarları için lütfen WhatsApp üzerinden bilgi alın.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid #eee' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.95rem', fontWeight: 500, textAlign: 'left', color: '#1a1a1a',
        }}
      >
        {q}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0, marginLeft: 16 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p style={{ padding: '0 0 20px', color: '#555', fontSize: '0.88rem', lineHeight: 1.8 }}>{a}</p>
      )}
    </div>
  );
}

export default function SSS() {
  return (
    <>
      <Helmet>
        <title>Sıkça Sorulan Sorular | Paressilk</title>
        <meta name="description" content="Paressilk hakkında sıkça sorulan sorular. Ürünler, sipariş, kargo, iade ve kurumsal hizmetler hakkında bilgi edinin." />
      </Helmet>

      <div className="shop-page">
        <div className="shop-hero">
          <h1>Sıkça Sorulan Sorular</h1>
          <p>Merak Ettikleriniz</p>
        </div>

        <section className="section">
          <div className="container" style={{ maxWidth: 800 }}>
            {faqData.map((category, ci) => (
              <div key={ci} style={{ marginBottom: 48 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: 16, color: 'var(--gold-dark)' }}>{category.category}</h2>
                {category.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            ))}

            <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '2px solid var(--gold)', marginTop: 40 }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Sorunuzun cevabını bulamadınız mı?</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn--primary">Bize Yazın</Link>
                <a href="https://wa.me/905334850748" target="_blank" rel="noopener noreferrer" className="btn btn--outline">WhatsApp ile Sorun</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

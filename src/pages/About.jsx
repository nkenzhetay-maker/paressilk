import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>Hakkımızda | Paressilk - %100 Doğal İpek</title>
        <meta name="description" content="Paressilk, Azerbaycan'ın kadim ipek geleneğini Türkiye'nin modern tasarım vizyonuyla buluşturan butik ipek markasıdır. Kurucu: Serap Kabakçı." />
      </Helmet>

      <div className="shop-page">
        <div className="shop-hero">
          <h1>Hikayemiz</h1>
          <p>Hazar'dan Boğaziçi'ne Uzanan İpek Yolu</p>
        </div>

        <section className="section">
          <div className="container">
            <div className="about-section">
              <img src="/images/brand/showroom.jpg" alt="Paressilk Showroom" className="about-section__image" style={{ objectPosition: 'left center' }} />
              <div className="about-section__content">
                <p className="section__subtitle">Pares Felsefesi</p>
                <h3>Bir Ruh Ortaklığı</h3>
                <p style={{ fontStyle: 'italic', color: 'var(--color-gold, #B8860B)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 24 }}>
                  "Gerçek bir 'Pares', sadece yan yana gelen insanlar değil; aynı rüyayı gören, aynı estetiği paylaşan ve sınırları aşarak birbirinin ruhuna dokunanların çemberidir."
                </p>
                <p>
                  Yunan kültüründeki "Pares" kavramı — bir araya gelerek hayatı, sanatı ve güzelliği paylaşan, birbirinin derinliğinden beslenen o seçkin dostluk çemberi — markamızın adına ve ruhuna ilham verdi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--cream">
          <div className="container">
            <div className="about-section about-section--reverse">
              <img src="/images/products/kelaghayi-6.jpg" alt="Şeki İpek Zanaatı" className="about-section__image" style={{ objectPosition: 'right center' }} />
              <div className="about-section__content">
                <p className="section__subtitle">Kurucu</p>
                <h3>Serap Kabakçı</h3>
                <p>
                  Bir sosyolog ve yapımcı olarak, hayatım boyunca insanları birbirine bağlayan o görünmez ipliklerin, ortak duyguların ve kadim kültürlerin peşinden gittim. Bu felsefeyi yanıma alarak yönümü doğuya, İpek Yolu'nun kalbine çevirdim.
                </p>
                <p>
                  Hazar'ın kıyısında, Şeki'nin asırlık çınarlarının altında, ipeğe hayat veren Azerbaycanlı zanaatkarlarla tanıştım. Onların nesiller boyu sabırla dokuduğu saf ipek, Şeki ustalarının emeği, benim için tam anlamıyla bir "Pares" hikayesiydi; bir ruh ortaklığıydı.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="about-section">
              <img src="/images/brand/kultur-kopru.jpg" alt="Azerbaycan ahşap kalıp baskı zanaatı — Sofi ipek kozası ve doğal boyalar" className="about-section__image" style={{ objectPosition: 'left center' }} />
              <div className="about-section__content">
                <p className="section__subtitle">Pares Vizyonu</p>
                <h3>Kültürel Bir Köprü</h3>
                <p>
                  Paressilk, kendini lüks bir kültürel köprü olarak konumlandırır; asırlık Azerbaycan ahşap kalıp baskı tekniklerini üst düzey Türk estetik vizyonuyla birleştiren, sınırlı sayıda üretilen ve numaralandırılmış ipek sanat eserleri sunar.
                </p>
                <p>
                  Parçalarımız sıradan birer aksesuar değildir; miras geleneği ve zarif lüks üzerine inşa edilmiş, klasik ve zamansız bir tasarım anlayışını temsil eden felsefi bir kültürel hareketi yansıtır.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--cream">
          <div className="container">
            <div className="section__header" style={{ textAlign: 'center' }}>
              <p className="section__subtitle">Misyonumuz</p>
              <h2 className="section__title">İki Devlet, Tek İpek İpliği</h2>
              <div className="section__divider" />
            </div>
            <div style={{ maxWidth: 720, margin: '0 auto', lineHeight: 1.9, fontSize: '1rem' }}>
              <p style={{ marginBottom: 20 }}>
                Azerbaycan'ın kadim ipek geleneğini, Türkiye'nin modern tasarım vizyonu ve estetik anlayışıyla buluşturuyoruz. Hazar'ın rüzgarıyla dokunan saf ipekler, Türkiye'deki zanaatkarların el kıvırmaları ve tasarımlarıyla hayat buluyor.
              </p>
              <p style={{ marginBottom: 20 }}>
                Markamız, iki devletin tek bir ipek ipliğinde birleştiği, yaşayan bir kültür köprüsüdür. Pares; Hazar'dan Boğaziçi'ne uzanan, zanaatkarların, tasarımcıların ve bu ipeği üzerinde taşıyan seçkin kadınların oluşturduğu o küresel dostluk ve estetik çemberidir.
              </p>
              <p>
                Biz sadece geleneksel yöntemlerle üretilmiş ipek eşarplar tasarlamıyoruz; sınırları aşan, köklerine sadık ve zarafette buluşan ortak bir ruhu, bir "Pares"i paylaşıyoruz.
              </p>
            </div>
          </div>
        </section>

        <section className="section section--dark" style={{ textAlign: 'center' }}>
          <div className="container">
            <blockquote style={{ fontFamily: 'var(--font-heading, "Playfair Display", serif)', fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: 'var(--color-gold, #B8860B)', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 40px', border: 'none', padding: 0 }}>
              "İpek, sadece bir kumaş değildir; medeniyetleri birbirine bağlayan, sınırları aşan ortak bir hafızadır."
            </blockquote>
            <p style={{ color: '#999', fontSize: '0.9rem', letterSpacing: 1 }}>— Serap Kabakçı, Kurucu</p>
          </div>
        </section>

        <section className="section section--cream">
          <div className="container">
            <div className="section__header">
              <p className="section__subtitle">Değerlerimiz</p>
              <h2 className="section__title">Neden Paressilk?</h2>
              <div className="section__divider" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
              {[
                { title: '%100 Doğal İpek', desc: 'Sentetik veya karışım malzeme kullanmıyoruz. Tüm ürünlerimiz saf doğal ipekten üretilmiştir.' },
                { title: 'El İşçiliği', desc: 'Her parça, usta zanaatkarlar tarafından geleneksel tekniklerle elle üretilir. Hiçbir ürün birbirinin aynısı değildir.' },
                { title: 'UNESCO Mirası', desc: 'Kelaghayi yapım sanatı, UNESCO tarafından korunan somut olmayan kültürel mirastır.' },
                { title: 'Kültür Köprüsü', desc: 'Azerbaycan\'ın kadim zanaat geleneğini Türkiye\'nin modern tasarım vizyonuyla buluşturuyoruz.' },
                { title: 'Özel Tasarım', desc: 'Kurumsal müşterilerimiz için özel logo ve desen baskısı hizmeti sunuyoruz.' },
                { title: 'Premium Ambalaj', desc: 'Her ürün, hediye olarak da verilebilecek özel ambalajında teslim edilir.' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 12 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--dark" style={{ textAlign: 'center' }}>
          <div className="container">
            <p className="section__subtitle">Kurumsal</p>
            <h2 className="section__title" style={{ color: 'white', maxWidth: 600, margin: '0 auto 20px' }}>Özel Tasarım İpek Ürünler</h2>
            <p style={{ color: '#999', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.8 }}>
              Şirket etkinlikleri, düğünler, kına geceleri ve özel organizasyonlar için kurumsal ipek çözümler sunuyoruz.
            </p>
            <Link to="/contact" className="btn btn--white">Teklif Alın</Link>
          </div>
        </section>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>Hakkımızda | Paressilk - %100 Doğal İpek</title>
        <meta name="description" content="Paressilk, Azerbaycan'ın UNESCO korumalı kelaghayi geleneğini Türkiye'ye taşıyan butik ipek markasıdır. %100 el yapımı doğal ipek ürünler." />
      </Helmet>

      <div className="shop-page">
        <div className="shop-hero">
          <h1>Hikayemiz</h1>
          <p>İpek Geleneğinin Modern Yorumu</p>
        </div>

        <section className="section">
          <div className="container">
            <div className="about-section">
              <img src="/images/products/kelaghayi-1.jpg" alt="Paressilk Hikaye" className="about-section__image" />
              <div className="about-section__content">
                <p className="section__subtitle">Markamız</p>
                <h3>Paressilk</h3>
                <p>
                  Paressilk, Azerbaycan'ın kadim ipek geleneğini Türkiye ve dünyaya tanıtmak amacıyla kurulmuş bir butik ipek markasıdır. Her ürünümüz, %100 doğal ipekten, usta zanaatkarların ellerinde hayat bulur.
                </p>
                <p>
                  Kelaghayi — Azerbaycan'ın UNESCO Somut Olmayan Kültürel Miras Listesi'nde yer alan geleneksel ipek başörtüsü — markamızın temelini oluşturur. Bu kadim sanatı, modern tasarımlarla harmanlayarak zamansız parçalar yaratıyoruz.
                </p>
              </div>
            </div>
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
                { title: 'Sürdürülebilir Üretim', desc: 'Doğal boyalar ve çevre dostu üretim süreçleri ile sürdürülebilir moda anlayışını benimsiyoruz.' },
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

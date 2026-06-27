import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

function HomeProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="home-product">
      <Link to={`/product/${product.id}`} className="home-product__link">
        <div className="home-product__image-wrap">
          <img
            src={product.images?.[0] || '/images/products/kelaghayi-1.jpg'}
            alt={product.name}
            className="home-product__image"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="home-product__info">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="home-product__name">{product.name}</h3>
        </Link>
        <p className="home-product__price">{formatPrice(product.price)}</p>
        <p className="home-product__desc">{product.description}</p>
        <button
          className="home-product__cart-btn"
          onClick={() => addItem(product)}
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('success');
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Bir hata oluştu');
    }
  };

  if (status === 'success') {
    return <p style={{ color: '#27ae60', fontSize: '0.95rem' }}>{message}</p>;
  }

  return (
    <>
      <form className="newsletter__form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-posta adresiniz"
          className="newsletter__input"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" className="newsletter__btn" disabled={status === 'loading'}>
          {status === 'loading' ? 'Kaydediliyor...' : 'Abone Ol'}
        </button>
      </form>
      {status === 'error' && <p style={{ color: '#e74c3c', fontSize: '0.82rem', marginTop: 8 }}>{message}</p>}
    </>
  );
}

export default function Home() {
  const { products, getByCategory } = useProducts();
  const kelaghayi = getByCategory('kelaghayi');
  const scarves = getByCategory('scarves');

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__overlay" />
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/products/kelaghayi-1.jpg"
          className="hero__video"
        >
          <source src="/videos/hero-collage.mp4" type="video/mp4" />
        </video>
        <div className="hero__content fade-in">
          <p className="hero__subtitle">%100 El Yapımı Doğal İpek</p>
          <h1 className="hero__title">Zarafetin İpek Dokunuşu</h1>
          <p className="hero__description">
            Yüzyıllık ipek geleneğini keşfedin. Her parça, ustalıkla el işçiliğiyle üretilmiş benzersiz bir sanat eseridir.
          </p>
          <Link to="/shop" className="hero__cta">Koleksiyonu Keşfet</Link>
        </div>
      </section>

      {/* Products Grid - aeneis style */}
      <section className="section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Koleksiyon</p>
            <h2 className="section__title">Tüm Ürünler</h2>
            <div className="section__divider" />
          </div>
          <div className="home-products-grid">
            {products.filter(p => p.inStock).map(product => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section section--cream">
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Koleksiyonlar</p>
            <h2 className="section__title">Kategoriler</h2>
            <div className="section__divider" />
          </div>
          <div className="categories-grid">
            <Link to="/shop?category=kelaghayi" className="category-card">
              <img src="/images/products/kelaghayi-2.jpg" alt="Kelaghayi" className="category-card__image" />
              <div className="category-card__overlay">
                <h3 className="category-card__title">Kelaghayi</h3>
                <span className="category-card__count">{kelaghayi.length} Ürün</span>
              </div>
            </Link>
            <Link to="/shop?category=scarves" className="category-card">
              <img src="/images/products/scarf-1.jpg" alt="Eşarplar" className="category-card__image" />
              <div className="category-card__overlay">
                <h3 className="category-card__title">Eşarplar</h3>
                <span className="category-card__count">{scarves.length} Ürün</span>
              </div>
            </Link>
            <Link to="/shop?category=chitme" className="category-card">
              <img src="/images/products/kelaghayi-6.jpg" alt="Chitme" className="category-card__image" />
              <div className="category-card__overlay">
                <h3 className="category-card__title">Chitme</h3>
                <span className="category-card__count">Yakında</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <div className="container">
          <div className="about-section">
            <img src="/images/products/kelaghayi-3.jpg" alt="Paressilk Atölye" className="about-section__image" />
            <div className="about-section__content">
              <p className="section__subtitle">Hikayemiz</p>
              <h3>Yüzyıllık İpek Geleneği</h3>
              <p>
                Paressilk, UNESCO tarafından koruma altına alınan kelaghayi geleneğini modern dünyaya taşımaktadır. Her ürünümüz, doğal ipekten el işçiliğiyle üretilir ve kuşaktan kuşağa aktarılan teknikleri yaşatır.
              </p>
              <p>
                Koleksiyonlarımız, geleneksel desenlerin çağdaş yorumlarını sunar. İpek eşarplarımız, kelaghayilerimiz ve özel tasarım ürünlerimiz, her biri kendine özgü bir hikaye anlatır.
              </p>
              <Link to="/about" className="btn btn--outline" style={{ marginTop: 24 }}>Daha Fazla</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate */}
      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Kurumsal Çözümler</p>
            <h2 className="section__title" style={{ color: 'white' }}>Özel Tasarım Hizmetleri</h2>
            <div className="section__divider" />
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#999', marginBottom: 32 }}>
              Kurumsal etkinlikleriniz, organizasyonlarınız veya özel günleriniz için kişiye özel ipek ürünler tasarlıyoruz. Logo baskısı, özel desen ve ambalaj seçenekleri ile markanızı ipekle buluşturun.
            </p>
            <Link to="/contact" className="btn btn--white">İletişime Geçin</Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <h3>Koleksiyonlardan Haberdar Olun</h3>
        <p>Yeni ürünler, özel indirimler ve daha fazlası için bültenimize abone olun.</p>
        <NewsletterForm />
      </section>
    </>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { getProduct, getByCategory } = useProducts();
  const { addItem } = useCart();
  const product = getProduct(id);
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  if (!product) {
    return (
      <div className="product-detail">
        <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 16 }}>Ürün Bulunamadı</h2>
          <Link to="/shop" className="btn btn--outline">Mağazaya Dön</Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  const related = getByCategory(product.category).filter(p => p.id !== product.id).slice(0, 3);

  const categoryLabels = {
    kelaghayi: 'Kelaghayi',
    scarves: 'Eşarplar',
    chitme: 'Chitme',
    'raw-silk': 'Ham İpek',
    carpet: 'Halılar',
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Paressilk</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | Paressilk`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images?.[0]} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images?.[0],
          brand: { "@type": "Brand", name: "Paressilk" },
          offers: {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: product.price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        })}</script>
      </Helmet>

      <div className="product-detail">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Ana Sayfa</Link> / <Link to="/shop">Koleksiyon</Link> / <Link to={`/shop?category=${product.category}`}>{categoryLabels[product.category]}</Link> / <span>{product.name}</span>
          </div>

          <div className="product-detail__grid">
            <div className="product-gallery">
              <div className="product-gallery__main">
                {showVideo && product.video ? (
                  <video
                    src={product.video}
                    controls
                    autoPlay
                    className="product-gallery__video"
                  />
                ) : (
                  <img
                    src={product.images?.[activeImage] || '/images/products/kelaghayi-1.jpg'}
                    alt={`${product.name} - ${activeImage + 1}`}
                    className="product-detail__image"
                  />
                )}
              </div>
              {(product.images?.length > 1 || product.video) && (
                <div className="product-gallery__thumbs">
                  {product.images?.map((img, i) => (
                    <button
                      key={i}
                      className={`product-gallery__thumb ${!showVideo && activeImage === i ? 'product-gallery__thumb--active' : ''}`}
                      onClick={() => { setActiveImage(i); setShowVideo(false); }}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                  {product.video && (
                    <button
                      className={`product-gallery__thumb ${showVideo ? 'product-gallery__thumb--active' : ''}`}
                      onClick={() => setShowVideo(true)}
                    >
                      <div className="product-gallery__thumb-video">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--gold)">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="product-detail__info">
              <p className="product-detail__category">{categoryLabels[product.category]}</p>
              <h1 className="product-detail__name">{product.name}</h1>
              <p className="product-detail__price">{formatPrice(product.price)}</p>
              <p className="product-detail__description">{product.description}</p>

              {product.details && (
                <div className="product-detail__specs">
                  {Object.entries(product.details).map(([key, value]) => (
                    <div key={key} className="product-detail__spec">
                      <span className="product-detail__spec-label">{key === 'material' ? 'Malzeme' : key === 'dimensions' ? 'Boyut' : key === 'origin' ? 'Menşei' : key === 'care' ? 'Bakım' : key === 'customization' ? 'Kişiselleştirme' : key}</span>
                      <span className="product-detail__spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="product-detail__actions">
                <button className="btn btn--primary" onClick={() => addItem(product)} disabled={!product.inStock}>
                  {product.inStock ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
                <a href={`https://wa.me/905334850748?text=Merhaba%2C%20${encodeURIComponent(product.name)}%20hakkında%20bilgi%20almak%20istiyorum.`} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                  WhatsApp ile Sor
                </a>
              </div>

              <div style={{ marginTop: 32, padding: 20, background: '#F5F0E8', fontSize: '0.82rem', lineHeight: 1.8 }}>
                <p><strong>Ücretsiz Kargo:</strong> 1000 TL üzeri siparişlerde</p>
                <p><strong>Güvenli Ödeme:</strong> Kredi kartı & havale</p>
                <p><strong>İade:</strong> 14 gün koşulsuz iade</p>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="section" style={{ paddingTop: 60 }}>
              <div className="section__header">
                <p className="section__subtitle">Beğenebileceğiniz</p>
                <h2 className="section__title">Benzer Ürünler</h2>
                <div className="section__divider" />
              </div>
              <div className="products-grid">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

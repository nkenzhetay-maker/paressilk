import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { getProduct, getByCategory } = useProducts();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const product = getProduct(id);
  const liked = product ? isInWishlist(product.id) : false;
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
    'yeni-koleksiyon': 'Yeni Koleksiyon',
    kelaghayi: 'Kelaghayi',
    scarves: 'Eşarplar',
    chitme: 'Chitme',
    'raw-silk': 'Ham İpek',
    carpet: 'Halılar',
    'hediye-seti': 'Hediye Setleri',
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
              {product.sku && <p style={{ fontSize: '0.78rem', color: '#999', letterSpacing: '0.1em', marginBottom: 8 }}>SKU: {product.sku}</p>}
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
                <button
                  className="btn btn--outline"
                  onClick={() => toggleItem(product)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#e74c3c' : 'none'} stroke={liked ? '#e74c3c' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  {liked ? 'Favorilerde' : 'Favorilere Ekle'}
                </button>
                <a href={`https://wa.me/905334850748?text=Merhaba%2C%20${encodeURIComponent(product.name)}%20hakkında%20bilgi%20almak%20istiyorum.`} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                  WhatsApp ile Sor
                </a>
              </div>

              {/* Limitli Üretim Sayacı */}
              <div style={{ marginTop: 24, padding: '16px 20px', border: '1px solid rgba(200,164,86,0.3)', background: 'rgba(200,164,86,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #C8A456', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C8A456', letterSpacing: '0.05em' }}>LTD</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>Limitli Üretim</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>Bu desenden yalnızca <strong style={{ color: '#C8A456' }}>50 adet</strong> üretilmiştir. Her parça benzersiz üretim numarasıyla teslim edilir.</p>
                </div>
              </div>

              {/* Orijinallik Sertifikası */}
              <div style={{ marginTop: 16, padding: '16px 20px', border: '1px solid rgba(200,164,86,0.3)', background: 'rgba(200,164,86,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A456" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A' }}>Orijinallik Sertifikası</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.7 }}>
                  Her ürün, Azerbaycan Kültür Bakanlığı tarafından tescilli usta isimleriyle birlikte orijinallik sertifikasıyla teslim edilir. Sertifika üzerindeki QR kod ile ürün doğrulaması yapılabilir.
                </p>
              </div>

              {/* Premium Ambalaj */}
              <div style={{ marginTop: 16, padding: '16px 20px', border: '1px solid rgba(200,164,86,0.3)', background: 'rgba(200,164,86,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A456" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A' }}>Premium Hediye Ambalajı</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.7 }}>
                  Kadife kutu içerisinde, ipek koruma kağıdıyla sarılı olarak teslim edilir. Her kutu içerisinde el yazısıyla yazılmış teşekkür kartı ve bakım kılavuzu bulunur.
                </p>
              </div>

              {/* UNESCO Hikayesi */}
              <div style={{ marginTop: 16, padding: '16px 20px', border: '1px solid rgba(200,164,86,0.3)', background: 'rgba(200,164,86,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A456" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                  </svg>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1A1A' }}>UNESCO Somut Olmayan Kültürel Miras</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.7 }}>
                  Kelaghayi, 2014 yılında UNESCO Somut Olmayan Kültürel Miras Listesi'ne alınmıştır. Azerbaycan'ın Şeki şehrinde, nesillerdir süregelen geleneksel tekniklerle, doğal ipekten el işçiliğiyle üretilmektedir. Her desen, yüzyıllık Kafkas motiflerini taşır.
                </p>
              </div>

              <div style={{ marginTop: 24, padding: 20, background: '#F5F0E8', fontSize: '0.82rem', lineHeight: 1.8 }}>
                <p><strong>Ücretsiz Kargo:</strong> 1000 TL üzeri siparişlerde</p>
                <p><strong>Güvenli Ödeme:</strong> Kredi kartı & havale</p>
                <p><strong>İade:</strong> 14 gün iade (kullanılmamış, leklenmemiş, hasarsız)</p>
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

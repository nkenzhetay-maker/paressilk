import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import PreorderForm from '../components/PreorderForm';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, getByCategory } = useProducts();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const product = getProduct(id);
  const liked = product ? isInWishlist(product.id) : false;
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const imageList = product?.images?.length ? product.images : ['/images/products/kelaghayi-1.jpg'];
  const openZoom = () => { setZoomed(false); setZoomOpen(true); };
  const prevZoom = (e) => { e.stopPropagation(); setActiveImage(i => (i - 1 + imageList.length) % imageList.length); setZoomed(false); };
  const nextZoom = (e) => { e.stopPropagation(); setActiveImage(i => (i + 1) % imageList.length); setZoomed(false); };

  if (!product || product.active === false) {
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
    kelaghayi: 'Kelağayı',
    scarves: 'Eşarplar',
    chitme: 'Çitme',
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
                  <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={openZoom} title="Yakınlaştırmak için tıklayın">
                    <img
                      src={product.images?.[activeImage] || '/images/products/kelaghayi-1.jpg'}
                      alt={`${product.name} - ${activeImage + 1}`}
                      className="product-detail__image"
                    />
                    <span style={{
                      position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(26,26,26,0.72)', color: '#fff', padding: '6px 10px', borderRadius: 20,
                      fontSize: '0.72rem', letterSpacing: '0.03em', pointerEvents: 'none',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Yakınlaştır
                    </span>
                  </div>
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
                {product.inStock ? (
                  <>
                    <button className="btn btn--primary" onClick={() => addItem(product)}>
                      Sepete Ekle
                    </button>
                    <button
                      className="btn"
                      onClick={() => { addItem(product); navigate('/checkout'); }}
                      style={{ background: '#1A1A1A', color: '#C8A456', border: '1px solid #1A1A1A' }}
                    >
                      Hemen Al
                    </button>
                  </>
                ) : (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: 'rgba(200,164,86,0.12)', border: '1px solid var(--gold)',
                    borderRadius: 4, color: 'var(--gold-dark)', fontSize: '0.82rem',
                    fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                    Yakında Stokta · Ön Sipariş Alınıyor
                  </div>
                )}
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

              {/* Stokta yoksa: talep toplama formu (para almaz) */}
              {!product.inStock && <PreorderForm product={product} />}

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
                <p><strong>Ücretsiz Kargo:</strong> 6500 TL üzeri siparişlerde</p>
                <p><strong>Güvenli Ödeme:</strong> Kredi kartı & havale</p>
                <p><strong>İade:</strong> 14 gün iade (kullanılmamış, lekelenmemiş, hasarsız)</p>
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

      {/* Tam ekran yakınlaştırma (zoom) — tüm ürün ilanlarında */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto',
          }}
        >
          <button
            onClick={() => setZoomOpen(false)} aria-label="Kapat"
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 9001, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
              fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {imageList.length > 1 && (
            <>
              <button onClick={prevZoom} aria-label="Önceki"
                style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 9001, width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: '1.4rem', cursor: 'pointer' }}>‹</button>
              <button onClick={nextZoom} aria-label="Sonraki"
                style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 9001, width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: '1.4rem', cursor: 'pointer' }}>›</button>
            </>
          )}

          <p style={{ position: 'fixed', bottom: 18, left: 0, right: 0, textAlign: 'center', color: '#888', fontSize: '0.72rem', letterSpacing: '0.08em', zIndex: 9001, pointerEvents: 'none' }}>
            {zoomed ? 'UZAKLAŞTIRMAK İÇİN TIKLAYIN' : 'DAHA FAZLA YAKINLAŞTIRMAK İÇİN GÖRSELE TIKLAYIN'}
            {imageList.length > 1 ? `  ·  ${activeImage + 1} / ${imageList.length}` : ''}
          </p>

          <img
            src={imageList[activeImage]}
            alt={`${product.name} yakın görünüm`}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z); }}
            style={zoomed
              ? { width: 'auto', maxWidth: 'none', minWidth: '150vw', cursor: 'zoom-out', margin: 'auto' }
              : { maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', cursor: 'zoom-in' }}
          />
        </div>
      )}
    </>
  );
}

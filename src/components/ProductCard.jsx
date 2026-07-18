import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { toggleItem, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  return (
    <div className="product-card" style={{ position: 'relative' }}>
      <button
        className="product-card__wishlist"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
        aria-label={liked ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 5,
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#e74c3c' : 'none'} stroke={liked ? '#e74c3c' : '#666'} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>

      {!product.inStock && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 5,
          background: 'var(--gold-dark, #B8860B)', color: '#fff', padding: '4px 12px',
          fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          Yakında Stokta
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="product-card__image-wrapper">
          <img src={product.images?.[0] || '/images/products/kelaghayi-1.jpg'} alt={product.name} className="product-card__image" loading="lazy" />
          <div className="product-card__overlay">
            <span className="product-card__quick-view">Detayları Gör</span>
          </div>
        </div>
        <div className="product-card__info">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__price">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </div>
  );
}

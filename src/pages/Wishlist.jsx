import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { items } = useWishlist();
  const { getProduct } = useProducts();

  const wishlistProducts = items
    .map(item => getProduct(item.id))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>Favorilerim | Paressilk</title>
      </Helmet>

      <div className="container" style={{ paddingTop: 120, paddingBottom: 80, minHeight: '70vh' }}>
        <div className="section__header">
          <p className="section__subtitle">Beğendikleriniz</p>
          <h1 className="section__title">Favorilerim</h1>
          <div className="section__divider" />
        </div>

        {wishlistProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: 24 }}>
              Henüz favori ürününüz yok.
            </p>
            <Link to="/shop" className="btn btn--primary">
              Koleksiyonu Keşfet
            </Link>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: 32 }}>
              {wishlistProducts.length} ürün
            </p>
            <div className="products-grid">
              {wishlistProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

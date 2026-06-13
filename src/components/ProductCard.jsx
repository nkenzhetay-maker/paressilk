import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
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
  );
}

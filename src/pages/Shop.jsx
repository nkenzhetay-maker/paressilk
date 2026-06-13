import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Helmet } from 'react-helmet-async';

const categories = [
  { key: 'all', label: 'Tümü' },
  { key: 'kelaghayi', label: 'Kelaghayi' },
  { key: 'scarves', label: 'Eşarplar' },
  { key: 'chitme', label: 'Chitme' },
  { key: 'raw-silk', label: 'Ham İpek' },
  { key: 'carpet', label: 'Halılar' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const { getByCategory } = useProducts();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const products = getByCategory(activeCategory);
  const activeCatLabel = categories.find(c => c.key === activeCategory)?.label || 'Koleksiyon';

  return (
    <>
      <Helmet>
        <title>{activeCatLabel} | Paressilk - %100 İpek Ürünler</title>
        <meta name="description" content={`Paressilk ${activeCatLabel} koleksiyonu. %100 doğal ipek, el yapımı, Azerbaycan'dan Türkiye'ye. Kelaghayi, eşarp ve daha fazlası.`} />
      </Helmet>

      <div className="shop-page">
        <div className="shop-hero">
          <h1>{activeCatLabel}</h1>
          <p>%100 El Yapımı Doğal İpek</p>
        </div>

        <div className="container">
          <div className="shop-filters">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`shop-filter-btn ${activeCategory === cat.key ? 'shop-filter-btn--active' : ''}`}
                onClick={() => handleFilter(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Bu kategoride henüz ürün bulunmuyor.</p>
              <p style={{ fontSize: '0.85rem' }}>Yakında yeni ürünler eklenecektir.</p>
            </div>
          ) : (
            <div className="products-grid" style={{ paddingBottom: 80 }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

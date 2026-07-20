import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Helmet } from 'react-helmet-async';

const categories = [
  { key: 'all', label: 'Tümü' },
  { key: 'yeni-koleksiyon', label: 'Yeni Koleksiyon' },
  { key: 'kelaghayi', label: 'Kelağayı' },
  { key: 'scarves', label: 'Eşarplar' },
  { key: 'chitme', label: 'Çitme' },
  { key: 'raw-silk', label: 'Ham İpek' },
  { key: 'carpet', label: 'Halılar' },
  { key: 'hediye-seti', label: 'Hediye Setleri' },
];

const sortOptions = [
  { key: 'default', label: 'Varsayılan' },
  { key: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { key: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { key: 'name-asc', label: 'A-Z' },
  { key: 'name-desc', label: 'Z-A' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 50000]);
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

  const rawProducts = getByCategory(activeCategory);

  const products = useMemo(() => {
    let filtered = rawProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'name-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'tr'));
      default:
        return filtered;
    }
  }, [rawProducts, sortBy, priceRange]);

  const activeCatLabel = categories.find(c => c.key === activeCategory)?.label || 'Koleksiyon';

  return (
    <>
      <Helmet>
        <title>{activeCatLabel} | Paressilk - %100 İpek Ürünler</title>
        <meta name="description" content={`Paressilk ${activeCatLabel} koleksiyonu. %100 doğal ipek, el yapımı, premium kalite.`} />
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

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 24, flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>
              {products.length} ürün gösteriliyor
            </p>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '8px 16px', border: '1px solid #ddd', background: '#fff',
                fontSize: '0.85rem', color: '#333', cursor: 'pointer',
                appearance: 'none', paddingRight: 32,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              {sortOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
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

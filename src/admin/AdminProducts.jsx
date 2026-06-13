import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

export default function AdminProducts() {
  const { products, deleteProduct, updateProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div>
      <div className="admin-header">
        <h1>Ürünler ({products.length})</h1>
        <Link to="/admin/products/new" className="btn btn--primary">Yeni Ürün Ekle</Link>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '10px 16px', border: '1px solid #ddd', fontSize: '0.85rem' }}
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #ddd', fontSize: '0.85rem' }}>
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Tüm Kategoriler' : c}</option>
            ))}
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Ürün Adı</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Durum</th>
              <th>Öne Çıkan</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><img src={p.images?.[0] || '/images/products/kelaghayi-1.jpg'} alt={p.name} className="admin-table__img" /></td>
                <td><strong>{p.name}</strong></td>
                <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td>
                  <button
                    className={`badge ${p.inStock ? 'badge--success' : 'badge--error'}`}
                    onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {p.inStock ? 'Stokta' : 'Tükendi'}
                  </button>
                </td>
                <td>
                  <button
                    className={`badge ${p.featured ? 'badge--warning' : ''}`}
                    onClick={() => updateProduct(p.id, { featured: !p.featured })}
                    style={{ cursor: 'pointer', border: p.featured ? 'none' : '1px solid #ddd', background: p.featured ? undefined : '#fff' }}
                  >
                    {p.featured ? 'Evet' : 'Hayır'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/admin/products/edit/${p.id}`} style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', textDecoration: 'underline' }}>Düzenle</Link>
                    <button
                      onClick={() => { if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) deleteProduct(p.id); }}
                      style={{ color: 'var(--error)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Ürün bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

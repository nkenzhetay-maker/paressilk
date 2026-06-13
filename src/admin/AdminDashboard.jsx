import { useProducts } from '../context/ProductContext';

export default function AdminDashboard() {
  const { products } = useProducts();
  const totalProducts = products.length;
  const inStock = products.filter(p => p.inStock).length;
  const outOfStock = totalProducts - inStock;
  const categories = [...new Set(products.map(p => p.category))].length;

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Toplam Ürün</p>
          <p className="admin-stat__value">{totalProducts}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Stokta</p>
          <p className="admin-stat__value">{inStock}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Tükenen</p>
          <p className="admin-stat__value">{outOfStock}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Kategori</p>
          <p className="admin-stat__value">{categories}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: 20 }}>Son Eklenen Ürünler</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Ürün Adı</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(-5).reverse().map(p => (
              <tr key={p.id}>
                <td><img src={p.images?.[0] || '/images/products/kelaghayi-1.jpg'} alt={p.name} className="admin-table__img" /></td>
                <td>{p.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                <td>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.price)}</td>
                <td><span className={`badge ${p.inStock ? 'badge--success' : 'badge--error'}`}>{p.inStock ? 'Stokta' : 'Tükendi'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

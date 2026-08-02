import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialProducts from '../data/products.json';

const ProductContext = createContext();

// Yerel önbellek sürümü — yalnızca ilk açılıştaki offline/hızlı gösterim için.
// Kalıcı doğruluk kaynağı artık Supabase (get-products).
const PRODUCTS_VERSION = 11;

const getToken = () => sessionStorage.getItem('paressilk_admin_token') || '';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const savedVersion = localStorage.getItem('paressilk_products_version');
      if (savedVersion !== String(PRODUCTS_VERSION)) {
        localStorage.setItem('paressilk_products_version', String(PRODUCTS_VERSION));
        localStorage.setItem('paressilk_products', JSON.stringify(initialProducts));
        return initialProducts;
      }
      const saved = localStorage.getItem('paressilk_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Yerel önbelleğe yaz (kotaya karşı korumalı; artık base64 değil URL tutulduğu
  // için taşma pratikte olmaz).
  const cache = useCallback((list) => {
    try { localStorage.setItem('paressilk_products', JSON.stringify(list)); } catch (e) { /* yoksay */ }
  }, []);

  // Supabase'den tazele (stale-while-revalidate). Boş/erişilemezse yerel kalır.
  const reloadProducts = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/get-products', { headers: { 'Cache-Control': 'no-cache' } });
      if (res.status === 204) return;            // backend hazır değil → yerelde kal
      if (!res.ok) return;
      const { products: fresh } = await res.json();
      if (Array.isArray(fresh) && fresh.length) {
        setProducts(fresh);
        cache(fresh);
      }
    } catch { /* ağ hatası → yerelde kal */ }
  }, [cache]);

  useEffect(() => { reloadProducts(); }, [reloadProducts]);

  const authFetch = async (path, body) => {
    const res = await fetch(`/.netlify/functions/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'İşlem başarısız');
    return data;
  };

  // Görseli Supabase Storage'a yükle, kalıcı URL döndür. (data: URI verilirse.)
  const uploadImage = async (dataUrl) => {
    const { url } = await authFetch('upload-product-image', { dataUrl });
    return url;
  };

  const addProduct = async (product) => {
    const withId = { ...product, id: product.id || `product-${Date.now()}`, images: product.images || [] };
    const { product: saved } = await authFetch('save-product', { product: withId });
    setProducts(prev => { const next = [...prev, saved]; cache(next); return next; });
    return saved;
  };

  const updateProduct = async (id, updates) => {
    const existing = products.find(p => p.id === id) || { id };
    const merged = { ...existing, ...updates, id };
    const { product: saved } = await authFetch('save-product', { product: merged });
    setProducts(prev => { const next = prev.map(p => p.id === id ? saved : p); cache(next); return next; });
    return saved;
  };

  const deleteProduct = async (id) => {
    await authFetch('delete-product', { id });
    setProducts(prev => { const next = prev.filter(p => p.id !== id); cache(next); return next; });
  };

  // Bir kerelik: yerel products.json'daki ürünleri Supabase'e aktar, sonra tazele.
  const migrateProducts = async () => {
    const result = await authFetch('migrate-products', { overwrite: false });
    await reloadProducts();
    return result;
  };

  const getProduct = (id) => products.find(p => p.id === id);

  // Vitrinde yalnızca yayında olan ürünler görünür (active !== false; eski
  // ürünlerde alan olmadığı için varsayılan yayında). Admin tam listeyi görür.
  const isActive = (p) => p.active !== false;

  const getByCategory = (category) => {
    const visible = products.filter(isActive);
    if (!category || category === 'all') return visible;
    return visible.filter(p => p.category === category || (Array.isArray(p.categories) && p.categories.includes(category)));
  };

  const getFeatured = () => products.filter(p => p.featured && isActive(p));

  return (
    <ProductContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, getProduct,
      getByCategory, getFeatured, reloadProducts, uploadImage, migrateProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);

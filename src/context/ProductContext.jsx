import { createContext, useContext, useState, useEffect } from 'react';
import initialProducts from '../data/products.json';

const ProductContext = createContext();

const PRODUCTS_VERSION = 4;

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const savedVersion = localStorage.getItem('paressilk_products_version');
    if (savedVersion !== String(PRODUCTS_VERSION)) {
      localStorage.setItem('paressilk_products_version', String(PRODUCTS_VERSION));
      localStorage.setItem('paressilk_products', JSON.stringify(initialProducts));
      return initialProducts;
    }
    const saved = localStorage.getItem('paressilk_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('paressilk_products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `product-${Date.now()}`,
      images: product.images || [],
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id) => products.find(p => p.id === id);

  const getByCategory = (category) => {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category === category);
  };

  const getFeatured = () => products.filter(p => p.featured);

  const resetProducts = () => {
    setProducts(initialProducts);
    localStorage.setItem('paressilk_products', JSON.stringify(initialProducts));
  };

  return (
    <ProductContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, getProduct, getByCategory, getFeatured, resetProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);

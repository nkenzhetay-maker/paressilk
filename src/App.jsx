import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';

import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import KVKK from './pages/KVKK';
import CerezPolitikasi from './pages/CerezPolitikasi';
import CookieConsent from './components/CookieConsent';

import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductForm from './admin/AdminProductForm';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function StorefrontLayout() {
  return (
    <>
      <Header />
      <CartSidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/kvkk" element={<KVKK />} />
        <Route path="/cerez-politikasi" element={<CerezPolitikasi />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <CookieConsent />
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const seen = sessionStorage.getItem('paressilk_splash_seen');
    return !seen;
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('paressilk_splash_seen', 'true');
  }, []);

  return (
    <HelmetProvider>
      <ProductProvider>
        <CartProvider>
          <AuthProvider>
            <BrowserRouter>
              {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
              <ScrollToTop />
              <Routes>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="/*" element={<StorefrontLayout />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </CartProvider>
      </ProductProvider>
    </HelmetProvider>
  );
}

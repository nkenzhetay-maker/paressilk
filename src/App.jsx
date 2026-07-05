import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { WishlistProvider } from './context/WishlistContext';
import AuthModal from './components/AuthModal';
import { useEffect, useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';

import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';
import TrustBar from './components/TrustBar';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import KVKK from './pages/KVKK';
import CerezPolitikasi from './pages/CerezPolitikasi';
import MesafeliSatis from './pages/MesafeliSatis';
import IadePolitikasi from './pages/IadePolitikasi';
import SSS from './pages/SSS';
import Wishlist from './pages/Wishlist';
import InstagramPage from './pages/InstagramPage';
import SanalDeneme from './pages/SanalDeneme';
import AITryonPlayground from './pages/AITryonPlayground';
import CookieConsent from './components/CookieConsent';

import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductForm from './admin/AdminProductForm';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';
import AdminAITryon from './admin/AdminAITryon';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function StorefrontLayout() {
  return (
    <>
      <TrustBar />
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
        <Route path="/mesafeli-satis" element={<MesafeliSatis />} />
        <Route path="/iade-politikasi" element={<IadePolitikasi />} />
        <Route path="/sss" element={<SSS />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/instagram" element={<InstagramPage />} />
        <Route path="/sanal-deneme" element={<SanalDeneme />} />
        <Route path="/ai-playground" element={<AITryonPlayground />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <AuthModal />
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
          <UserProvider>
          <WishlistProvider>
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
                  <Route path="ai-tryon" element={<AdminAITryon />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="/*" element={<StorefrontLayout />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
          </UserProvider>
          </AuthProvider>
        </CartProvider>
      </ProductProvider>
    </HelmetProvider>
  );
}

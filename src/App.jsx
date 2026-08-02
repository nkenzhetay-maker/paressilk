import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { WishlistProvider } from './context/WishlistContext';
import AuthModal from './components/AuthModal';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
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
import Hesap from './pages/Hesap';
import GizlilikPolitikasi from './pages/GizlilikPolitikasi';
import UyelikSozlesmesi from './pages/UyelikSozlesmesi';
import InstagramPage from './pages/InstagramPage';
import CookieConsent from './components/CookieConsent';

// Ağır / seyrek kullanılan sayfalar ayrı chunk'lara bölünür (lazy loading)
const SanalDeneme = lazy(() => import('./pages/SanalDeneme'));
const AITryonPlayground = lazy(() => import('./pages/AITryonPlayground'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminPreorders = lazy(() => import('./admin/AdminPreorders'));
const AdminSettings = lazy(() => import('./admin/AdminSettings'));
const AdminAITryon = lazy(() => import('./admin/AdminAITryon'));

function PageFallback() {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading__spinner" /></div>;
}

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
        <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
        <Route path="/uyelik-sozlesmesi" element={<UyelikSozlesmesi />} />
        <Route path="/sss" element={<SSS />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/hesap" element={<Hesap />} />
        <Route path="/instagram" element={<InstagramPage />} />
        <Route path="/sanal-deneme" element={<Suspense fallback={<PageFallback />}><SanalDeneme /></Suspense>} />
        <Route path="/ai-playground" element={<Suspense fallback={<PageFallback />}><AITryonPlayground /></Suspense>} />
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
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/edit/:id" element={<AdminProductForm />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="preorders" element={<AdminPreorders />} />
                    <Route path="ai-tryon" element={<AdminAITryon />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  <Route path="/*" element={<StorefrontLayout />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </WishlistProvider>
          </UserProvider>
          </AuthProvider>
        </CartProvider>
      </ProductProvider>
    </HelmetProvider>
  );
}

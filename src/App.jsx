import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AnnouncementBar from './components/layout/AnnouncementBar';
import DesktopHeader from './components/layout/DesktopHeader';
import MobileHeader from './components/layout/MobileHeader';
import AppFooter from './components/layout/AppFooter';
import MobileBottomDock from './components/layout/MobileBottomDock';
import MobileDrawer from './components/layout/MobileDrawer';
import SlideOverCart from './components/cart/SlideOverCart';
import AuthModal from './components/auth/AuthModal';
import SocietyRequestModal from './components/society/SocietyRequestModal';
import LogoutConfirmModal from './components/auth/LogoutConfirmModal';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import WholesalePage from './pages/WholesalePage';
import SocietyPartnerPortalPage from './pages/SocietyPartnerPortalPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UserProfilePage from './pages/UserProfilePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ScrollToTop from './components/common/ScrollToTop';
import BotanicalWatermarkBackdrop from './components/common/BotanicalWatermarkBackdrop';
import PwaInstallBanner from './components/common/PwaInstallBanner';

export default function App() {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [syncError, setSyncError] = useState(null);

  React.useEffect(() => {
    const handleSyncError = (e) => {
      setSyncError(e.detail || 'Database synchronization rejected.');
      const t = setTimeout(() => setSyncError(null), 7000);
      return () => clearTimeout(t);
    };
    window.addEventListener('freshioz_sync_error', handleSyncError);
    return () => window.removeEventListener('freshioz_sync_error', handleSyncError);
  }, []);

  const handleMobileSearchClick = () => {
    navigate('/catalog');
  };

  return (
    <div className="freshioz-app">
      {syncError && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: '#FEF2F2',
          border: '1.5px solid #F87171',
          color: '#991B1B',
          padding: '10px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️ {syncError}</span>
          <button onClick={() => setSyncError(null)} style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Subtle Luxury Botanical Line-Art Watermark Layer (3.5% opacity, zero-lag parallax) */}
      <BotanicalWatermarkBackdrop />

      {/* Smooth Automatic Page Scroll-to-Top */}
      <ScrollToTop />

      {/* Dynamic Warehouse Cut-off Clock Banner */}
      <AnnouncementBar />

      {/* Desktop Header */}
      <DesktopHeader
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Mobile & Tablet Top Header */}
      <MobileHeader 
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Routed Page Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          {/* Dedicated Institutional & Bulk Wholesale Crates Page */}
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="/society-portal" element={<SocietyPartnerPortalPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
      </main>

      {/* Comprehensive E-Commerce Footer */}
      <AppFooter />

      {/* Slide-Over Cart Drawer */}
      <SlideOverCart />

      {/* Authentication / OTP Modal */}
      <AuthModal />

      {/* Society Request Modal with Leaflet Map */}
      <SocietyRequestModal />

      {/* Logout Confirmation Dialog Modal */}
      <LogoutConfirmModal />

      {/* Left Mobile Drawer */}
      <MobileDrawer />

      {/* Mobile Bottom Dock Bar */}
      <MobileBottomDock />

      {/* PWA Home Screen Install Banner */}
      <PwaInstallBanner />
    </div>
  );
}

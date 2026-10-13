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

export default function App() {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleMobileSearchClick = () => {
    navigate('/catalog');
  };

  return (
    <div className="freshioz-app">
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

      {/* Mobile Top Header */}
      <MobileHeader onSearchClick={handleMobileSearchClick} />

      {/* Main Routed Page Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
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

      {/* Left Mobile Drawer */}
      <MobileDrawer />

      {/* Mobile Bottom Dock Bar */}
      <MobileBottomDock />
    </div>
  );
}

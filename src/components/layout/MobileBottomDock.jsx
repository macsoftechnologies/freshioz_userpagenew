import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Grid, Package, Clock, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function MobileBottomDock() {
  const navigate = useNavigate();
  const { cartItemCount, setIsCartOpen, activeUser, setIsAuthModalOpen } = useStore();

  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
      {/* 1. Home */}
      <NavLink
        to="/"
        className={({ isActive }) => `dock-item-btn ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      {/* 2. Categories */}
      <NavLink
        to="/catalog"
        className={({ isActive }) => `dock-item-btn ${isActive ? 'active' : ''}`}
      >
        <Grid size={20} />
        <span>Categories</span>
      </NavLink>

      {/* 3. Bulk / Wholesale */}
      <NavLink
        to="/wholesale"
        className={({ isActive }) => `dock-item-btn ${isActive ? 'active' : ''}`}
      >
        <Package size={20} />
        <span>Wholesale</span>
      </NavLink>

      {/* 4. Orders / Tracking */}
      <button
        type="button"
        className="dock-item-btn"
        onClick={() => {
          if (!activeUser) {
            setIsAuthModalOpen(true);
          } else {
            navigate('/profile');
          }
        }}
      >
        <Clock size={20} />
        <span>Orders</span>
      </button>

      {/* 5. Cart */}
      <button
        type="button"
        className="dock-item-btn"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart size={20} />
        <span>Cart</span>
        {cartItemCount > 0 && (
          <span className="dock-cart-badge">{cartItemCount}</span>
        )}
      </button>
    </nav>
  );
}

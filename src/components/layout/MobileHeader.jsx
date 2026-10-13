import React from 'react';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import FreshiozLogo from '../common/FreshiozLogo';
import { useStore } from '../../context/StoreContext';

export default function MobileHeader({ onSearchClick }) {
  const { 
    setIsMobileDrawerOpen, 
    cartItemCount, 
    cartSubtotal,
    setIsCartOpen 
  } = useStore();

  return (
    <header className="mobile-header-wrap">
      <div className="mobile-header-top">
        <div className="mobile-left-cluster">
          <button 
            type="button" 
            className="mobile-menu-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open navigation drawer"
          >
            <Menu size={22} />
          </button>
          <FreshiozLogo height={44} showTagline={false} />
        </div>

        <div className="mobile-right-cluster">
          <button
            type="button"
            className="mobile-search-btn"
            onClick={onSearchClick}
            aria-label="Search produce"
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            className="mobile-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View shopping cart"
          >
            <ShoppingBag size={16} />
            <span className="mobile-cart-total">₹{cartSubtotal}</span>
            {cartItemCount > 0 && (
              <span className="mobile-cart-badge">{cartItemCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

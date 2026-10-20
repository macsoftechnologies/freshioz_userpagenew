import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import FreshiozLogo from '../common/FreshiozLogo';
import { useStore } from '../../context/StoreContext';
import SearchRecommendations from '../search/SearchRecommendations';

export default function MobileHeader({ searchQuery = '', onSearchChange }) {
  const { 
    store,
    setIsMobileDrawerOpen, 
    cartItemCount, 
    cartSubtotal,
    setIsCartOpen 
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [isSearchRecsOpen, setIsSearchRecsOpen] = useState(false);

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
          <FreshiozLogo height={48} showTagline={false} />
        </div>

        <div className="mobile-right-cluster">
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

      {/* Modern Responsive Search Bar for Mobile & Tablet Viewports */}
      <div style={{ padding: '0 14px 10px 14px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F1F5F9',
          borderRadius: '10px',
          padding: '7px 12px',
          border: '1.5px solid #E2E8F0'
        }}>
          <Search size={17} color="#64748B" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search farm tomatoes, spinach, Shimla apples..."
            value={searchQuery}
            onFocus={() => setIsSearchRecsOpen(true)}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              setIsSearchRecsOpen(true);
              if (location.pathname !== '/catalog' && e.target.value.trim().length > 0) {
                navigate(`/catalog?q=${encodeURIComponent(e.target.value)}`);
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#0F172A',
              fontWeight: 600
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                if (onSearchChange) onSearchChange('');
              }}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <SearchRecommendations
          query={searchQuery}
          products={store.products || []}
          isOpen={isSearchRecsOpen}
          onClose={() => setIsSearchRecsOpen(false)}
          onSelectQuery={(q) => {
            if (onSearchChange) onSearchChange(q);
          }}
        />
      </div>
    </header>
  );
}

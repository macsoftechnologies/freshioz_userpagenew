import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Coins,
  ChevronDown,
  Package,
  Clock,
  LogOut,
  Building2
} from 'lucide-react';
import FreshiozLogo from '../common/FreshiozLogo';
import { useStore } from '../../context/StoreContext';

export default function DesktopHeader({ onSearchChange, searchQuery = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    store,
    activeUser, 
    logoutUser,
    requestLogout,
    partnerAuth,
    logoutPartner,
    setIsAuthModalOpen,
    isWholesale,
    setIsWholesale,
    cartItemCount,
    cartSubtotal,
    setIsCartOpen
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically pulled from Master Data catalog categories
  const categories = [
    { id: 'ALL', label: 'All Items 🌱', path: '/' },
    ...(store?.categories || []).filter(c => c.status !== 'INACTIVE' && c.id !== 'WHOLESALE' && !c.name?.toLowerCase().includes('wholesale')).map(cat => ({
      id: cat.id,
      label: `${cat.name || cat.label} ${cat.icon || ''}`.trim(),
      path: `/catalog?cat=${cat.id}`
    }))
    // Wholesale Crates link commented out in favor of retail volume bulk discounts:
    // { id: 'WHOLESALE', label: 'Wholesale Crates 📦', path: '/wholesale' }
  ];

  return (
    <header className="desktop-header-wrap">
      <div className="desktop-header-top">
        {/* Left: Brand Logo (Prominent & Glossy) */}
        <div className="desktop-header-left">
          <Link to="/" className="desktop-logo-link" title="Freshioz - Home">
            <FreshiozLogo height={64} />
          </Link>
        </div>

        {/* Center: Expansive & Clean Search Bar */}
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon-pos" />
          <input
            type="text"
            className="search-input-box"
            placeholder="Search farm tomatoes, spinach, Shimla apples, fresh harvest..."
            value={searchQuery}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              if (location.pathname !== '/catalog' && e.target.value.trim().length > 0) {
                navigate(`/catalog?q=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
        </div>

        {/* Right: Society Portal + Account + Cart */}
        <div className="desktop-header-right">
          {/* Wholesale Mode Toggle - Commented out for retail concentration
          <div className="wholesale-switch-pill" title="Toggle Retail vs Wholesale Crate Rates">
            <button
              type="button"
              className={`switch-btn ${!isWholesale ? 'active' : ''}`}
              onClick={() => setIsWholesale(false)}
            >
              Retail
            </button>
            <button
              type="button"
              className={`switch-btn ${isWholesale ? 'wholesale-active' : ''}`}
              onClick={() => setIsWholesale(true)}
            >
              📦 Wholesale
            </button>
          </div>
          */}

          {/* MUTUAL EXCLUSIVITY:
              1. If logged in as resident user: DO NOT show Society Portal button!
              2. If logged in as community partner: DO NOT show user login button!
          */}

          {/* Society Partner Button: ONLY shown if NOT logged in as resident user and NOT already partner */}
          {!activeUser && !partnerAuth && (
            <Link
              to="/society-portal"
              className="partner-portal-minimal-btn"
              title="Apartment / Hostel Association Maintenance Fund"
            >
              <Coins size={15} color="#DE8821" />
              <span>Society Portal</span>
            </Link>
          )}

          {/* Active Partner Desk indicator (when logged in as community head) */}
          {partnerAuth && !activeUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/society-portal"
                className="partner-portal-active-pill"
                title="Open Society Maintenance Desk"
              >
                <Building2 size={15} color="#DE8821" />
                <span>Partner Desk</span>
              </Link>
              <button
                type="button"
                onClick={() => requestLogout('PARTNER')}
                className="partner-quick-logout-btn"
                title="Logout from Partner Desk"
              >
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>
          )}

          {/* Resident User Account Dropdown Menu */}
          {activeUser ? (
            <div className="user-profile-menu-container" ref={userMenuRef}>
              <button
                type="button"
                className="user-login-trigger-btn"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                style={{ cursor: 'pointer' }}
                aria-expanded={isUserMenuOpen}
                title="Click for Profile, Orders, History and Logout"
              >
                <span className="user-initial-bubble">
                  {activeUser.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span>{activeUser.name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={14} className={`chevron-transition ${isUserMenuOpen ? 'open' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-popover">
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {activeUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-menu-info">
                      <div className="user-menu-name">{activeUser.name}</div>
                      <div className="user-menu-phone">+91 {activeUser.phone}</div>
                      <div className="user-menu-society">
                        🏢 {activeUser.societyName || 'Greenfield Heights'} ({activeUser.flatNo || 'Flat'})
                      </div>
                    </div>
                  </div>

                  <div className="user-menu-divider" />

                  <div className="user-menu-links">
                    <Link
                      to="/profile?tab=orders"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={17} className="menu-icon" />
                      <div className="menu-item-text">
                        <span>My Orders & Tracking</span>
                        <small>Pending & active next-day deliveries</small>
                      </div>
                    </Link>

                    <Link
                      to="/profile?tab=history"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Clock size={17} className="menu-icon" />
                      <div className="menu-item-text">
                        <span>Purchase History</span>
                        <small>Delivered produce, savings & bills</small>
                      </div>
                    </Link>

                    <Link
                      to="/profile?tab=profile"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={17} className="menu-icon" />
                      <div className="menu-item-text">
                        <span>My Profile & Society</span>
                        <small>Flat details & address preferences</small>
                      </div>
                    </Link>
                  </div>

                  <div className="user-menu-divider" />

                  <button
                    type="button"
                    className="user-menu-logout-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      requestLogout('USER');
                    }}
                  >
                    <LogOut size={15} />
                    <span>Logout Account</span>
                  </button>
                </div>
              )}
            </div>
          ) : !partnerAuth ? (
            /* Visitor Login Trigger */
            <button
              type="button"
              className="user-login-trigger-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User size={15} color="#234B3C" />
              <span>Login</span>
            </button>
          ) : null}

          {/* Cart Button */}
          <button
            type="button"
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={17} />
            <span className="cart-total-amount">₹{cartSubtotal}</span>
            {cartItemCount > 0 && (
              <span className="cart-count-badge">{cartItemCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Category Navigation Strip */}
      <div className="desktop-category-bar">
        <div className="desktop-category-inner">
          {categories.map((cat) => {
            const isActive = location.pathname + location.search === cat.path || (cat.id === 'ALL' && location.pathname === '/' && !location.search);
            return (
              <Link
                key={cat.id}
                to={cat.path}
                className={`category-nav-pill ${isActive ? 'active' : ''}`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

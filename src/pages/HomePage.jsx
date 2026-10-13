import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Package, 
  CheckCircle2, 
  Truck,
  Leaf
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import ModernizedVanTransitHero from '../components/common/ModernizedVanTransitHero';

export default function HomePage() {
  const navigate = useNavigate();
  const { 
    store, 
    selectedSociety, 
    isWholesale, 
    setIsWholesale, 
    cutoffInfo, 
    setIsAuthModalOpen,
    activeUser 
  } = useStore();

  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Dynamically pulled from Master Data catalog categories
  const categories = [
    { id: 'ALL', label: 'All Items', icon: '🌱' },
    ...(store.categories || []).filter(c => c.status !== 'INACTIVE').map(cat => ({
      id: cat.id,
      label: cat.name || cat.label,
      icon: cat.icon || '🥬'
    }))
  ];

  const filteredProducts = activeCategory === 'ALL'
    ? (store.products || [])
    : (store.products || []).filter(p => p.category === activeCategory);

  const dailySpecials = filteredProducts.slice(0, 8);
  const wholesaleBestsellers = (store.products || []).slice(0, 4);

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="home-hero-wrap">
        {/* =========================================================================
            CLIENT REQUEST: PREVIOUS HERO CARD / CAPSULE COMMENTED OUT (PRESERVED)
            ========================================================================= */}
        {/*
        <div className="hero-spatial-capsule">
          <div className="capsule-laser-border" />
          <div className="capsule-ambient-glow" />

          <div className="capsule-content-body">
            <div className="capsule-top-row">
              <div className="capsule-live-radar">
                <span className="capsule-radar-ping" />
                <span className="capsule-tag-text">LIVE APMC DAWN TELEMETRY</span>
              </div>

              <div className="capsule-equalizer" title="Live 4:00 AM Direct Mandi Inflow">
                <span className="eq-bar eq-1" />
                <span className="eq-bar eq-2" />
                <span className="eq-bar eq-3" />
                <span className="eq-bar eq-4" />
                <span className="eq-label">4:00 AM INFLOW</span>
              </div>
            </div>

            <div className="capsule-stage-grid">
              <div className="capsule-stage-text">
                <h2 className="capsule-main-headline">
                  Dawn Harvest at <span>04:00 AM</span> ➔ At Your Gate by <span>07:00 AM</span>
                </h2>
                <div className="capsule-transit-stream">
                  <span className="transit-node">🌱 APMC Mandi</span>
                  <span className="transit-arrow">
                    <span className="transit-photon" />
                  </span>
                  <span className="transit-node">🏢 {selectedSociety?.name || 'Society Gate'}</span>
                </div>
              </div>

              <div className="capsule-gyro-container" aria-hidden="true">
                <div className="gyro-ring gyro-ring-1" />
                <div className="gyro-ring gyro-ring-2" />
                <div className="gyro-core">
                  <span className="gyro-emoji">🌿</span>
                </div>
                <div className="gyro-glow" />
              </div>
            </div>

            <div className="capsule-action-chips">
              <button
                type="button"
                className="capsule-chip-primary"
                onClick={() => {
                  if (!activeUser) setIsAuthModalOpen(true);
                  navigate('/catalog');
                }}
              >
                <span>🥦 Daily Fresh Harvest</span>
                <ArrowRight size={12} />
              </button>

              <button
                type="button"
                className="capsule-chip-secondary"
                onClick={() => {
                  setIsWholesale(true);
                  navigate('/wholesale');
                }}
              >
                <Package size={12} />
                <span>Bulk Crates</span>
              </button>

              <div className="capsule-cutoff-pill">
                <Clock size={11} color="#FFD494" />
                <span>Cutoff: <strong>{cutoffInfo.cutoffTimeStr}</strong></span>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Modernized Freshioz Express Delivery Van Animated Hero (< 1024px) */}
        <ModernizedVanTransitHero 
          mode="retail"
          onClick={() => {
            if (!activeUser) setIsAuthModalOpen(true);
            navigate('/catalog');
          }}
        />

        {/* Desktop Spacious Hero Card (>= 1024px) */}
        <div className="hero-glass-card hero-desktop-only">
          <div className="hero-left-content">
            <div className="hero-tag-badge">
              <Leaf size={14} color="#78B159" />
              <span>Next-Day Farm Harvest</span>
            </div>

            <h1 className="hero-main-title">
              Farm-Fresh Greens Delivered to <span>{selectedSociety?.name || 'Your Society'}</span>
            </h1>

            <p className="hero-subtitle-desc">
              Direct from morning mandis to your community doorstep by 7:00 AM. 
              Zero dark-store storage, zero chemical waxing — 100% natural morning freshness.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="hero-primary-btn"
                onClick={() => {
                  if (!activeUser) setIsAuthModalOpen(true);
                  navigate('/catalog');
                }}
              >
                <span>Explore Daily Harvest</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="hero-secondary-btn"
                onClick={() => {
                  setIsWholesale(true);
                  navigate('/wholesale');
                }}
              >
                <Package size={16} />
                <span>Bulk Wholesale Crates</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Strip */}
      <section className="section-container" style={{ margin: '16px auto 8px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                background: activeCategory === cat.id ? '#234B3C' : '#FFFFFF',
                color: activeCategory === cat.id ? '#FFFFFF' : '#52635A',
                border: activeCategory === cat.id ? '1.5px solid #234B3C' : '1.5px solid #E5ECE7',
                boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(35, 75, 60, 0.2)' : 'none'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Today's Farm Harvest Grid */}
      <section className="section-container">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h2 className="section-heading-clean">
              <span>Dawn Mandi Produce</span>
              <span className="section-heading-badge">Next-Day</span>
            </h2>
            <p className="section-subheading desktop-only-text">
              Procured from APMC farmers at dawn and delivered tomorrow morning.
            </p>
          </div>

          <Link
            to="/catalog"
            className="section-view-all-btn"
          >
            <span>View All ({store.products.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {dailySpecials.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px dashed #CBD5E1',
            margin: '8px 0 20px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌱</div>
            <h3 style={{ fontSize: '16px', color: '#0F172A', fontWeight: 800, marginBottom: '6px' }}>
              Dawn Harvest Catalog Empty (Ready for Testing)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
              No farm produce added yet. As Super Admin, open the Admin Portal to add vegetables, fruits, and daily mandi prices!
            </p>
          </div>
        ) : (
          <div className="produce-grid">
            {dailySpecials.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Wholesale Banner & Showcase */}
      <section className="section-container">
        <div style={{
          background: 'linear-gradient(135deg, #FFF8ED 0%, #FEF3C7 100%)',
          border: '1.5px solid #FCD34D',
          borderRadius: '20px',
          padding: '28px 24px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F59E0B', color: '#FFF', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', marginBottom: '8px' }}>
                <Package size={12} />
                <span>WHOLESALE CRATES & BULK PACKS</span>
              </div>
              <h3 style={{ fontSize: '22px', color: '#92400E' }}>
                Bulk Crates for Hostel Messes, Canteens & Community Buyers
              </h3>
              <p style={{ fontSize: '13.5px', color: '#B45309', marginTop: '4px' }}>
                Buy directly in 20kg crates and 25kg sacks with verified mandi rates. Save up to 30% per kilogram!
              </p>
            </div>

            <Link
              to="/wholesale"
              style={{
                background: '#D97706',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '14px',
                padding: '11px 22px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>View Wholesale Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {wholesaleBestsellers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '12px',
              color: '#92400E',
              fontSize: '13px',
              fontWeight: 600
            }}>
              📦 Wholesale crates will appear once produce items are configured with wholesale tiers.
            </div>
          ) : (
            <div className="produce-grid">
              {wholesaleBestsellers.map(product => (
                <ProductCard key={`ws-${product.id}`} product={product} forceWholesale={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How Freshioz Works (Next-Day Model Explainer) */}
      <section className="section-container" style={{ margin: '40px auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Why Freshioz is Healthier & Smarter</h2>
          <p style={{ fontSize: '14px', color: '#52635A' }}>
            Unlike 10-minute apps where vegetables sit for days in refrigerated dark rooms, our next-day aggregation ensures true garden-fresh nutrition.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5ECE7',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'left'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EBF2EE', color: '#234B3C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Clock size={24} />
            </div>
            <h4 style={{ fontSize: '17px', marginBottom: '8px' }}>1. Orders Batched at 9:00 PM</h4>
            <p style={{ fontSize: '13px', color: '#52635A', lineHeight: '1.5' }}>
              We consolidate all orders across the society before the warehouse cut-off so we know exact daily requirements.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5ECE7',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'left'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EBF7E5', color: '#78B159', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Leaf size={24} />
            </div>
            <h4 style={{ fontSize: '17px', marginBottom: '8px' }}>2. Dawn 4:00 AM Mandi Harvest</h4>
            <p style={{ fontSize: '13px', color: '#52635A', lineHeight: '1.5' }}>
              Our procurement officers buy fresh-cut crops directly from APMC mandi farmers at morning auction rates. Zero stale stock.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5ECE7',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'left'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF5EB', color: '#F28E14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Truck size={24} />
            </div>
            <h4 style={{ fontSize: '17px', marginBottom: '8px' }}>3. Delivered by 7:00 AM</h4>
            <p style={{ fontSize: '13px', color: '#52635A', lineHeight: '1.5' }}>
              Graded, quality checked, tagged flat-wise, and dispatched to your society desk or doorstep before your morning breakfast.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

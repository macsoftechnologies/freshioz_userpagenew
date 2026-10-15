import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Package, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Coins, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  ShoppingBag,
  Leaf,
  Calendar
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    store,
    products, 
    cart, 
    addToCart, 
    updateCartQty, 
    selectedSociety, 
    cutoffInfo, 
    setIsCartOpen 
  } = useStore();

  const allProducts = products || store?.products || [];
  const product = allProducts.find(p => p.id === id);

  // Allow user to toggle between Retail & Wholesale view on the details page
  const [selectedMode, setSelectedMode] = useState('RETAIL'); // 'RETAIL' | 'WHOLESALE'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="section-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Produce Item Not Found</h2>
        <p style={{ color: '#83968D', marginTop: '8px' }}>
          The fresh item you are looking for is currently unavailable or out of season.
        </p>
        <Link 
          to="/catalog" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            background: '#234B3C',
            color: '#FFF',
            padding: '10px 22px',
            borderRadius: '9999px',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={16} />
          <span>Browse All Produce</span>
        </Link>
      </div>
    );
  }

  const isWholesaleAvailable = product.hasWholesale !== false && Boolean(product.wholesaleUnit) && Boolean(product.wholesalePrice);
  const isWholesale = selectedMode === 'WHOLESALE' && isWholesaleAvailable;
  const cartKey = `${product.id}_${isWholesale ? 'ws' : 'rt'}`;
  const cartItem = cart.find(item => item.key === cartKey);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const currentUnit = isWholesale ? product.wholesaleUnit : (product.retailUnit || product.defaultUnit || '1 kg');
  const currentPrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const currentMarketPrice = isWholesale 
    ? Math.round(product.wholesalePrice * 1.35) 
    : product.retailMarketPrice;
  const savingsPercent = Math.round(((currentMarketPrice - currentPrice) / currentMarketPrice) * 100);

  // Society cashback calculation for this item
  const commissionVal = selectedSociety 
    ? (selectedSociety.commissionType === 'PERCENTAGE' 
        ? Math.round((currentPrice * (selectedSociety.commissionValue || 3)) / 100) 
        : selectedSociety.commissionValue || 5)
    : 5;

  // Related products from the same or similar category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.category === 'VEGETABLES'))
    .slice(0, 4);

  return (
    <div className="product-details-page-wrap">
      {/* Breadcrumb Navigation */}
      <div className="details-breadcrumb-bar">
        <div className="details-breadcrumb-inner">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="details-back-btn"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="breadcrumb-links">
            <Link to="/">Home</Link>
            <span className="bc-sep">/</span>
            <Link to={`/catalog?cat=${product.category}`}>
              {product.category === 'VEGETABLES' ? 'Daily Veggies' : product.category === 'FRUITS' ? 'Fresh Fruits' : 'Produce'}
            </Link>
            <span className="bc-sep">/</span>
            <span className="bc-active">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="section-container" style={{ marginTop: '16px', marginBottom: '48px' }}>
        {/* Main Product Showcase (2-Column Desktop Grid) */}
        <div className="product-showcase-grid">
          
          {/* Left Column: Produce Media & Trust Badges */}
          <div className="product-media-column">
            <div className="product-hero-image-wrap">
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-hero-image"
              />
              
              {/* Single Badge */}
              <div className="details-floating-badge">
                {isWholesale ? (
                  <span className="wholesale-single-badge" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    <Package size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {product.wholesaleSavings || 'Bulk Mandi Rate'}
                  </span>
                ) : product.badge !== 'NONE' && (
                  <span className="freshness-single-badge" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    <Sparkles size={12} color="#C3E6B4" style={{ display: 'inline', marginRight: '4px' }} />
                    {product.badge || 'Harvested Today at Dawn'}
                  </span>
                )}
              </div>

              {/* Origin Stamp */}
              {product.origin && (
                <div className="details-origin-stamp">
                  <MapPin size={12} color="#234B3C" />
                  <span>{product.origin}</span>
                </div>
              )}
            </div>

            {/* Quality Guarantees Strip */}
            <div className="quality-guarantee-strip">
              <div className="guarantee-badge">
                <Leaf size={16} color="#78B159" />
                <div>
                  <div className="gb-title">100% Dawn Harvest</div>
                  <div className="gb-desc">Picked at 4:00 AM from APMC mandis</div>
                </div>
              </div>

              <div className="guarantee-badge">
                <ShieldCheck size={16} color="#234B3C" />
                <div>
                  <div className="gb-title">Zero Wax Coating</div>
                  <div className="gb-desc">100% chemical-free & pesticide tested</div>
                </div>
              </div>

              <div className="guarantee-badge">
                <Truck size={16} color="#F28E14" />
                <div>
                  <div className="gb-title">Society Drop Desk</div>
                  <div className="gb-desc">Aggregated direct-to-lobby transit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Pack Selection & Purchase Action */}
          <div className="product-info-column">
            <div className="product-title-section">
              <span className="category-pill-tag">{product.category}</span>
              <h1 className="product-main-heading">{product.name}</h1>
              {product.kannadaName && (
                <div className="product-regional-heading">{product.kannadaName}</div>
              )}
            </div>

            <p className="product-description-text">
              {product.desc || 'Crisp, garden-fresh produce harvested directly from verified polyhouse farmers and APMC mandi auctions. Graded and packed with zero moisture condensation.'}
            </p>

            {/* Pack Size & Quantity Mode Selector */}
            <div className="pack-selector-section">
              <div className="pack-selector-label">
                <span>Standard Kitchen Pack</span>
                <span className="pack-label-sub">Direct Fresh Harvest</span>
              </div>

              <div className="pack-options-grid" style={{ gridTemplateColumns: '1fr' }}>
                {/* Retail Option Card */}
                <div 
                  className="pack-card pack-active"
                  style={{ border: '2px solid #234B3C', background: '#F8FAF9' }}
                >
                  <div className="pack-radio-circle">
                    <div className="pack-radio-dot" />
                  </div>
                  <div className="pack-meta">
                    <div className="pack-title">Daily Kitchen Pack</div>
                    <div className="pack-weight">{product.retailUnit}</div>
                  </div>
                  <div className="pack-pricing">
                    <span className="pack-current-price">₹{product.retailPrice}</span>
                    <span className="pack-mrp">₹{product.retailMarketPrice}</span>
                  </div>
                </div>

                {/* Wholesale Crate Option Card - Commented out for retail concentration
                {isWholesaleAvailable && (
                  <div 
                    className={`pack-card ${isWholesale ? 'pack-active wholesale-active-card' : ''}`}
                    onClick={() => setSelectedMode('WHOLESALE')}
                  >
                    <div className="pack-meta">
                      <div className="pack-title">📦 Bulk Crate / Sack</div>
                      <div className="pack-weight">{product.wholesaleUnit}</div>
                    </div>
                    <div className="pack-pricing">
                      <span className="pack-current-price">₹{product.wholesalePrice}</span>
                    </div>
                  </div>
                )}
                */}
              </div>

              {/* Bulk Quantity Discount Tier Card */}
              {product.bulkMinQty && product.bulkMinQty > 0 && product.bulkDiscountPercent && product.bulkDiscountPercent > 0 && (
                <div style={{
                  marginTop: '12px',
                  background: qtyInCart >= product.bulkMinQty ? '#DCFCE7' : '#F0FDF4',
                  border: qtyInCart >= product.bulkMinQty ? '1.5px solid #22C55E' : '1.5px dashed #86EFAC',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                        🏷️ Volume Bulk Discount
                      </span>
                      <span style={{
                        background: '#15803D',
                        color: '#FFF',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '9999px'
                      }}>
                        {product.bulkDiscountPercent}% OFF
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', marginTop: '3px' }}>
                      Buy <strong>{product.bulkMinQty}+ {product.retailUnit || 'kg'}</strong> @ <strong>₹{Math.round(product.retailPrice * (1 - (product.bulkDiscountPercent / 100)))}/{product.retailUnit || 'kg'}</strong> (Save ₹{Math.round(product.retailPrice * (product.bulkDiscountPercent / 100))} each)
                    </div>
                  </div>

                  <div>
                    {qtyInCart >= product.bulkMinQty ? (
                      <span style={{
                        background: '#166534',
                        color: '#FFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        ✓ {product.bulkDiscountPercent}% Applied
                      </span>
                    ) : (
                      <span style={{
                        background: '#BBF7D0',
                        color: '#166534',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        {qtyInCart > 0 ? `Add ${product.bulkMinQty - qtyInCart} more` : `Min ${product.bulkMinQty} units`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Price Row & Action Button */}
            <div className="details-price-action-box">
              <div className="details-price-display">
                <div className="price-main-cluster">
                  <span className="details-hero-price">₹{currentPrice}</span>
                  {currentMarketPrice && (
                    <span className="details-hero-mrp">₹{currentMarketPrice}</span>
                  )}
                  {savingsPercent > 0 && (
                    <span className="details-discount-tag">{savingsPercent}% OFF</span>
                  )}
                </div>
                <div className="details-inclusive-taxes">
                  Inclusive of all taxes • 0% GST on fresh produce
                </div>
              </div>

              {/* Action Button: Live Cart Sync */}
              <div className="details-cta-wrap">
                {qtyInCart === 0 ? (
                  <button
                    type="button"
                    className={`details-hero-add-btn ${isWholesale ? 'ws-hero-btn' : ''}`}
                    onClick={() => addToCart(product, isWholesale)}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>ADD TO BASKET • ₹{currentPrice}</span>
                  </button>
                ) : (
                  <div className={`details-hero-stepper ${isWholesale ? 'ws-stepper' : ''}`}>
                    <button
                      type="button"
                      className="details-stepper-btn"
                      onClick={() => updateCartQty(cartKey, -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} strokeWidth={2.5} />
                    </button>
                    <div className="details-stepper-val">
                      <span className="stepper-qty-num">{qtyInCart}</span>
                      <span className="stepper-qty-unit">{currentUnit} in cart</span>
                    </div>
                    <button
                      type="button"
                      className="details-stepper-btn"
                      onClick={() => updateCartQty(cartKey, 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Next-Day Delivery & Cut-off Indicator Banner */}
            <div className="delivery-slot-assurance-banner">
              <div className="ds-icon-circle">
                <Clock size={18} color="#F28E14" />
              </div>
              <div className="ds-content">
                <div className="ds-title">
                  Next-Day Morning 06:30 AM – 08:30 AM Delivery
                </div>
                <div className="ds-desc">
                  Order before <strong>{cutoffInfo.cutoffTimeStr}</strong> for tomorrow's early morning drop at <strong>{selectedSociety?.name || 'Society Drop Desk'}</strong>.
                </div>
              </div>
            </div>

            {/* CLIENT SPECIFICATION: Hidden from customer website - commented out, not deleted
            <div className="society-fund-perk-box">
              <Coins size={18} color="#DE8821" className="perk-coin-icon" />
              <div className="perk-text">
                <strong>Community Maintenance Benefit:</strong> Every unit ordered contributes approx. <strong>₹{commissionVal}</strong> directly into <strong>{selectedSociety?.name || 'your Apartment / Hostel'}</strong> association maintenance fund!
              </div>
            </div>
            */}
          </div>
        </div>

        {/* Produce Specifications & Storage Tab Bar */}
        <div className="produce-specs-section">
          <h3 className="specs-section-title">Produce Specifications & Care</h3>
          <div className="specs-cards-grid">
            <div className="spec-item-card">
              <div className="spec-label">🌱 Harvest & Origin</div>
              <div className="spec-value">{product.origin || 'Kolar & Chikkaballapur Polyhouse Agro Belts'}</div>
              <div className="spec-hint">Procured directly at dawn auctions</div>
            </div>

            <div className="spec-item-card">
              <div className="spec-label">❄️ Storage & Shelf Life</div>
              <div className="spec-value">{product.shelfLife || '3–4 Days at room temperature'}</div>
              <div className="spec-hint">Keep in an airy basket away from direct heat</div>
            </div>

            <div className="spec-item-card">
              <div className="spec-label">🌿 Purity & Quality</div>
              <div className="spec-value">Grade-A Mandi Certified</div>
              <div className="spec-hint">100% Wax-free, naturally ripened</div>
            </div>

            <div className="spec-item-card">
              <div className="spec-label">🚚 Delivery Hub</div>
              <div className="spec-value">Central Agri-Hub North (Sorting & Cold Storage)</div>
              <div className="spec-hint">Dispatched in sanitized food crates</div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together / Similar Produce */}
        {relatedProducts.length > 0 && (
          <div className="related-produce-section">
            <div className="section-header-row" style={{ marginBottom: '16px' }}>
              <div className="section-title-wrap">
                <h2>Frequently Bought Together 🌱</h2>
                <div className="section-subheading">
                  Residents also add these daily essentials to complete their basket
                </div>
              </div>
            </div>

            <div className="produce-grid">
              {relatedProducts.map(relProduct => (
                <ProductCard key={`rel-${relProduct.id}`} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

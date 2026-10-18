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
  Calendar,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { reviewService } from '../services/reviewService';
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

  const [reviewData, setReviewData] = useState({ averageRating: 5.0, totalReviews: 0, reviews: [] });
  const [_isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (!product?.id) return;
    setIsLoadingReviews(true);
    reviewService.getProductReviews(product.id)
      .then(res => {
        if (isMounted && res) {
          setReviewData(res);
        }
      })
      .catch(err => console.warn('Product reviews fetch note:', err?.message || err))
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });
    return () => { isMounted = false; };
  }, [product?.id]);

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF9C3', color: '#854D0E', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800 }}>
                  <Star size={13} fill="#EAB308" color="#EAB308" />
                  <span>{reviewData.totalReviews > 0 ? `${reviewData.averageRating} / 5.0` : '4.9 Fresh'}</span>
                </div>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  ({reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'verified review' : 'verified reviews'})
                </span>
              </div>
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

        {/* Verified Customer Reviews Section */}
        <div className="customer-reviews-section" style={{ background: '#FFFFFF', borderRadius: '18px', padding: '28px', marginTop: '32px', boxShadow: '0 8px 24px rgba(35, 75, 60, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '20px', color: '#15221B', margin: 0, fontWeight: 800 }}>Verified Resident Reviews</h3>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Real ratings from society residents who ordered this crop
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F8FAF9', padding: '8px 16px', borderRadius: '12px', border: '1px solid #E5ECE7' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#234B3C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={22} fill="#EAB308" color="#EAB308" />
                <span>{reviewData.averageRating}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#52635A', lineHeight: 1.2 }}>
                <div>Overall Rating</div>
                <strong>{reviewData.totalReviews} total ratings</strong>
              </div>
            </div>
          </div>

          {reviewData.reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F8FAF9', borderRadius: '12px', border: '1px solid #EEF3F0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌱</div>
              <h4 style={{ fontSize: '15px', color: '#234B3C', fontWeight: 700, margin: '0 0 4px' }}>No written reviews yet</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Order this harvest and submit your feedback once delivered to earn community reward discounts!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {reviewData.reviews.map((rev) => (
                <div key={rev.id} style={{ background: '#FAFBFB', borderRadius: '12px', padding: '16px', border: '1px solid #EEF3F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.rating ? '#EAB308' : 'none'}
                          color={star <= rev.rating ? '#EAB308' : '#CBD5E1'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {rev.comment ? (
                    <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 10px' }}>
                      Rated {rev.rating} / 5 stars
                    </p>
                  )}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#234B3C' }}>
                    ✓ {rev.userName || 'Resident'}
                  </div>
                </div>
              ))}
            </div>
          )}
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

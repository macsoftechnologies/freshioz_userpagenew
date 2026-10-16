import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Sparkles, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ProductCard({ product, forceWholesale = null }) {
  const navigate = useNavigate();
  const { 
    isWholesale, 
    cart, 
    addToCart, 
    updateCartQty 
  } = useStore();

  const currentWholesaleMode = forceWholesale !== null ? forceWholesale : isWholesale;
  const isWholesaleAvailable = product.hasWholesale !== false && Boolean(product.wholesaleUnit) && Boolean(product.wholesalePrice);
  const isWholesaleActive = currentWholesaleMode && isWholesaleAvailable;

  const key = `${product.id}_${isWholesaleActive ? 'ws' : 'rt'}`;
  const cartItem = cart.find(item => item.key === key);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const minBulkQty = Number(product.bulkMinQty) || 0;
  const bulkDiscount = Number(product.bulkDiscountPercent) || 0;
  const isBulkQualified = minBulkQty > 0 && bulkDiscount > 0 && qtyInCart >= minBulkQty;
  const effectiveRetailPrice = isBulkQualified
    ? Math.round(product.retailPrice * (1 - bulkDiscount / 100))
    : product.retailPrice;

  const displayUnit = isWholesaleActive ? product.wholesaleUnit : (product.retailUnit || product.defaultUnit || '1 kg');
  const displayPrice = isWholesaleActive ? product.wholesalePrice : effectiveRetailPrice;
  const displayMarketPrice = isWholesaleActive 
    ? Math.round(product.wholesalePrice * 1.35) 
    : (isBulkQualified ? product.retailPrice : product.retailMarketPrice);

  // Single clean badge only - Wholesale gets savings %, Retail gets freshness pill. Never overlaps!
  const getBadgeLabel = () => {
    if (currentWholesaleMode && !isWholesaleAvailable) {
      return 'Retail Pack Only';
    }
    if (isWholesaleActive) {
      return product.wholesaleSavings || 'Bulk Rate';
    }
    if (product.badge === 'NONE' || product.badge === false) {
      return null;
    }
    return product.badge || 'Harvested Today at Dawn';
  };

  const badgeLabel = getBadgeLabel();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      className={`produce-card ${currentWholesaleMode ? 'wholesale-card' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      title={`View details for ${product.name}`}
    >
      {/* Media Wrap with 100% Non-overlapping Floating Badge */}
      <div className="card-media-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          className="card-img"
          loading="lazy" 
        />
        
        {badgeLabel && (
          <span className={currentWholesaleMode ? "wholesale-single-badge" : "freshness-single-badge"}>
            {currentWholesaleMode ? (
              <Package size={10} style={{ display: 'inline', marginRight: '3px' }} />
            ) : (
              <Sparkles size={10} color="#C3E6B4" style={{ display: 'inline', marginRight: '3px' }} />
            )}
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Body Details: Perfectly clamped & balanced */}
      <div className="card-details-body">
        <div className="card-title-block">
          <h4 className="card-item-title" title={product.name}>
            {product.name}
          </h4>
          
          <div className="card-sub-meta">
            <span className="card-unit-label">{displayUnit}</span>
          </div>

          {minBulkQty > 0 && bulkDiscount > 0 && (
            <div style={{
              fontSize: '10.5px',
              color: isBulkQualified ? '#065F46' : '#B45309',
              background: isBulkQualified ? '#ECFDF5' : '#FEF3C7',
              border: isBulkQualified ? '1px solid #A7F3D0' : '1px solid #FDE68A',
              borderRadius: '4px',
              padding: '2px 6px',
              fontWeight: 800,
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              width: 'fit-content'
            }}>
              <span>{isBulkQualified ? '🎉' : '🏷️'}</span>
              <span>
                {isBulkQualified 
                  ? `Hurray! ${bulkDiscount}% OFF Unlocked!` 
                  : `Buy ${minBulkQty}+ ${(displayUnit || 'kg').replace(/^1\s*/, '')} @ ${bulkDiscount}% OFF`}
              </span>
            </div>
          )}
        </div>

        {/* Price & Action Row: Bulletproof layout, NEVER clips button */}
        <div className="card-price-action-row" onClick={(e) => e.stopPropagation()}>
          <div className="price-stack">
            <span className="current-price">₹{displayPrice}</span>
            {displayMarketPrice && (
              <span className="market-price">₹{displayMarketPrice}</span>
            )}
          </div>

          {/* Action: Strict min-width, fixed height, stops event propagation */}
          {qtyInCart === 0 ? (
            <button
              type="button"
              className={`card-add-btn ${isWholesaleActive ? 'wholesale-add-btn' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, isWholesaleActive);
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>ADD</span>
            </button>
          ) : (
            <div className={`card-qty-control ${isWholesaleActive ? 'wholesale-qty' : ''}`}>
              <button
                type="button"
                className="card-qty-step-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateCartQty(key, -1);
                }}
                aria-label="Decrease quantity"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              <span className="card-qty-num">{qtyInCart}</span>
              <button
                type="button"
                className="card-qty-step-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateCartQty(key, 1);
                }}
                aria-label="Increase quantity"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

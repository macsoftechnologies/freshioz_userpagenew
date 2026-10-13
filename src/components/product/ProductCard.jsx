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

  const key = `${product.id}_${currentWholesaleMode ? 'ws' : 'rt'}`;
  const cartItem = cart.find(item => item.key === key);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const displayUnit = currentWholesaleMode ? product.wholesaleUnit : product.retailUnit;
  const displayPrice = currentWholesaleMode ? product.wholesalePrice : product.retailPrice;
  const displayMarketPrice = currentWholesaleMode 
    ? Math.round(product.wholesalePrice * 1.35) 
    : product.retailMarketPrice;

  // Single clean badge only - Wholesale gets savings %, Retail gets freshness pill. Never overlaps!
  const badgeLabel = currentWholesaleMode 
    ? (product.wholesaleSavings || 'Bulk Rate') 
    : (product.badge || 'Harvested Today');

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
            {product.kannadaName && (
              <span className="card-regional-name">{product.kannadaName}</span>
            )}
            <span className="card-unit-label">{displayUnit}</span>
          </div>
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
              className={`card-add-btn ${currentWholesaleMode ? 'wholesale-add-btn' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, currentWholesaleMode);
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>ADD</span>
            </button>
          ) : (
            <div className={`card-qty-control ${currentWholesaleMode ? 'wholesale-qty' : ''}`}>
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

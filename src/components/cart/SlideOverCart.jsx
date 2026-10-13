import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, Clock, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function SlideOverCart() {
  const navigate = useNavigate();
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartItemCount,
    selectedSociety,
    activeUser,
    cutoffInfo,
    setIsAuthModalOpen
  } = useStore();

  if (!isCartOpen) return null;

  const deliveryFee = cartSubtotal >= 199 || cartSubtotal === 0 ? 0 : 25;
  const grandTotal = cartSubtotal + deliveryFee;

  // Calculate society cashback estimation
  let estimatedCashback = 0;
  if (selectedSociety) {
    if (selectedSociety.commissionType === 'PERCENTAGE') {
      estimatedCashback = ((cartSubtotal * (selectedSociety.commissionValue || 3.5)) / 100).toFixed(2);
    } else {
      estimatedCashback = (selectedSociety.commissionValue || 5.0).toFixed(2);
    }
  }

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!activeUser) {
      setIsAuthModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Cart Header */}
        <div className="cart-drawer-header">
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#234B3C', fontFamily: 'Outfit' }}>
              Your Fresh Basket ({cartItemCount})
            </div>
            <div style={{ fontSize: '12px', color: '#52635A', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={13} color="#234B3C" /> {selectedSociety?.name}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F2F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} color="#15221B" />
          </button>
        </div>

        {/* Delivery Slot Announcement Pill */}
        <div style={{
          background: '#EBF2EE',
          borderBottom: '1px solid #D9E5DE',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12.5px',
          color: '#234B3C'
        }}>
          <Clock size={16} color="#F28E14" />
          <div>
            <div>Scheduled Delivery: <strong>{cutoffInfo.deliveryDayLabel} ({cutoffInfo.formattedDeliveryDate})</strong></div>
            <div style={{ fontSize: '11px', color: '#52635A' }}>Morning Slot: 06:30 AM – 08:30 AM (Society Drop Desk)</div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#83968D' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥬</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#15221B', marginBottom: '6px' }}>Your basket is empty</div>
              <div style={{ fontSize: '13px', marginBottom: '20px' }}>Explore today's fresh vegetable and fruit harvest!</div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: '#234B3C',
                  color: '#FFF',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.key} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-thumb" />

                <div className="cart-item-meta">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-sub">
                    {item.unit} • ₹{item.price} each
                    {item.isWholesale && <span style={{ color: '#DE8821', fontWeight: 700, marginLeft: '6px' }}>[Wholesale]</span>}
                  </div>
                  <div style={{ fontWeight: 800, color: '#234B3C', fontSize: '14px', marginTop: '2px' }}>
                    ₹{item.price * item.qty}
                  </div>
                </div>

                <div className="qty-counter-control" style={{ padding: '3px 6px' }}>
                  <button
                    type="button"
                    className="qty-step-btn"
                    onClick={() => updateCartQty(item.key, -1)}
                  >
                    <Minus size={11} />
                  </button>
                  <span className="qty-val-display" style={{ fontSize: '12px' }}>{item.qty}</span>
                  <button
                    type="button"
                    className="qty-step-btn"
                    onClick={() => updateCartQty(item.key, 1)}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Bill Details */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* CLIENT SPECIFICATION: Hidden from customer website - commented out, not deleted
            <div style={{
              background: '#FFF8ED',
              border: '1px solid #FCD9A5',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} color="#F28E14" />
              <span>
                <strong>₹{estimatedCashback}</strong> society cashback will be funded to <strong>{selectedSociety?.name}</strong>!
              </span>
            </div>
            */}

            {/* Bill Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="bill-summary-row">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="bill-summary-row">
                <span>Next-Day Society Delivery</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#78B159' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              {deliveryFee > 0 && (
                <div style={{ fontSize: '11px', color: '#83968D' }}>
                  Add ₹{199 - cartSubtotal} more for Free Society Delivery!
                </div>
              )}
              <div className="bill-total-row">
                <span>Total to Pay</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              className="checkout-action-btn"
              onClick={handleCheckoutClick}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  HelpCircle,
  Package,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    cart, 
    cartSubtotal, 
    cartGst,
    deliveryFee,
    freeDeliveryThreshold,
    selectedSociety, 
    activeUser, 
    cutoffInfo, 
    servingWarehouse,
    defaultWarehouse, 
    placeOrder,
    totalBulkSavings,
    getProductBulkPricing
  } = useStore();

  const [deliverySlot, setDeliverySlot] = useState(defaultWarehouse?.slots?.[0]?.label || 'Morning Fresh Slot (06:30 AM - 08:30 AM)');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacing, setIsPlacing] = useState(false);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#234B3C', marginBottom: '8px' }}>Your basket is empty</h2>
        <p style={{ color: '#52635A', marginBottom: '20px' }}>Please add vegetables or fruits before checking out.</p>
        <Link
          to="/"
          style={{
            background: '#234B3C',
            color: '#FFF',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontWeight: 700
          }}
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const grandTotal = cartSubtotal + (cartSubtotal > 0 ? deliveryFee : 0) + (cartGst || 0);

  let estimatedCashback = 0;
  if (selectedSociety) {
    if (selectedSociety.commissionType === 'PERCENTAGE') {
      estimatedCashback = ((cartSubtotal * (selectedSociety.commissionValue || 3.5)) / 100).toFixed(2);
    } else {
      estimatedCashback = (selectedSociety.commissionValue || 5.0).toFixed(2);
    }
  }

  // Pre-placement validation: opens the confirmation popup
  const handleInitiatePlaceOrder = (e) => {
    e.preventDefault();
    setIsConfirmOrderModalOpen(true);
  };

  // User confirmed in popup: commits order to store
  const handleExecuteConfirmedOrder = async () => {
    setIsConfirmOrderModalOpen(false);
    setIsPlacing(true);

    try {
      const order = await placeOrder({
        deliverySlot,
        paymentMethod
      });
      setIsPlacing(false);
      if (order) {
        navigate(`/tracking/${order.id}`);
      }
    } catch (err) {
      setIsPlacing(false);
      alert(err.message || 'Failed to place order. Please check item stock.');
    }
  };

  return (
    <div className="section-container" style={{ paddingTop: '20px', maxWidth: '1020px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#52635A', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Shopping
        </Link>
        <h1 style={{ fontSize: '26px', color: '#234B3C', marginTop: '6px' }}>Checkout & Schedule Delivery</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Delivery Address, Slot, Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Society Destination */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 size={18} color="#234B3C" />
              <h3 style={{ fontSize: '16px', color: '#15221B' }}>Delivery Society / Flat</h3>
            </div>

            <div style={{ background: '#FAFBFB', padding: '14px', borderRadius: '12px', border: '1px solid #E5ECE7' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#234B3C' }}>
                {selectedSociety?.name}
              </div>
              <div style={{ fontSize: '13.5px', color: '#15221B', marginTop: '4px' }}>
                Flat / Room: <strong>{activeUser?.flatNo || 'Tower B - Flat 402'}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#52635A', marginTop: '4px' }}>
                Recipient: {activeUser?.name} ({activeUser?.phone})
              </div>
            </div>
          </div>

          {/* 2. Next-Day Delivery Date & Slot Selector */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#234B3C" />
                <h3 style={{ fontSize: '16px', color: '#15221B' }}>Scheduled Delivery Window</h3>
              </div>
              <span style={{ fontSize: '12px', background: '#EBF7E5', color: '#234B3C', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px' }}>
                {cutoffInfo.deliveryDayLabel}
              </span>
            </div>

            {cutoffInfo.isPastCutoff ? (
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', padding: '10px 14px', fontSize: '12.5px', color: '#92400E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Today's 9:00 PM warehouse cut-off has passed. Your produce will be harvested for <strong>{cutoffInfo.formattedDeliveryDate}</strong>.</span>
              </div>
            ) : (
              <div style={{ background: '#EBF2EE', borderRadius: '10px', padding: '10px 14px', fontSize: '12.5px', color: '#234B3C', marginBottom: '14px' }}>
                ✨ <strong>Next-Day Delivery:</strong> Arriving tomorrow morning ({cutoffInfo.formattedDeliveryDate}).
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(defaultWarehouse?.slots || []).map(slot => (
                <label
                  key={slot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: deliverySlot === slot.label ? '2px solid #234B3C' : '1px solid #E5ECE7',
                    background: deliverySlot === slot.label ? '#F6FAF7' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={deliverySlot === slot.label}
                      onChange={() => setDeliverySlot(slot.label)}
                      style={{ accentColor: '#234B3C' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#15221B' }}>{slot.label}</div>
                      <div style={{ fontSize: '12px', color: '#52635A' }}>{slot.timeWindow} • {slot.desc}</div>
                    </div>
                  </div>
                  <Clock size={16} color={deliverySlot === slot.label ? '#234B3C' : '#83968D'} />
                </label>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CreditCard size={18} color="#234B3C" />
              <h3 style={{ fontSize: '16px', color: '#15221B' }}>Choose Payment Method</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: paymentMethod === 'UPI' ? '2px solid #234B3C' : '1px solid #E5ECE7',
                background: paymentMethod === 'UPI' ? '#F6FAF7' : '#FFF',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  style={{ accentColor: '#234B3C' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#15221B' }}>Instant UPI (GPay, PhonePe, Paytm)</div>
                  <div style={{ fontSize: '12px', color: '#52635A' }}>Scan or pay via installed UPI app</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: paymentMethod === 'PAY_ON_DELIVERY' ? '2px solid #234B3C' : '1px solid #E5ECE7',
                background: paymentMethod === 'PAY_ON_DELIVERY' ? '#F6FAF7' : '#FFF',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PAY_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('PAY_ON_DELIVERY')}
                  style={{ accentColor: '#234B3C' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#15221B' }}>Pay on Next-Day Delivery (Cash or QR)</div>
                  <div style={{ fontSize: '12px', color: '#52635A' }}>Pay delivery partner at your society drop point</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1.5px solid #E5ECE7',
          padding: '24px',
          position: 'sticky',
          top: '90px'
        }}>
          <h3 style={{ fontSize: '18px', color: '#234B3C', marginBottom: '16px' }}>Order Items ({cart.length})</h3>

          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {cart.map(item => {
              const bulkInfo = getProductBulkPricing ? getProductBulkPricing(item, item.qty) : { isEligible: false, savings: 0, totalWithDiscount: item.price * item.qty };
              return (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#15221B' }}>{item.name}</div>
                    <div style={{ color: '#52635A', fontSize: '11.5px' }}>
                      {item.qty} × {item.unit}
                      {bulkInfo.isEligible && (
                        <span style={{ color: '#16A34A', fontWeight: 700, marginLeft: '6px' }}>
                          ({bulkInfo.bulkDiscount}% Bulk Tier)
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {bulkInfo.isEligible ? (
                      <div>
                        <div style={{ fontWeight: 800, color: '#16A34A' }}>₹{bulkInfo.totalWithDiscount}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{item.price * item.qty}</div>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 800, color: '#234B3C' }}>
                        ₹{item.price * item.qty}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLIENT SPECIFICATION: Hidden from customer website - commented out, not deleted
          <div style={{
            background: '#FFF8ED',
            border: '1px solid #FCD9A5',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#B45309',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px'
          }}>
            <Sparkles size={16} color="#F28E14" />
            <span>
              <strong>₹{estimatedCashback}</strong> society cashback goes to <strong>{selectedSociety?.name}</strong>!
            </span>
          </div>
          */}

          {/* Bill Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #E5ECE7', paddingTop: '14px', marginBottom: '20px' }}>
            <div className="bill-summary-row">
              <span>Produce Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            {totalBulkSavings > 0 && (
              <div className="bill-summary-row" style={{ color: '#16A34A', fontWeight: 700 }}>
                <span>Bulk Volume Savings</span>
                <span>-₹{totalBulkSavings}</span>
              </div>
            )}
            <div className="bill-summary-row">
              <span>Next-Day Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#78B159' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            {cartGst > 0 && (
              <div className="bill-summary-row">
                <span>GST / Taxes</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>+₹{cartGst}</span>
              </div>
            )}
            <div className="bill-total-row">
              <span>Total Payable</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="button"
            className="checkout-action-btn"
            disabled={isPlacing}
            onClick={handleInitiatePlaceOrder}
          >
            {isPlacing ? 'Confirming with Warehouse...' : `Place Next-Day Order • ₹${grandTotal}`}
          </button>
        </div>
      </div>

      {/* ================= PAYMENT & ORDER CONFIRMATION POPUP MODAL ================= */}
      {isConfirmOrderModalOpen && (
        <div 
          className="modal-backdrop-overlay" 
          style={{ zIndex: 2000 }}
        >
          <div 
            className="modal-dialog-box" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '520px', 
              width: '92%',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '2px solid #E2E8F0'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EBF2EE',
                  color: '#234B3C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Confirm Your Order & Delivery?
                  </h3>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    Fresh dawn produce locked for direct society drop
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmOrderModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Order Review Card */}
            <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1.5px solid #E2E8F0', padding: '16px', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Destination:</span>
                <span style={{ color: '#0F172A', fontWeight: 800, textAlign: 'right' }}>
                  {selectedSociety?.name} {activeUser?.flatNo ? `(${activeUser.flatNo})` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Delivery Window:</span>
                <span style={{ color: '#059669', fontWeight: 800, textAlign: 'right' }}>
                  {cutoffInfo.formattedDeliveryDate} • {deliverySlot.split('(')[0].trim()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Basket Items:</span>
                <span style={{ color: '#334155', fontWeight: 700 }}>
                  {cart.length} produce packs ({cart.reduce((s, i) => s + i.qty, 0)} units)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Payment Method:</span>
                <span style={{ color: '#B45309', fontWeight: 800 }}>
                  {paymentMethod === 'UPI' ? 'Instant UPI (GPay/PhonePe)' : 'Pay on Delivery (Cash/QR)'}
                </span>
              </div>

              {totalBulkSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>Bulk Tier Savings:</span>
                  <span style={{ color: '#16A34A', fontWeight: 800 }}>
                    -₹{totalBulkSavings}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '14px' }}>Total Amount Payable:</span>
                <span style={{ color: '#234B3C', fontWeight: 900, fontSize: '20px' }}>
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Action Buttons: Cancel vs Confirm */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsConfirmOrderModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel / Review Basket
              </button>

              <button
                type="button"
                onClick={handleExecuteConfirmedOrder}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#234B3C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(35, 75, 60, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Yes, Confirm & Place Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

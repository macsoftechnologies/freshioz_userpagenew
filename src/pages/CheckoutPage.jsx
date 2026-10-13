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
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    cart, 
    cartSubtotal, 
    selectedSociety, 
    activeUser, 
    cutoffInfo, 
    defaultWarehouse, 
    placeOrder 
  } = useStore();

  const [deliverySlot, setDeliverySlot] = useState(defaultWarehouse?.slots?.[0]?.label || 'Morning Fresh Slot (06:30 AM - 08:30 AM)');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacing, setIsPlacing] = useState(false);

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

  const deliveryFee = cartSubtotal >= 199 ? 0 : 25;
  const grandTotal = cartSubtotal + deliveryFee;

  let estimatedCashback = 0;
  if (selectedSociety) {
    if (selectedSociety.commissionType === 'PERCENTAGE') {
      estimatedCashback = ((cartSubtotal * (selectedSociety.commissionValue || 3.5)) / 100).toFixed(2);
    } else {
      estimatedCashback = (selectedSociety.commissionValue || 5.0).toFixed(2);
    }
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsPlacing(true);

    setTimeout(() => {
      const order = placeOrder({
        deliverySlot,
        paymentMethod
      });
      setIsPlacing(false);
      if (order) {
        navigate(`/tracking/${order.id}`);
      }
    }, 600);
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
            {cart.map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#15221B' }}>{item.name}</div>
                  <div style={{ color: '#52635A', fontSize: '11.5px' }}>{item.unit} × {item.qty}</div>
                </div>
                <div style={{ fontWeight: 800, color: '#234B3C' }}>
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))}
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
            <div className="bill-summary-row">
              <span>Next-Day Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#78B159' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="bill-summary-row">
              <span>GST (Fresh Unprocessed Produce)</span>
              <span>₹0.00 (0% Exempt)</span>
            </div>
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
            onClick={handlePlaceOrder}
          >
            {isPlacing ? 'Confirming with Warehouse...' : `Place Next-Day Order • ₹${grandTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
}

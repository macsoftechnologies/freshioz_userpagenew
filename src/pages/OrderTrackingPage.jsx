import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  AlertCircle,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { orderService } from '../services/orderService';
import LiveVanTransitVisualizer from '../components/tracking/LiveVanTransitVisualizer';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { store, activeUser } = useStore();

  const [liveServerOrder, setLiveServerOrder] = useState(null);
  const [_isLoadingLive, setIsLoadingLive] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');

  // Secure order lookup: strictly match requested orderId for current user
  const userOrders = (store?.orders || []).filter(o => {
    if (!activeUser) return false;
    return o.userPhone === activeUser.phone || o.userId === activeUser.id;
  });

  const currentLocalOrder = orderId 
    ? (userOrders.find(o => o.id === orderId || o.uuid === orderId) || null)
    : (userOrders[0] || null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveTracking() {
      const targetId = orderId || currentLocalOrder?.id || currentLocalOrder?.uuid;
      if (!targetId) return;
      setIsLoadingLive(true);
      try {
        let trackData = null;
        if (activeUser) {
          try {
            trackData = await orderService.getById(targetId);
          } catch {
            trackData = await orderService.track(targetId);
          }
        } else {
          trackData = await orderService.track(targetId);
        }

        if (isMounted && trackData && trackData.id) {
          setLiveServerOrder(trackData);
        }
      } catch (err) {
        console.warn('Order tracking live fetch note:', err?.message || err);
      } finally {
        if (isMounted) setIsLoadingLive(false);
      }
    }
    fetchLiveTracking();
    return () => { isMounted = false; };
  }, [activeUser?.phone, activeUser?.id, orderId, currentLocalOrder?.id, currentLocalOrder?.uuid]);

  if (!activeUser && !orderId) {
    return (
      <div className="section-container" style={{ paddingTop: '40px', maxWidth: '700px', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', padding: '48px 24px', borderRadius: '16px', border: '1.5px solid #E5ECE7', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <Clock size={48} color="#234B3C" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', color: '#234B3C', marginBottom: '8px', fontWeight: 800 }}>Please Log In</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
            Please log in with your registered phone number to track your active orders and harvest deliveries.
          </p>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', background: '#234B3C', color: '#FFF', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
            <ArrowLeft size={16} /> Back to Daily Harvest
          </Link>
        </div>
      </div>
    );
  }

  // Combine local cached order details (e.g. line items) with live backend tracking milestones
  const currentOrder = liveServerOrder 
    ? { ...(currentLocalOrder || {}), ...liveServerOrder } 
    : currentLocalOrder;

  if (!currentOrder) {
    return (
      <div className="section-container" style={{ paddingTop: '40px', maxWidth: '700px', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', padding: '48px 24px', borderRadius: '16px', border: '1.5px solid #E5ECE7', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <Clock size={48} color="#234B3C" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', color: '#234B3C', marginBottom: '8px', fontWeight: 800 }}>No Order Found</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
            {orderId ? `We couldn't find an order with reference "${orderId}".` : 'You do not have any active harvest delivery in transit right now.'}
          </p>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', background: '#234B3C', color: '#FFF', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
            <ArrowLeft size={16} /> Back to Daily Harvest
          </Link>
        </div>
      </div>
    );
  }

  const getStepIndex = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PROCURING': // Backward-compatible with legacy orders
        return 0;
      case 'AT_WAREHOUSE':
      case 'PACKED':
        return 1;
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder?.status || 'CONFIRMED');

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!currentOrder) return;
    if (currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED') {
      setCancelErrorMsg(`Order cannot be cancelled because it is already ${currentOrder.status.toLowerCase()}.`);
      return;
    }
    try {
      setIsCancelling(true);
      setCancelErrorMsg('');
      const updated = await orderService.cancel(currentOrder.id, {
        reason: cancelReason || 'Cancelled by resident before delivery',
      });
      setLiveServerOrder(prev => ({
        ...(prev || {}),
        ...(updated || {}),
        status: 'CANCELLED',
        cancelledReason: cancelReason || 'Cancelled by resident before delivery',
        cancelledAt: new Date().toISOString()
      }));
      const isCod = (currentOrder.paymentMethod || '').includes('PAY_ON_DELIVERY') || currentOrder.paymentStatus === 'PENDING_COD';
      setCancelSuccessMsg(
        isCod 
          ? `Order #${currentOrder.id} has been cancelled. Since this was Pay on Delivery, no payment was collected and no charges apply.`
          : `Order #${currentOrder.id} has been successfully cancelled. No further charges will apply.`
      );
      setIsCancelModalOpen(false);
    } catch (err) {
      setCancelErrorMsg(err?.message || 'Failed to cancel order on the server. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancelled = currentOrder?.status === 'CANCELLED';

  return (
    <div className="section-container" style={{ paddingTop: '20px', maxWidth: '840px' }}>
      {cancelSuccessMsg && (
        <div style={{
          background: '#ECFDF5',
          border: '1.5px solid #A7F3D0',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#065F46',
          fontSize: '13.5px',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {isCancelled && (
        <div style={{
          background: '#FFF5F5',
          border: '1.5px solid #FED7D7',
          borderRadius: '14px',
          padding: '14px 18px',
          color: '#9B2C2C',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} color="#E53E3E" />
          <div>
            <strong>Order Cancelled:</strong> {currentOrder?.cancelledReason || 'Cancelled before delivery'}
            {(currentOrder?.paymentMethod || '').includes('PAY_ON_DELIVERY') || currentOrder?.paymentStatus === 'PENDING_COD'
              ? ' • No payment collected (Pay on Delivery)'
              : ''}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#234B3C', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
            Store
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
          <div>
            <h1 style={{ fontSize: '26px', color: '#234B3C' }}>Live Order Tracking</h1>
            <div style={{ fontSize: '13.5px', color: '#52635A', marginTop: '2px' }}>
              Order ID: <strong style={{ fontFamily: 'monospace', color: '#15221B' }}>{currentOrder?.id}</strong>
            </div>
          </div>

          <span style={{
            background: isCancelled ? '#FEE2E2' : currentOrder?.status === 'DELIVERED' ? '#EBF7E5' : '#FEF3C7',
            color: isCancelled ? '#DC2626' : currentOrder?.status === 'DELIVERED' ? '#234B3C' : '#92400E',
            fontWeight: 800,
            fontSize: '12px',
            padding: '4px 14px',
            borderRadius: '9999px',
            textTransform: 'uppercase'
          }}>
            {currentOrder?.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Society Delivery Badge Card (Clean Borderless White Luxury Card) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        padding: '20px 24px',
        border: 'none',
        boxShadow: '0 8px 24px rgba(35, 75, 60, 0.06)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ 
            fontSize: '11px', 
            color: '#234B3C', 
            background: '#EBF7E5',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 800, 
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '6px'
          }}>
            Next-Day Scheduled Delivery
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit', color: '#15221B' }}>
            {currentOrder?.deliveryDate} • {currentOrder?.deliverySlot}
          </div>
          <div style={{ fontSize: '13px', color: '#52635A', marginTop: '4px' }}>
            🏢 {currentOrder?.societyName} ({currentOrder?.flatNo})
          </div>
        </div>

        {/* CLIENT SPECIFICATION: Hidden from customer website - commented out, not deleted
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '11px', color: '#FFD494', fontWeight: 700 }}>SOCIETY CASHBACK</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
            +₹{currentOrder?.societyCommissionEarned || '5.00'}
          </div>
        </div>
        */}
      </div>

      {/* Interactive Animated Express Van Transit Visualizer */}
      <LiveVanTransitVisualizer 
        currentOrder={currentOrder} 
        currentStepIdx={currentStepIdx} 
      />



      {/* Items Summary in this Order */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: 'none',
        boxShadow: '0 8px 24px rgba(35, 75, 60, 0.05)',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <h3 style={{ fontSize: '17px', color: '#15221B', marginBottom: '14px' }}>Items in this Order</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentOrder?.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F4F2' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#15221B' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#52635A' }}>{item.qty} × {item.unit}</div>
              </div>
              <div style={{ fontWeight: 800, color: '#234B3C', fontSize: '14px' }}>
                ₹{item.totalPrice !== undefined && item.totalPrice !== null ? item.totalPrice : (item.price * item.qty)}
              </div>
            </div>
          ))}
          {(!currentOrder?.items || currentOrder.items.length === 0) && (
            <div style={{ fontSize: '13px', color: '#64748B', padding: '12px 0' }}>
              {currentOrder?.itemsCount ? `${currentOrder.itemsCount} produce item(s) included` : 'No item details available'}
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {currentOrder?.subtotal !== undefined && currentOrder?.subtotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
              <span>Items Subtotal</span>
              <span>₹{currentOrder.subtotal}</span>
            </div>
          )}
          {currentOrder?.bulkSavings !== undefined && currentOrder?.bulkSavings > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
              <span>Volume Bulk Savings</span>
              <span>-₹{currentOrder.bulkSavings}</span>
            </div>
          )}
          {currentOrder?.deliveryFee !== undefined && currentOrder?.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
              <span>Delivery Fee</span>
              <span>₹{currentOrder.deliveryFee}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', fontSize: '15px', fontWeight: 800, color: '#234B3C', borderTop: '1px dashed #E2E8F0', marginTop: '4px' }}>
            <div>
              <span>{(currentOrder?.paymentMethod || '').includes('PAY_ON_DELIVERY') ? (
                (currentOrder?.paymentStatus === 'PAID' || currentOrder?.codPaymentReceived) ? (
                  <span style={{ color: '#166534' }}>Total Paid (Cash on Delivery - Collected ✅)</span>
                ) : (
                  <span style={{ color: '#B91C1C' }}>Amount Due on Delivery (Cash / UPI)</span>
                )
              ) : (
                <span>Total Paid ({currentOrder?.paymentMethod || 'Online'})</span>
              )}</span>
            </div>
            <span style={{ fontSize: '18px' }}>₹{currentOrder?.totalAmount ?? '—'}</span>
          </div>
        </div>

        {!['DELIVERED', 'CANCELLED'].includes(currentOrder?.status) && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0F4F2', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setIsCancelModalOpen(true);
                setCancelReason('Placed order by mistake');
                setCancelErrorMsg('');
              }}
              style={{
                background: '#FFF5F5',
                color: '#DC2626',
                border: '1.5px solid #FECACA',
                padding: '9px 20px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL */}
      {isCancelModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '19px', color: '#15221B', margin: 0 }}>
                Cancel Order #{currentOrder?.id}?
              </h3>
              <p style={{ color: '#52635A', fontSize: '13px', margin: '6px 0 0' }}>
                {(currentOrder?.paymentMethod || '').includes('PAY_ON_DELIVERY') || currentOrder?.paymentStatus === 'PENDING_COD'
                  ? 'Since this order is scheduled for Pay on Delivery, no payment was collected and your order will be cancelled immediately.'
                  : 'Your order will be cancelled immediately and no further charges will apply.'}
              </p>
            </div>

            {cancelErrorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '10px 14px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '14px' }}>
                {cancelErrorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmCancel}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#234B3C', marginBottom: '6px' }}>
                  Reason for Cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-input-control"
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 12px', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Need to change delivery flat / address">Need to change delivery flat / address</option>
                  <option value="Forgot to add required items">Forgot to add required items</option>
                  <option value="Away from home on delivery date">Away from home on delivery date</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div style={{ background: '#F7FAF8', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#52635A', marginBottom: '18px', border: '1px solid #E5ECE7' }}>
                <div>• Items: <strong>{currentOrder?.items?.map(i => i.name).join(', ')}</strong></div>
                <div style={{ marginTop: '3px' }}>• Scheduled Drop: <strong>{currentOrder?.deliveryDate} ({currentOrder?.deliverySlot})</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  style={{ 
                    flex: 2, 
                    padding: '11px', 
                    background: isCancelling ? '#94A3B8' : '#DC2626', 
                    color: '#FFF', 
                    border: 'none', 
                    borderRadius: '9999px', 
                    fontWeight: 800, 
                    fontSize: '13px', 
                    cursor: isCancelling ? 'not-allowed' : 'pointer', 
                    boxShadow: isCancelling ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.25)' 
                  }}
                >
                  {isCancelling ? 'Cancelling on Server...' : 'Confirm Order Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

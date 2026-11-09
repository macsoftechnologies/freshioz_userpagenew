import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  AlertCircle,
  X,
  RefreshCw,
  MapPin,
  Truck,
  ShoppingBag,
  CreditCard,
  Building2,
  PackageCheck,
  Camera,
  XCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { orderService } from '../services/orderService';
import LiveVanTransitVisualizer from '../components/tracking/LiveVanTransitVisualizer';
import { parseCancelReasonProof } from './UserProfilePage';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { store, activeUser, refetchCustomerOrders } = useStore();

  const [liveServerOrder, setLiveServerOrder] = useState(null);
  const [_isLoadingLive, setIsLoadingLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');

  // Doorstep Rejection / Produce Return State (Option A)
  const [isDoorstepModalOpen, setIsDoorstepModalOpen] = useState(false);
  const [doorstepReason, setDoorstepReason] = useState('Produce Quality Damaged / Spoiled / Rotten');
  const [doorstepNotes, setDoorstepNotes] = useState('');
  const [doorstepPhotos, setDoorstepPhotos] = useState([]);
  const [isConfirmingDoorstep, setIsConfirmingDoorstep] = useState(false);
  const [isCancellingDoorstep, setIsCancellingDoorstep] = useState(false);
  const [previewProofPhotoModal, setPreviewProofPhotoModal] = useState(null);

  const handleDoorstepPhotoCapture = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const compressFile = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    Promise.all(files.map(compressFile))
      .then((newPhotos) => {
        setDoorstepPhotos(prev => [...prev, ...newPhotos].slice(0, 4));
      })
      .catch(() => {});
  };

  const handleConfirmDoorstepRejection = async (e) => {
    e.preventDefault();
    if (!currentOrder) return;
    try {
      setIsCancellingDoorstep(true);
      setCancelErrorMsg('');
      let fullReason = `Resident Doorstep Rejection: ${doorstepReason}${doorstepNotes ? ` - ${doorstepNotes}` : ''}`;
      if (doorstepPhotos.length > 0) {
        fullReason = `${fullReason} [PROOF_PHOTO]${doorstepPhotos[0]} [PROOF_PHOTOS]${JSON.stringify(doorstepPhotos)}`;
      }

      const updated = await orderService.cancel(currentOrder.id, {
        reason: fullReason,
      });

      setLiveServerOrder(prev => ({
        ...(prev || {}),
        ...(updated || {}),
        status: 'CANCELLED',
        cancelledReason: fullReason,
        cancelledAt: new Date().toISOString()
      }));

      if (refetchCustomerOrders) refetchCustomerOrders();

      const isCod = (currentOrder.paymentMethod || '').includes('PAY_ON_DELIVERY') || currentOrder.paymentStatus === 'PENDING_COD';
      setCancelSuccessMsg(
        isCod
          ? `Order #${currentOrder.id} produce rejected at doorstep. Driver will return crate to hub. No payment collected.`
          : `Order #${currentOrder.id} produce rejected at doorstep. Driver will return crate to hub. A full refund of ₹${currentOrder.totalAmount} has been initiated.`
      );

      setIsDoorstepModalOpen(false);
      setIsConfirmingDoorstep(false);
      setDoorstepPhotos([]);
      setDoorstepNotes('');
    } catch (err) {
      setCancelErrorMsg(err?.message || 'Failed to submit doorstep rejection. Please try again.');
    } finally {
      setIsCancellingDoorstep(false);
    }
  };

  // Secure order lookup: strictly match requested orderId for current user
  const userOrders = (store?.orders || []).filter(o => {
    if (!activeUser) return false;
    return o.userPhone === activeUser.phone || o.userId === activeUser.id;
  });

  const currentLocalOrder = orderId 
    ? (userOrders.find(o => o.id === orderId || o.uuid === orderId) || null)
    : (userOrders[0] || null);

  // Fetch live order tracking with background polling capability
  const fetchLiveTracking = async (showFullSpinner = false) => {
    const targetId = orderId || currentLocalOrder?.id || currentLocalOrder?.uuid;
    if (!targetId) return;
    if (showFullSpinner) setIsLoadingLive(true);
    setIsRefreshing(true);
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

      if (trackData && trackData.id) {
        setLiveServerOrder(trackData);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.warn('Order tracking live fetch note:', err?.message || err);
    } finally {
      if (showFullSpinner) setIsLoadingLive(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchLiveTracking(true);

    // Continuous 10-second automatic polling across mobile, tablet, and desktop
    const timer = setInterval(() => {
      if (isMounted) {
        fetchLiveTracking(false);
      }
    }, 10000);

    return () => { 
      isMounted = false; 
      clearInterval(timer);
    };
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

  // Combine local cached order details with live backend tracking
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
      case 'PROCURING':
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
  const isDelivered = currentOrder?.status === 'DELIVERED';
  const isCod = (currentOrder?.paymentMethod || '').includes('PAY_ON_DELIVERY') || currentOrder?.paymentStatus === 'PENDING_COD';

  return (
    <div className="section-container" style={{ paddingTop: '16px', paddingBottom: '50px', maxWidth: '840px' }}>
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
          flexDirection: 'column',
          gap: '8px'
        }}>
          {(() => {
            const { cleanReason, photos: cancelPhotos } = parseCancelReasonProof(currentOrder?.cancelledReason);
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} color="#E53E3E" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
                    <strong>Order Cancelled:</strong> {cleanReason}
                    {isCod ? ' • No payment collected (Pay on Delivery)' : ''}
                  </div>
                </div>

                {cancelPhotos.length > 0 && (
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #FECACA' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={13} />
                      <span>Doorstep Return / Inspection Proof ({cancelPhotos.length} photo{cancelPhotos.length > 1 ? 's' : ''}):</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {cancelPhotos.map((photo, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setPreviewProofPhotoModal(photo)}
                          style={{
                            padding: 0,
                            border: '1.5px solid #FCA5A5',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#FFF',
                            cursor: 'pointer',
                            width: '54px',
                            height: '54px'
                          }}
                          title="Click to enlarge photo proof"
                        >
                          <img
                            src={photo}
                            alt={`Proof ${pIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Top Navigation & Live Polling Status Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#234B3C', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              <ArrowLeft size={15} /> My Orders
            </Link>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Order #{currentOrder?.id}</span>
          </div>

          {/* 10s Live Sync Indicator & Tap Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fetchLiveTracking(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                cursor: 'pointer'
              }}
              title="Click to refresh live order state immediately"
            >
              <RefreshCw size={11} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          USER-FRIENDLY DELIVERED EXPERIENCE (Mobile, Tab & Desktop)
          Clear-cut instructions with zero clutter
         ======================================================== */}
      {isDelivered ? (
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
          borderRadius: '20px',
          border: '2px solid #86EFAC',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.12)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#059669',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#064E3B', margin: '0 0 6px', fontFamily: 'Outfit, sans-serif' }}>
            Fresh Produce Delivered!
          </h2>
          <p style={{ fontSize: '13px', color: '#047857', fontWeight: 600, margin: '0 0 16px' }}>
            Your farm-fresh harvest is safely delivered and ready for pickup at your society desk.
          </p>

          {/* Clear-Cut Instructions Grid */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'left',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
            border: '1px solid #A7F3D0'
          }}>
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                📍 Drop Location
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentOrder?.societyName || 'Society Point'}
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                Flat / Door: {currentOrder?.flatNo || 'Drop Desk'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                ⏰ Delivery Schedule
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentOrder?.deliveryDate || 'Today'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                {currentOrder?.deliverySlot || 'Morning Run'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                🚚 Delivery Rider
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {currentOrder?.deliveryPartnerName || 'Freshioz Delivery Lead'}
              </div>
              {currentOrder?.deliveryPartnerPhone && (
                <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 700 }}>
                  📞 +91 {currentOrder.deliveryPartnerPhone.slice(-10)}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                💳 Payment Status
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                ₹{currentOrder?.totalAmount} Paid
              </div>
              <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                {isCod ? '✓ Cash Collected at Door' : '✓ Verified Online Payment'}
              </div>
            </div>
          </div>

          {/* Quick Clear-Cut Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#059669',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '13.5px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
              }}
            >
              <ShoppingBag size={15} />
              <span>Order Tomorrow's Fresh Produce ➔</span>
            </Link>
          </div>
        </div>
      ) : (
        /* IN PROGRESS: CLEAN STATUS OVERVIEW */
        <>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 4px 16px rgba(35, 75, 60, 0.05)',
            marginBottom: '16px',
            border: '1px solid #E5ECE7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ 
                  fontSize: '11px', 
                  color: '#234B3C', 
                  background: '#EBF7E5',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '4px'
                }}>
                  Next-Day Scheduled Delivery
                </span>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Outfit', color: '#15221B' }}>
                  {currentOrder?.deliveryDate} • {currentOrder?.deliverySlot}
                </div>
                <div style={{ fontSize: '12.5px', color: '#52635A', marginTop: '2px' }}>
                  🏢 {currentOrder?.societyName} ({currentOrder?.flatNo})
                </div>
              </div>

              <span style={{
                background: isCancelled ? '#FEE2E2' : '#FEF3C7',
                color: isCancelled ? '#DC2626' : '#92400E',
                fontWeight: 800,
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                {currentOrder?.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Interactive Van Transit Visualizer */}
          <LiveVanTransitVisualizer 
            currentOrder={currentOrder} 
            currentStepIdx={currentStepIdx} 
          />
        </>
      )}

      {/* Items Summary in this Order */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E5ECE7',
        boxShadow: '0 4px 16px rgba(35, 75, 60, 0.04)',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '16px', color: '#15221B', margin: '0 0 12px', fontWeight: 800 }}>Items in this Order</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentOrder?.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < currentOrder.items.length - 1 ? '1px dashed #F0F4F2' : 'none' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#15221B' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#F1F5F9', color: '#0F172A', fontWeight: 700, fontSize: '11px', padding: '1px 6px', borderRadius: '4px' }}>
                    Qty: {item.qty}
                  </span>
                  {item.unit && (
                    <span style={{ color: '#64748B' }}>
                      • {item.unit}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontWeight: 800, color: '#234B3C', fontSize: '13.5px' }}>
                ₹{item.totalPrice !== undefined && item.totalPrice !== null ? item.totalPrice : (item.price * item.qty)}
              </div>
            </div>
          ))}
          {(!currentOrder?.items || currentOrder.items.length === 0) && (
            <div style={{ fontSize: '13px', color: '#64748B', padding: '8px 0' }}>
              {currentOrder?.itemsCount ? `${currentOrder.itemsCount} produce item(s) included` : 'No item details available'}
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {currentOrder?.subtotal !== undefined && currentOrder?.subtotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B' }}>
              <span>Items Subtotal</span>
              <span>₹{currentOrder.subtotal}</span>
            </div>
          )}
          {currentOrder?.bulkSavings !== undefined && currentOrder?.bulkSavings > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
              <span>Volume Bulk Savings</span>
              <span>-₹{currentOrder.bulkSavings}</span>
            </div>
          )}
          {currentOrder?.deliveryFee !== undefined && currentOrder?.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B' }}>
              <span>Delivery Fee</span>
              <span>₹{currentOrder.deliveryFee}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', fontSize: '15px', fontWeight: 800, color: '#234B3C', borderTop: '1px dashed #E2E8F0', marginTop: '4px' }}>
            <div>
              <span>{isCod ? (
                (currentOrder?.paymentStatus === 'PAID' || currentOrder?.codPaymentReceived) ? (
                  <span style={{ color: '#166534' }}>Total Paid (Cash Collected ✅)</span>
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

        {/* Cancellation / Doorstep Return Actions */}
        {currentOrder?.status === 'CONFIRMED' && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F0F4F2', display: 'flex', justifyContent: 'flex-end' }}>
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
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <XCircle size={14} />
              <span>Cancel Order</span>
            </button>
          </div>
        )}

        {currentOrder?.status === 'OUT_FOR_DELIVERY' && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F0F4F2', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setIsDoorstepModalOpen(true);
                setDoorstepReason('Produce Quality Damaged / Spoiled / Rotten');
                setDoorstepNotes('');
                setIsConfirmingDoorstep(false);
                setCancelErrorMsg('');
              }}
              style={{
                background: '#FFF1F2',
                color: '#BE123C',
                border: '1.5px solid #FDA4AF',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(190, 18, 60, 0.15)'
              }}
              title="Inspect produce upon driver arrival and return/reject if quality is damaged"
            >
              <XCircle size={14} />
              <span>Reject / Return at Doorstep</span>
            </button>
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL (PRE-PACKING) */}
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
              <h3 style={{ fontSize: '18px', color: '#15221B', margin: 0, fontWeight: 800 }}>
                Cancel Order #{currentOrder?.id}?
              </h3>
              <p style={{ color: '#52635A', fontSize: '12.5px', margin: '6px 0 0' }}>
                {isCod
                  ? 'Since this order is scheduled for Pay on Delivery, no payment was collected and your order will be cancelled immediately.'
                  : 'Your order will be cancelled immediately and no further charges will apply.'}
              </p>
            </div>

            {cancelErrorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '10px 14px', color: '#B91C1C', fontSize: '12px', marginBottom: '14px' }}>
                {cancelErrorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmCancel}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#234B3C', marginBottom: '6px' }}>
                  Reason for Cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-input-control"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Need to change delivery flat / address">Need to change delivery flat / address</option>
                  <option value="Forgot to add required items">Forgot to add required items</option>
                  <option value="Away from home on delivery date">Away from home on delivery date</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div style={{ background: '#F7FAF8', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: '#52635A', marginBottom: '16px', border: '1px solid #E5ECE7' }}>
                <div>• Items: <strong>{currentOrder?.items?.map(i => i.name).join(', ')}</strong></div>
                <div style={{ marginTop: '3px' }}>• Scheduled Drop: <strong>{currentOrder?.deliveryDate} ({currentOrder?.deliverySlot})</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', color: '#475569' }}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  style={{ 
                    flex: 2, 
                    padding: '10px', 
                    background: isCancelling ? '#94A3B8' : '#DC2626', 
                    color: '#FFF', 
                    border: 'none', 
                    borderRadius: '9999px', 
                    fontWeight: 800, 
                    fontSize: '12.5px', 
                    cursor: isCancelling ? 'not-allowed' : 'pointer', 
                    boxShadow: isCancelling ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.25)' 
                  }}
                >
                  {isCancelling ? 'Cancelling on Server...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DOORSTEP PRODUCE INSPECTION & REJECTION MODAL (OPTION A) ================= */}
      {isDoorstepModalOpen && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsDoorstepModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1.5px solid #FDA4AF' }}>
                <XCircle size={26} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#15221B', margin: 0, fontWeight: 800 }}>
                Doorstep Produce Return & Rejection
              </h3>
              <p style={{ color: '#52635A', fontSize: '12.5px', margin: '6px 0 0', lineHeight: 1.4 }}>
                Produce has arrived with the delivery executive. Inspect your produce now; if items are damaged or unacceptable, reject here.
              </p>
            </div>

            {cancelErrorMsg && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '10px 14px', color: '#B91C1C', fontSize: '12px', marginBottom: '14px' }}>
                {cancelErrorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmDoorstepRejection}>
              {/* Reason */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#234B3C', marginBottom: '6px' }}>
                  Doorstep Rejection Reason:
                </label>
                <select
                  value={doorstepReason}
                  onChange={(e) => setDoorstepReason(e.target.value)}
                  className="form-input-control"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '12.5px', boxSizing: 'border-box' }}
                >
                  <option value="Produce Quality Damaged / Spoiled / Rotten">Produce Quality Damaged / Spoiled / Rotten</option>
                  <option value="Incorrect Produce / Wrong Item Delivered">Incorrect Produce / Wrong Item Delivered</option>
                  <option value="Crate Sealed Damaged / Crushed Produce">Crate Sealed Damaged / Crushed Produce</option>
                  <option value="Resident Refused Delivery at Doorstep">Resident Refused Delivery at Doorstep</option>
                  <option value="Resident Not Available at Drop Time">Resident Not Available at Drop Time</option>
                  <option value="Other Exception">Other Exception</option>
                </select>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#234B3C', marginBottom: '6px' }}>
                  Inspection Details / Notes (Optional):
                </label>
                <input
                  type="text"
                  value={doorstepNotes}
                  onChange={(e) => setDoorstepNotes(e.target.value)}
                  placeholder="e.g. Tomatoes overripe, grapes crushed in bag"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Photo Upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#234B3C', marginBottom: '6px' }}>
                  Photo of Damaged Produce (Optional, Max 4):
                </label>
                {doorstepPhotos.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {doorstepPhotos.map((photo, pIdx) => (
                      <div key={pIdx} style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                        <img src={photo} alt={`Proof ${pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setDoorstepPhotos(prev => prev.filter((_, i) => i !== pIdx))}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: '#DC2626',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            fontSize: '9px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {doorstepPhotos.length < 4 && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px dashed #CBD5E1',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2563EB'
                  }}>
                    <Camera size={16} />
                    <span>{doorstepPhotos.length > 0 ? '＋ Add Another Photo' : '📸 Snap Photo with Camera'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleDoorstepPhotoCapture}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* Confirmation Step */}
              {isConfirmingDoorstep ? (
                <div style={{
                  background: '#FFF1F2',
                  border: '1.5px solid #F43F5E',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9F1239', fontWeight: 800, fontSize: '13px' }}>
                    <AlertCircle size={16} color="#E11D48" />
                    <span>Confirm Doorstep Produce Return?</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4C0519', lineHeight: 1.4 }}>
                    • The driver will seal and return the produce crate to the warehouse hub.<br />
                    • {isCod
                      ? 'No payment collected. Order marked as returned.'
                      : `A full refund of ₹${currentOrder?.totalAmount} will be immediately initiated to your original payment source.`}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDoorstep(false)}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#475569' }}
                    >
                      ← Go Back
                    </button>
                    <button
                      type="submit"
                      disabled={isCancellingDoorstep}
                      style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      {isCancellingDoorstep ? 'Submitting...' : 'Yes, Confirm Rejection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDoorstepModalOpen(false)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', color: '#475569' }}
                  >
                    Keep Produce
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDoorstep(true)}
                    style={{ flex: 2, padding: '10px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '9999px', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <XCircle size={15} />
                    <span>Review & Reject Produce ➔</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Proof Photo Zoom Modal */}
      {previewProofPhotoModal && (
        <div 
          onClick={() => setPreviewProofPhotoModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{ 
              maxWidth: '520px', 
              width: '100%', 
              background: '#0F172A', 
              borderRadius: '14px', 
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              margin: 'auto'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewProofPhotoModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#FFF',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                fontSize: '14px'
              }}
            >
              ✕
            </button>
            <img 
              src={previewProofPhotoModal} 
              alt="Return / Cancellation Proof" 
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ padding: '12px 16px', background: '#1E293B', color: '#F1F5F9', fontSize: '12.5px', fontWeight: 700, textAlign: 'center' }}>
              Doorstep Return & Inspection Photo Proof
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  ArrowRight,
  AlertCircle,
  X,
  Star,
  Gift,
  Copy,
  MessageSquare,
  MapPin,
  Lock,
  Building2,
  Printer,
  FileText
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { orderService } from '../services/orderService';
import { discountService } from '../services/discountService';
import { reviewService } from '../services/reviewService';

export default function UserProfilePage({ forcedTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Route resolution with seamless backward compatibility
  const tabParam = searchParams.get('tab');
  const activeTab = forcedTab || (
    location.pathname === '/orders' ? 'orders' :
    location.pathname === '/history' ? 'history' :
    location.pathname === '/rewards' ? 'rewards' :
    location.pathname === '/profile' && tabParam ? tabParam :
    (tabParam || 'orders')
  );

  // If user visits /profile?tab=... redirect cleanly to the dedicated URL
  useEffect(() => {
    if (location.pathname === '/profile') {
      const tab = searchParams.get('tab');
      if (tab === 'orders') navigate('/orders', { replace: true });
      else if (tab === 'history') navigate('/history', { replace: true });
      else if (tab === 'rewards') navigate('/rewards', { replace: true });
    }
  }, [location.pathname, searchParams, navigate]);

  // Dynamic SEO Page Titles & Bookmarking
  useEffect(() => {
    if (activeTab === 'orders') {
      document.title = 'Active Orders & Live Tracking | Freshioz';
    } else if (activeTab === 'history') {
      document.title = 'Purchase History & Invoices | Freshioz';
    } else if (activeTab === 'rewards') {
      document.title = 'Rewards & Discounts Wallet | Freshioz';
    } else if (activeTab === 'profile') {
      document.title = 'Resident Profile & Delivery Address | Freshioz';
    }
  }, [activeTab]);

  const { 
    activeUser, 
    requestLogout,
    store, 
    approvedSocieties = [],
    setIsAuthModalOpen,
    addToCart,
    setIsCartOpen
  } = useStore();

  const userSociety = (approvedSocieties || []).find(s => 
    (activeUser?.societyId && s.id === activeUser.societyId) ||
    (activeUser?.societyName && s.name?.toLowerCase() === activeUser.societyName?.toLowerCase())
  ) || null;
  const societyFullAddress = activeUser?.address || userSociety?.address || 'APMC Delivery Cluster Drop Point';

  // Status sub-filter for Orders tab
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'DELIVERED' | 'IN_TRANSIT' | 'CANCELLED'
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Live order fetching from backend REST API (called unconditionally before early return)
  const [apiOrders, setApiOrders] = useState([]);
  const [_isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Customer Rewards & Discounts
  const [discounts, setDiscounts] = useState([]);
  const [_isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Customer Reviews State
  const [myReviews, setMyReviews] = useState([]);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewActiveTab, setReviewActiveTab] = useState('PRODUCT'); // 'PRODUCT' | 'DELIVERY'
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
  const [cropRatings, setCropRatings] = useState({});
  const [cropComments, setCropComments] = useState({});
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFeedbackMsg, setReviewFeedbackMsg] = useState('');

  // Website Review Modal
  const [isWebsiteReviewOpen, setIsWebsiteReviewOpen] = useState(false);
  const [websiteRating, setWebsiteRating] = useState(5);
  const [websiteComment, setWebsiteComment] = useState('');
  const [isSubmittingWebsiteReview, setIsSubmittingWebsiteReview] = useState(false);

  // Digital Invoice & Delivery Receipt Modal
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);
  const [reorderNotice, setReorderNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchUserData() {
      if (!activeUser?.phone) {
        setApiOrders([]);
        setDiscounts([]);
        setMyReviews([]);
        return;
      }
      setIsLoadingOrders(true);
      setIsLoadingDiscounts(true);
      try {
        const [ordersRes, discountsRes, reviewsRes] = await Promise.allSettled([
          orderService.getAll({ phone: activeUser.phone }),
          discountService.getMyDiscounts(),
          reviewService.getMyReviews()
        ]);
        if (isMounted) {
          if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
            setApiOrders(ordersRes.value);
          }
          if (discountsRes.status === 'fulfilled' && Array.isArray(discountsRes.value)) {
            setDiscounts(discountsRes.value);
          }
          if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
            setMyReviews(reviewsRes.value);
          }
        }
      } catch (err) {
        console.warn('User profile data fetch note:', err?.message || err);
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
          setIsLoadingDiscounts(false);
        }
      }
    }
    fetchUserData();
    return () => { isMounted = false; };
  }, [activeUser?.phone, activeUser?.id]);

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    if (cancellingOrder.status === 'DELIVERED' || cancellingOrder.status === 'CANCELLED') {
      alert(`Order cannot be cancelled because it is already ${cancellingOrder.status.toLowerCase()}.`);
      setCancellingOrder(null);
      return;
    }

    try {
      setIsCancelling(true);
      await orderService.cancel(cancellingOrder.id, {
        reason: cancelReason || 'Cancelled by resident before cutoff',
      });

      // Update in-memory API orders
      setApiOrders(prev => prev.map(o => o.id === cancellingOrder.id ? {
        ...o,
        status: 'CANCELLED',
        cancelledReason: cancelReason || 'Cancelled by resident before cutoff',
        cancelledAt: new Date().toISOString()
      } : o));

      const isCod = cancellingOrder.paymentMethod === 'PAY_ON_DELIVERY' || cancellingOrder.paymentMethod === 'COD' || cancellingOrder.paymentStatus === 'PENDING_COD';
      setCancelSuccessMsg(
        isCod
          ? `Order #${cancellingOrder.id} has been cancelled. Since this was a Pay-on-Delivery order, no payment was collected and no charges apply.`
          : `Order #${cancellingOrder.id} has been successfully cancelled. No further charges will apply.`
      );
      setCancellingOrder(null);
      setTimeout(() => setCancelSuccessMsg(''), 7000);
    } catch (err) {
      alert(err?.message || 'Failed to cancel order on the server. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const handleOpenReviewModal = (order) => {
    setReviewingOrder(order);
    setReviewActiveTab('PRODUCT');
    const firstItem = order.items?.[0] || null;
    setSelectedReviewProduct(firstItem);
    setReviewFeedbackMsg('');

    // Prepopulate crop ratings & comments independently from existing reviews
    const initialCropRatings = {};
    const initialCropComments = {};
    (order.items || []).forEach(item => {
      const pid = item.productId || item.id;
      const existing = myReviews.find(r => r.orderId === order.id && r.productId === pid);
      initialCropRatings[pid] = existing?.rating || 5;
      initialCropComments[pid] = existing?.comment || '';
    });
    setCropRatings(initialCropRatings);
    setCropComments(initialCropComments);

    // Prepopulate delivery rating & comment independently from existing review
    const existingDelivery = myReviews.find(r => r.orderId === order.id && r.type === 'DELIVERY');
    setDeliveryRating(existingDelivery?.rating || 5);
    setDeliveryComment(existingDelivery?.comment || '');
  };

  const handleSelectProductToReview = (item) => {
    setSelectedReviewProduct(item);
    setReviewFeedbackMsg('');
    const pid = item.productId || item.id;
    if (cropRatings[pid] === undefined) {
      const existing = myReviews.find(r => r.orderId === reviewingOrder?.id && r.productId === pid);
      setCropRatings(prev => ({ ...prev, [pid]: existing?.rating || 5 }));
      setCropComments(prev => ({ ...prev, [pid]: existing?.comment || '' }));
    }
  };

  const handleSelectDeliveryTab = () => {
    setReviewActiveTab('DELIVERY');
    setReviewFeedbackMsg('');
  };

  const handleSubmitOrderReview = async (e) => {
    e.preventDefault();
    if (!reviewingOrder) return;
    setIsSubmittingReview(true);
    setReviewFeedbackMsg('');

    try {
      if (reviewActiveTab === 'PRODUCT') {
        if (!selectedReviewProduct) {
          alert('Please select a product from your order to review.');
          return;
        }
        const productId = selectedReviewProduct.productId || selectedReviewProduct.id;
        const currentRating = cropRatings[productId] !== undefined ? cropRatings[productId] : 5;
        const currentComment = cropComments[productId] || '';
        const existing = myReviews.find(r => r.orderId === reviewingOrder.id && r.productId === productId);
        if (existing) {
          await reviewService.updateReview(existing.id, { rating: currentRating, comment: currentComment });
        } else {
          await reviewService.createReview({
            type: 'PRODUCT',
            orderId: reviewingOrder.id,
            productId,
            rating: currentRating,
            comment: currentComment
          });
        }
        setReviewFeedbackMsg(`Thank you! Your product review for ${selectedReviewProduct.name} has been submitted for moderation.`);
      } else {
        const existing = myReviews.find(r => r.orderId === reviewingOrder.id && r.type === 'DELIVERY');
        if (existing) {
          await reviewService.updateReview(existing.id, { rating: deliveryRating, comment: deliveryComment });
        } else {
          await reviewService.createReview({
            type: 'DELIVERY',
            orderId: reviewingOrder.id,
            rating: deliveryRating,
            comment: deliveryComment
          });
        }
        setReviewFeedbackMsg('Thank you! Your delivery experience rating has been recorded.');
      }

      const updated = await reviewService.getMyReviews();
      if (Array.isArray(updated)) setMyReviews(updated);
      setTimeout(() => {
        setReviewFeedbackMsg('');
      }, 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitWebsiteReview = async (e) => {
    e.preventDefault();
    setIsSubmittingWebsiteReview(true);
    try {
      const existing = myReviews.find(r => r.type === 'WEBSITE');
      if (existing) {
        await reviewService.updateReview(existing.id, { rating: websiteRating, comment: websiteComment });
      } else {
        await reviewService.createReview({
          type: 'WEBSITE',
          rating: websiteRating,
          comment: websiteComment
        });
      }
      const updated = await reviewService.getMyReviews();
      if (Array.isArray(updated)) setMyReviews(updated);
      setIsWebsiteReviewOpen(false);
      alert('Thank you for sharing your experience using Freshioz! Our product team truly appreciates your feedback.');
    } catch (err) {
      alert(err.message || 'Failed to submit website review. Please try again.');
    } finally {
      setIsSubmittingWebsiteReview(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="section-container" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '520px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#EBF2EE',
          color: '#234B3C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <User size={34} />
        </div>
        <h2 style={{ fontSize: '24px', color: '#15221B', fontWeight: 800, marginBottom: '8px' }}>Please Log In</h2>
        <p style={{ color: '#52635A', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Log in with your registered phone number to access your pending next-day deliveries, real-time tracking, and complete purchase history.
        </p>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            background: '#234B3C',
            color: '#FFF',
            padding: '12px 32px',
            borderRadius: '9999px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 4px 14px rgba(35, 75, 60, 0.25)'
          }}
        >
          Login / Register with OTP
        </button>
      </div>
    );
  }

  // Combine live API orders and local store orders (deduplicated by id)
  const combinedOrdersMap = new Map();
  (store.orders || []).forEach(o => {
    if (
      o.userPhone === activeUser.phone || 
      o.userId === activeUser.phone || 
      o.userId === activeUser.id || 
      (activeUser.phone === '9845012345' && (o.userId === 'user-1' || o.userPhone === '9845012345'))
    ) {
      combinedOrdersMap.set(o.id, o);
    }
  });
  apiOrders.forEach(o => {
    combinedOrdersMap.set(o.id, { ...(combinedOrdersMap.get(o.id) || {}), ...o });
  });

  const userOrders = Array.from(combinedOrdersMap.values()).sort((a, b) => 
    new Date(b.orderPlacedAt || b.createdAt || 0) - new Date(a.orderPlacedAt || a.createdAt || 0)
  );

  // Status buckets
  const pendingOrders = userOrders.filter(o => 
    ['CONFIRMED', 'PROCURING', 'AT_WAREHOUSE', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const completedOrders = userOrders.filter(o => o.status === 'DELIVERED');
  const cancelledOrders = userOrders.filter(o => o.status === 'CANCELLED');

  // Filtered orders based on selected sub-filter
  const displayedOrders = statusFilter === 'PENDING' 
    ? pendingOrders 
    : statusFilter === 'COMPLETED' 
    ? completedOrders 
    : statusFilter === 'CANCELLED' 
    ? cancelledOrders 
    : userOrders;

  const totalSpent = userOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.totalAmount, 0);
  const _totalCashbackGenerated = userOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + (o.societyCommissionEarned || 0), 0);

  // Quick reorder helper
  const handleReorder = (order) => {
    if (!order?.items || order.items.length === 0) {
      alert('No produce items found in this order to reorder.');
      return;
    }
    let addedCount = 0;
    (order.items || []).forEach(item => {
      const targetId = item.productId || item.id;
      let prod = (store.products || []).find(p => 
        (targetId && (p.id === targetId || p._id === targetId)) ||
        (p.name && item.name && p.name.trim().toLowerCase() === item.name.trim().toLowerCase())
      );
      if (!prod) {
        prod = {
          id: targetId || `reorder_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: item.name,
          category: item.category || 'Fresh Produce',
          image: item.image || item.imageUrl || '/banners/freshmarket.png',
          retailUnit: item.unit || '1 kg',
          retailPrice: item.price || item.retailPrice || 0,
          wholesaleUnit: item.unit || '1 crate',
          wholesalePrice: item.price || 0,
          gstPercent: item.gstPercent || 0
        };
      }
      addToCart(prod, item.isWholesale || false);
      addedCount++;
    });

    if (addedCount > 0) {
      setIsCartOpen(true);
      setReorderNotice(`Added ${addedCount} produce item(s) from Order #${order.id} to your cart!`);
      setTimeout(() => setReorderNotice(''), 4500);
    }
  };

  return (
    <div className="section-container" style={{ paddingTop: '12px', paddingBottom: '40px', maxWidth: '880px' }}>
      {/* Orders Tab Title Bar (Directly Above-the-Fold) */}
      {activeTab === 'orders' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#15221B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Active Orders & Live Tracking</span>
              {pendingOrders.length > 0 && (
                <span style={{
                  background: '#EBF7E5',
                  color: '#234B3C',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  {pendingOrders.length} Live
                </span>
              )}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#52635A' }}>
              Dawn farm harvest batching, van dispatch, and society drop timeline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const existing = myReviews.find(r => r.type === 'WEBSITE');
              if (existing) {
                setWebsiteRating(existing.rating || 5);
                setWebsiteComment(existing.comment || '');
              } else {
                setWebsiteRating(5);
                setWebsiteComment('');
              }
              setIsWebsiteReviewOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1.5px solid #C8DBD0',
              color: '#234B3C',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={13} />
            <span>Website Feedback</span>
          </button>
        </div>
      )}

      {/* History Tab Title Bar */}
      {activeTab === 'history' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#15221B', margin: 0 }}>
              Past Deliveries & Invoices
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#52635A' }}>
              Completed society drop deliveries with 1-click reorder and produce quality ratings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const existing = myReviews.find(r => r.type === 'WEBSITE');
              if (existing) {
                setWebsiteRating(existing.rating || 5);
                setWebsiteComment(existing.comment || '');
              } else {
                setWebsiteRating(5);
                setWebsiteComment('');
              }
              setIsWebsiteReviewOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1.5px solid #C8DBD0',
              color: '#234B3C',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={13} />
            <span>Website Feedback</span>
          </button>
        </div>
      )}

      {/* TAB 1: ORDERS & LIVE TRACKING */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Status Sub-Filter Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === 'ALL' ? '1.5px solid #234B3C' : '1px solid #DCE5E0',
                background: statusFilter === 'ALL' ? '#234B3C' : '#FFFFFF',
                color: statusFilter === 'ALL' ? '#FFFFFF' : '#52635A',
                transition: 'all 0.15s ease'
              }}
            >
              All Orders ({userOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === 'PENDING' ? '1.5px solid #234B3C' : '1px solid #DCE5E0',
                background: statusFilter === 'PENDING' ? '#234B3C' : '#FFFFFF',
                color: statusFilter === 'PENDING' ? '#FFFFFF' : '#52635A',
                transition: 'all 0.15s ease'
              }}
            >
              <span className={`pulse-indicator ${statusFilter === 'PENDING' ? '' : 'amber'}`} />
              <span>Pending & In-Transit ({pendingOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === 'COMPLETED' ? '1.5px solid #234B3C' : '1px solid #DCE5E0',
                background: statusFilter === 'COMPLETED' ? '#234B3C' : '#FFFFFF',
                color: statusFilter === 'COMPLETED' ? '#FFFFFF' : '#52635A',
                transition: 'all 0.15s ease'
              }}
            >
              Delivered ({completedOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('CANCELLED')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === 'CANCELLED' ? '1.5px solid #234B3C' : '1px solid #DCE5E0',
                background: statusFilter === 'CANCELLED' ? '#234B3C' : '#FFFFFF',
                color: statusFilter === 'CANCELLED' ? '#FFFFFF' : '#52635A',
                transition: 'all 0.15s ease'
              }}
            >
              Cancelled ({cancelledOrders.length})
            </button>
          </div>

          {cancelSuccessMsg && (
            <div style={{
              background: '#ECFDF5',
              border: '1.5px solid #059669',
              color: '#065F46',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Orders List View */}
          {displayedOrders.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1.5px solid #E5ECE7',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#83968D'
            }}>
              <Package size={36} color="#CBD8D0" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#15221B', marginBottom: '4px' }}>
                No {statusFilter.toLowerCase().replace(/_/g, ' ')} orders found
              </div>
              <p style={{ fontSize: '13px', color: '#52635A', maxWidth: '400px', margin: '0 auto 16px' }}>
                All farm harvests ordered before 9:00 PM are procured at 4:00 AM dawn and delivered tomorrow morning!
              </p>
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  background: '#234B3C',
                  color: '#FFF',
                  padding: '9px 20px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none'
                }}
              >
                Browse Farm Produce
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayedOrders.map(order => {
                const isPending = ['CONFIRMED', 'PROCURING', 'AT_WAREHOUSE', 'PACKED', 'OUT_FOR_DELIVERY'].includes(order.status);
                const isDelivered = order.status === 'DELIVERED';
                const isCancelled = order.status === 'CANCELLED';

                return (
                  <div
                    key={order.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: isPending ? '1.5px solid #A2D4B7' : '1.5px solid #E5ECE7',
                      padding: '20px 24px',
                      boxShadow: isPending ? '0 4px 16px rgba(35, 75, 60, 0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Order Top Bar: ID, Date, Status */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #EEF3F0'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '16px', color: '#15221B' }}>
                            {order.id}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#F0F4F2',
                            color: '#52635A'
                          }}>
                            {order.orderType || 'RETAIL'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#83968D', marginTop: '2px' }}>
                          Placed on: {new Date(order.orderPlacedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isPending && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: order.status === 'OUT_FOR_DELIVERY' ? '#EBF7E5' : '#FEF3C7',
                            color: order.status === 'OUT_FOR_DELIVERY' ? '#234B3C' : '#92400E',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            border: order.status === 'OUT_FOR_DELIVERY' ? '1px solid #A2D4B7' : '1px solid #FDE68A'
                          }}>
                            <span className="pulse-indicator" style={{ background: order.status === 'OUT_FOR_DELIVERY' ? '#234B3C' : '#D97706' }} />
                            <span>{order.status.replace(/_/g, ' ')}</span>
                          </span>
                        )}

                        {isDelivered && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#EBF7E5',
                            color: '#234B3C',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '5px 12px',
                            borderRadius: '9999px'
                          }}>
                            <CheckCircle2 size={13} color="#78B159" />
                            <span>DELIVERED</span>
                          </span>
                        )}

                        {isCancelled && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '5px 12px',
                            borderRadius: '9999px'
                          }}>
                            <XCircle size={13} color="#EF4444" />
                            <span>CANCELLED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Scheduled Info & Drop Desk */}
                    <div style={{
                      background: isPending ? '#F7FAF8' : '#FAFBFB',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      margin: '14px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '12.5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#234B3C' }}>
                        <Clock size={15} color="#F28E14" />
                        <span>
                          <strong>Delivery Schedule:</strong> {order.deliveryDate} ({order.deliverySlot})
                        </span>
                      </div>

                      <div style={{ color: '#52635A' }}>
                        Drop Point: <strong>{order.flatNo}</strong> • {order.societyName}
                      </div>
                    </div>

                    {/* Items Purchased List */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Produce Items ({order.items?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px' }}>
                            <div style={{ color: '#15221B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>•</span>
                              <span>{item.name}</span>
                              <span style={{ color: '#83968D', fontSize: '12px' }}>({item.qty} * {item.unit})</span>
                            </div>
                            <div style={{ fontWeight: 700, color: '#234B3C' }}>
                              ₹{item.price * item.qty}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation Note if cancelled */}
                    {isCancelled && order.cancelledReason && (
                      <div style={{
                        background: '#FFF5F5',
                        border: '1px solid #FED7D7',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '12.5px',
                        color: '#9B2C2C',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={15} color="#E53E3E" />
                        <div>
                          <strong>Cancelled:</strong> {order.cancelledReason || 'Cancelled before cutoff'}
                          {order.paymentMethod === 'PAY_ON_DELIVERY' || order.paymentMethod === 'COD' || order.paymentStatus === 'PENDING_COD'
                            ? ' • No payment collected (Pay on Delivery)'
                            : ''}
                        </div>
                      </div>
                    )}

                    {/* Order Footer: Total, Cashback, and Track Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '14px',
                      borderTop: '1px solid #EEF3F0'
                    }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#15221B' }}>
                          {order.status === 'CANCELLED' 
                            ? `Order Value: ₹${order.totalAmount}`
                            : (order.paymentMethod === 'PAY_ON_DELIVERY' || order.paymentStatus === 'PENDING_COD'
                              ? `Pay on Delivery: ₹${order.totalAmount}`
                              : `Total Paid: ₹${order.totalAmount}`)}
                        </div>
                      </div>

                      {/* Actions Track: Native App Horizontal Scroll */}
                      <div className="order-actions-scroll-track">
                        {/* PENDING: PROMINENT LIVE TRACK BUTTON */}
                        {isPending && (
                          <Link
                            to={`/tracking/${order.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: '#234B3C',
                              color: '#FFFFFF',
                              padding: '8px 16px',
                              borderRadius: '9999px',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(35, 75, 60, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Truck size={14} />
                            <span>Track Live</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}

                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('Placed order by mistake');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              background: '#FFF5F5',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '7px 13px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        )}

                        {/* DELIVERED: Rate, Reorder and Receipt button */}
                        {isDelivered && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                background: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FDE68A',
                                padding: '7px 14px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Star size={13} fill="#F59E0B" color="#F59E0B" />
                              <span>Rate</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                background: '#EBF2EE',
                                color: '#234B3C',
                                border: '1px solid #C8DBD0',
                                padding: '7px 14px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Reorder</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setViewingReceiptOrder(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                background: '#F8FAF9',
                                border: '1px solid #D5E2DA',
                                color: '#234B3C',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                padding: '7px 14px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <FileText size={13} />
                              <span>Receipt</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PURCHASE HISTORY & TRANSACTION LEDGER */}
      {activeTab === 'history' && (() => {
        const historyDisplayedOrders = historyFilter === 'DELIVERED'
          ? completedOrders
          : historyFilter === 'IN_TRANSIT'
          ? pendingOrders
          : historyFilter === 'CANCELLED'
          ? cancelledOrders
          : userOrders;

        const totalItemsOrdered = userOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => 
          acc + (o.items?.reduce((sum, i) => sum + i.qty, 0) || 0), 0);

        return (
          <div>
            {/* Summary Stat Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5ECE7' }}>
                <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>All Transactions</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>{userOrders.length}</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>Total orders recorded</div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5ECE7' }}>
                <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>₹{totalSpent}</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>Zero middleman mandi rates</div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5ECE7' }}>
                <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Batches</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{completedOrders.length}</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>100% early dawn gate drops</div>
              </div>

              <div style={{ background: '#F0F7F3', borderRadius: '16px', padding: '18px', border: '1.5px solid #CDE2D6' }}>
                <div style={{ fontSize: '12px', color: '#234B3C', fontWeight: 700, textTransform: 'uppercase' }}>Produce Units</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>{totalItemsOrdered}</div>
                <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>Fresh vegetables & fruits</div>
              </div>
            </div>

            {/* Sub-Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '16px'
            }}>
              <button
                type="button"
                onClick={() => setHistoryFilter('ALL')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: historyFilter === 'ALL' ? '1.5px solid #234B3C' : '1px solid #DCE5E0',
                  background: historyFilter === 'ALL' ? '#234B3C' : '#FFFFFF',
                  color: historyFilter === 'ALL' ? '#FFFFFF' : '#52635A',
                  transition: 'all 0.15s ease'
                }}
              >
                All Transactions ({userOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setHistoryFilter('DELIVERED')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: historyFilter === 'DELIVERED' ? '1.5px solid #059669' : '1px solid #DCE5E0',
                  background: historyFilter === 'DELIVERED' ? '#059669' : '#FFFFFF',
                  color: historyFilter === 'DELIVERED' ? '#FFFFFF' : '#52635A',
                  transition: 'all 0.15s ease'
                }}
              >
                Delivered ({completedOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setHistoryFilter('IN_TRANSIT')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: historyFilter === 'IN_TRANSIT' ? '1.5px solid #2563EB' : '1px solid #DCE5E0',
                  background: historyFilter === 'IN_TRANSIT' ? '#2563EB' : '#FFFFFF',
                  color: historyFilter === 'IN_TRANSIT' ? '#FFFFFF' : '#52635A',
                  transition: 'all 0.15s ease'
                }}
              >
                In-Transit / Pending ({pendingOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setHistoryFilter('CANCELLED')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: historyFilter === 'CANCELLED' ? '1.5px solid #DC2626' : '1px solid #DCE5E0',
                  background: historyFilter === 'CANCELLED' ? '#DC2626' : '#FFFFFF',
                  color: historyFilter === 'CANCELLED' ? '#FFFFFF' : '#52635A',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancelled ({cancelledOrders.length})
              </button>
            </div>

            {/* Historical Order Items Breakdown */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E5ECE7',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', marginBottom: '2px' }}>
                    Purchase History & Invoices
                  </h3>
                  <p style={{ fontSize: '13px', color: '#52635A', margin: 0 }}>
                    Every transaction is permanently logged with receipt and breakdown.
                  </p>
                </div>
                <div style={{ fontSize: '12px', background: '#F1F5F3', padding: '4px 10px', borderRadius: '8px', color: '#234B3C', fontWeight: 700 }}>
                  Showing {historyDisplayedOrders.length} records
                </div>
              </div>

              {historyDisplayedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#83968D' }}>
                  <Clock size={32} color="#CBD8D0" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 700, color: '#15221B', marginBottom: '4px' }}>
                    No transactions match filter ({historyFilter.toLowerCase().replace(/_/g, ' ')})
                  </div>
                  <p style={{ fontSize: '13px', color: '#52635A', maxWidth: '360px', margin: '0 auto' }}>
                    Your placed orders appear here in real-time immediately after confirmation.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {historyDisplayedOrders.map(order => {
                    const isDelivered = order.status === 'DELIVERED';
                    const isPending = ['CONFIRMED', 'PROCURING', 'AT_WAREHOUSE', 'PACKED', 'OUT_FOR_DELIVERY'].includes(order.status);
                    const _isCancelled = order.status === 'CANCELLED';

                    const statusBg = isDelivered ? '#ECFDF5' : isPending ? '#EFF6FF' : '#FEF2F2';
                    const statusColor = isDelivered ? '#059669' : isPending ? '#2563EB' : '#DC2626';
                    const statusBorder = isDelivered ? '#A7F3D0' : isPending ? '#BFDBFE' : '#FECACA';

                    return (
                      <div
                        key={`history-${order.id}`}
                        style={{
                          background: '#FAFBFB',
                          borderRadius: '16px',
                          border: '1.5px solid #E5ECE7',
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Transaction Top Row */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                          paddingBottom: '10px',
                          borderBottom: '1px solid #EEF3F0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '15px', color: '#234B3C' }}>
                              #{order.id}
                            </span>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 800,
                              background: statusBg,
                              color: statusColor,
                              border: `1px solid ${statusBorder}`,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {order.status}
                            </span>
                            <span style={{ fontSize: '12px', color: '#52635A' }}>
                              {order.orderPlacedAt 
                                ? new Date(order.orderPlacedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : order.deliveryDate}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                            {order.paymentMethod === 'UPI' ? '💳 UPI Paid' : '💵 Cash on Delivery'}
                          </div>
                        </div>

                        {/* Transaction Items */}
                        <div style={{ fontSize: '13px', color: '#15221B' }}>
                          <div style={{ fontWeight: 700, color: '#52635A', fontSize: '12px', marginBottom: '4px' }}>
                            Items Purchased:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {order.items.map((i, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '8px',
                                  padding: '3px 9px',
                                  fontSize: '12px',
                                  color: '#334155'
                                }}
                              >
                                {i.name} — {i.qty} * {i.unit || 'Pack'} — ₹{i.price * i.qty}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Destination & Financials */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          paddingTop: '8px',
                          borderTop: '1px solid #EEF3F0'
                        }}>
                          <div style={{ fontSize: '12.5px', color: '#52635A' }}>
                            🏢 <strong>{order.societyName || 'Greenfield Heights'}</strong> ({order.flatNo || 'Tower B - Flat 402'})
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                Sub: ₹{order.subtotal} | Delivery: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: '#15221B' }}>
                                Total: ₹{order.totalAmount}
                              </div>
                            </div>

                            <div className="order-actions-scroll-track">
                              {isDelivered && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReviewModal(order)}
                                    style={{
                                      background: '#FEF3C7',
                                      color: '#92400E',
                                      border: '1px solid #FDE68A',
                                      padding: '7px 14px',
                                      borderRadius: '9999px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      whiteSpace: 'nowrap',
                                      flexShrink: 0
                                    }}
                                  >
                                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                    <span>Rate</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReorder(order)}
                                    style={{
                                      background: '#EBF2EE',
                                      color: '#234B3C',
                                      border: '1px solid #C8DBD0',
                                      padding: '7px 14px',
                                      borderRadius: '9999px',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      whiteSpace: 'nowrap',
                                      flexShrink: 0
                                    }}
                                  >
                                    <RotateCcw size={12} />
                                    <span>Reorder</span>
                                  </button>
                                </>
                              )}

                              {isPending ? (
                                <Link
                                  to={`/tracking/${order.id}`}
                                  style={{
                                    background: '#234B3C',
                                    color: '#FFFFFF',
                                    padding: '7px 14px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}
                                >
                                  <span>Track Live</span>
                                  <ChevronRight size={13} />
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setViewingReceiptOrder(order)}
                                  style={{
                                    background: '#F8FAF9',
                                    border: '1px solid #D5E2DA',
                                    color: '#234B3C',
                                    padding: '7px 14px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}
                                >
                                  <FileText size={12} />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* TAB 3: RESIDENT PROFILE & DELIVERY ADDRESS */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Top Resident Header Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '12px 18px',
            boxShadow: '0 2px 10px rgba(21, 34, 27, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #234B3C 0%, #173328 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {activeUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#15221B', letterSpacing: '-0.3px', margin: 0 }}>
                    {activeUser.name}
                  </h1>
                  <span style={{
                    background: '#EBF7E5',
                    color: '#234B3C',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <CheckCircle2 size={12} color="#78B159" /> Verified Resident
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#52635A', marginTop: '1px' }}>
                  +91 {activeUser.phone} {activeUser.email ? `• ${activeUser.email}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const existing = myReviews.find(r => r.type === 'WEBSITE');
                  if (existing) {
                    setWebsiteRating(existing.rating || 5);
                    setWebsiteComment(existing.comment || '');
                  } else {
                    setWebsiteRating(5);
                    setWebsiteComment('');
                  }
                  setIsWebsiteReviewOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  background: '#EBF2EE',
                  border: '1.5px solid #C8DBD0',
                  color: '#234B3C',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Share feedback about the Freshioz website"
              >
                <MessageSquare size={13} />
                <span>Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => requestLogout('USER')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  background: '#FFF1F2',
                  border: '1.5px solid #FFE4E6',
                  color: '#E11D48',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Sign out of your Freshioz account"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Personal Resident Details */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '14px 18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#15221B', marginBottom: '10px' }}>
              Resident Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#15221B', marginTop: '2px' }}>{activeUser.name}</div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Registered Mobile</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#15221B', marginTop: '2px' }}>+91 {activeUser.phone}</div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#15221B', marginTop: '2px' }}>{activeUser.email || 'Not provided'}</div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Member Status</label>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#234B3C', marginTop: '2px' }}>Active Community Resident</div>
              </div>
            </div>
          </div>

          {/* Society & Drop Desk Details */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E5ECE7',
            padding: '14px 18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#15221B', marginBottom: '10px' }}>
              Registered Society & Delivery Point
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Apartment / Hostel Name</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#15221B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{activeUser.societyName || 'Assigned Society'}</span>
                  {userSociety?.type && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: userSociety.type === 'HOSTEL' ? '#FEF3C7' : '#ECFDF5',
                      color: userSociety.type === 'HOSTEL' ? '#B45309' : '#047857'
                    }}>
                      {userSociety.type === 'HOSTEL' ? 'HOSTEL' : 'APARTMENT'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Wing / Flat Number</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#15221B', marginTop: '2px' }}>{activeUser.flatNo || 'Flat/Room'}</div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Preferred Morning Slot</label>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#234B3C', marginTop: '2px' }}>06:30 AM – 08:30 AM (Next Day)</div>
              </div>

              <div>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Society Collection Point</label>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#234B3C', marginTop: '2px' }}>Main Security Gate / Lobby Drop Desk</div>
              </div>

              {/* Complete Verified Delivery Address Card */}
              <div style={{ gridColumn: '1 / -1', marginTop: '2px' }}>
                <label style={{ fontSize: '10.5px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>
                  Verified Society Delivery Hub Address
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '11px 14px',
                  marginTop: '4px',
                  fontSize: '13px',
                  color: '#1E293B',
                  lineHeight: 1.4
                }}>
                  <MapPin size={17} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                      {societyFullAddress}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <Lock size={11} color="#059669" />
                      <span>Verified Delivery Hub (All dawn farm-fresh produce is dropped here for security / doorstep handover)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REWARDS & ACCOUNT DISCOUNTS */}
      {activeTab === 'rewards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3D31 0%, #15221B 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(21, 34, 27, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                <Gift size={14} color="#86EFAC" />
                <span>Exclusive Account-Bound Rewards</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                My Rewards & Feedback Discounts
              </h2>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#CBD5E1', maxWidth: '520px', lineHeight: '1.5' }}>
                Earned from rating delivered harvests and providing feedback to our sourcing team. These discounts are tied directly to your registered number and apply seamlessly at checkout!
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              padding: '16px 24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#86EFAC' }}>
                {discounts.filter(d => d.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', marginTop: '2px' }}>
                Active Vouchers Available
              </div>
            </div>
          </div>

          {/* Active Discounts List */}
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Available Vouchers ({discounts.filter(d => d.status === 'ACTIVE').length})</span>
            </h3>

            {discounts.filter(d => d.status === 'ACTIVE').length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E5ECE7',
                padding: '40px 24px',
                textAlign: 'center',
                color: '#64748B'
              }}>
                <Gift size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#15221B', marginBottom: '4px' }}>
                  No active discount vouchers right now
                </div>
                <p style={{ fontSize: '13px', color: '#52635A', maxWidth: '420px', margin: '0 auto 16px' }}>
                  Rate your produce and delivery under <strong>Purchase History</strong> to receive exclusive thank-you discounts from our farm team!
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  style={{
                    background: '#234B3C',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View Delivered Orders to Rate
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {discounts.filter(d => d.status === 'ACTIVE').map(disc => (
                  <div
                    key={disc.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid #86EFAC',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          background: '#ECFDF5',
                          color: '#047857',
                          border: '1px solid #A7F3D0',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {disc.discountType === 'PERCENTAGE' ? `${disc.discountValue}% DISCOUNT` : `₹${disc.discountValue} FLAT REWARD`}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                          Exp: {new Date(disc.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0 8px' }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#15221B',
                          letterSpacing: '1px',
                          background: '#F1F5F9',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px dashed #CBD5E1'
                        }}>
                          {disc.code}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(disc.code)}
                          style={{
                            background: copiedCode === disc.code ? '#10B981' : '#EBF2EE',
                            color: copiedCode === disc.code ? '#FFF' : '#234B3C',
                            border: 'none',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {copiedCode === disc.code ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedCode === disc.code ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {disc.issueReason && (
                        <div style={{
                          fontSize: '12px',
                          color: '#334155',
                          background: '#F8FAFC',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          borderLeft: '3px solid #10B981'
                        }}>
                          <strong>Admin Note:</strong> {disc.issueReason}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '10px' }}>
                      {disc.minOrderAmount > 0 ? `• Applicable on orders above ₹${disc.minOrderAmount}` : '• No minimum purchase required'}
                      <div style={{ marginTop: '2px' }}>• Valid for {disc.maxUses - disc.usedCount} more order checkout</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Redeemed Discounts */}
          {discounts.filter(d => d.status !== 'ACTIVE').length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#64748B', marginBottom: '12px' }}>
                Used & Past Vouchers ({discounts.filter(d => d.status !== 'ACTIVE').length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {discounts.filter(d => d.status !== 'ACTIVE').map(disc => (
                  <div
                    key={disc.id}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '14px',
                      opacity: 0.85
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#475569' }}>{disc.code}</span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: disc.status === 'REDEEMED' ? '#E2E8F0' : '#FEE2E2',
                        color: disc.status === 'REDEEMED' ? '#475569' : '#DC2626'
                      }}>
                        {disc.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      {disc.discountType === 'PERCENTAGE' ? `${disc.discountValue}% OFF` : `₹${disc.discountValue} OFF`}
                      {disc.redeemedAt ? ` • Redeemed on ${new Date(disc.redeemedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <div className="modal-backdrop-overlay">
          <div className="modal-dialog-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-icon"
              onClick={() => setCancellingOrder(null)}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <XCircle size={28} />
              </div>
              <h3 style={{ fontSize: '19px', color: '#15221B', margin: 0 }}>
                Cancel Order #{cancellingOrder.id}?
              </h3>
              <p style={{ color: '#52635A', fontSize: '13px', margin: '6px 0 0' }}>
                {cancellingOrder.paymentMethod === 'PAY_ON_DELIVERY' || cancellingOrder.paymentMethod === 'COD' || cancellingOrder.paymentStatus === 'PENDING_COD'
                  ? 'Since this order is scheduled for Pay on Delivery, no payment was collected and your order will be cancelled immediately.'
                  : 'Your order will be cancelled immediately and no further charges will apply.'}
              </p>
            </div>

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
                <div>• Items: <strong>{cancellingOrder.items?.map(i => i.name).join(', ')}</strong></div>
                <div style={{ marginTop: '3px' }}>• Scheduled Drop: <strong>{cancellingOrder.deliveryDate} ({cancellingOrder.deliverySlot})</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
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

      {/* ================= ORDER & DELIVERY REVIEW MODAL ================= */}
      {reviewingOrder && (
        <div className="modal-backdrop-overlay" onClick={() => setReviewingOrder(null)}>
          <div className="modal-dialog-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-icon"
              onClick={() => setReviewingOrder(null)}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                  ORDER DELIVERED
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {reviewingOrder.deliveryDate}
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#15221B', margin: 0 }}>
                Rate Order #{reviewingOrder.id}
              </h3>
              <p style={{ fontSize: '13px', color: '#52635A', margin: '4px 0 0' }}>
                Your ratings help local farmers improve harvesting and earn you exclusive reward vouchers!
              </p>
            </div>

            {/* Sub-Tabs: Rate Crop vs Rate Delivery */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid #E5ECE7', marginBottom: '18px', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => {
                  setReviewActiveTab('PRODUCT');
                  setReviewFeedbackMsg('');
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: reviewActiveTab === 'PRODUCT' ? '#234B3C' : '#64748B',
                  borderBottom: reviewActiveTab === 'PRODUCT' ? '3px solid #234B3C' : '3px solid transparent',
                  marginBottom: '-3.5px'
                }}
              >
                🥬 Rate Farm Produce ({reviewingOrder.items?.length || 0})
              </button>
              <button
                type="button"
                onClick={handleSelectDeliveryTab}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: reviewActiveTab === 'DELIVERY' ? '#234B3C' : '#64748B',
                  borderBottom: reviewActiveTab === 'DELIVERY' ? '3px solid #234B3C' : '3px solid transparent',
                  marginBottom: '-3.5px'
                }}
              >
                🚚 Rate Delivery Service
              </button>
            </div>

            {/* TAB 1: PRODUCT REVIEW */}
            {reviewActiveTab === 'PRODUCT' && (
              <form onSubmit={handleSubmitOrderReview}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#15221B', marginBottom: '8px' }}>
                    Select Harvest Crop to Rate:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {reviewingOrder.items?.map((item) => {
                      const itemId = item.productId || item.id;
                      const isSelected = (selectedReviewProduct?.productId || selectedReviewProduct?.id) === itemId;
                      const isAlreadyReviewed = myReviews.some(r => r.orderId === reviewingOrder.id && r.productId === itemId);

                      return (
                        <button
                          key={itemId}
                          type="button"
                          onClick={() => handleSelectProductToReview(item)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #234B3C' : '1px solid #CBD5E1',
                            background: isSelected ? '#EBF2EE' : '#FFFFFF',
                            color: isSelected ? '#234B3C' : '#334155',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{item.name}</span>
                          {isAlreadyReviewed && (
                            <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 800 }}>★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedReviewProduct && (() => {
                  const currentCropId = selectedReviewProduct.productId || selectedReviewProduct.id;
                  const currentRating = cropRatings[currentCropId] !== undefined ? cropRatings[currentCropId] : 5;
                  const currentComment = cropComments[currentCropId] || '';

                  return (
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15221B', marginBottom: '8px' }}>
                        How fresh was the {selectedReviewProduct.name}?
                      </div>

                      {/* Star Rating Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setCropRatings(prev => ({ ...prev, [currentCropId]: starVal }))}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              transition: 'transform 0.1s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <Star
                              size={28}
                              fill={starVal <= currentRating ? '#F59E0B' : '#E2E8F0'}
                              color={starVal <= currentRating ? '#D97706' : '#CBD5E1'}
                            />
                          </button>
                        ))}
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', marginLeft: '6px' }}>
                          {currentRating === 5 ? '5 ★ Excellent & Crisp' : currentRating === 4 ? '4 ★ Good & Fresh' : currentRating === 3 ? '3 ★ Average' : currentRating === 2 ? '2 ★ Below Expectations' : '1 ★ Poor Quality'}
                        </span>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                          Written Feedback (Optional):
                        </label>
                        <textarea
                          value={currentComment}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCropComments(prev => ({ ...prev, [currentCropId]: val }));
                          }}
                          placeholder="Tell other residents and our farm sorters about the freshness, flavor, or texture..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {reviewFeedbackMsg && (
                  <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>{reviewFeedbackMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      flex: 2,
                      padding: '10px',
                      background: '#234B3C',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: isSubmittingReview ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Produce Rating'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DELIVERY REVIEW */}
            {reviewActiveTab === 'DELIVERY' && (
              <form onSubmit={handleSubmitOrderReview}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15221B', marginBottom: '8px' }}>
                    How was the society morning delivery drop?
                  </div>

                  {/* Star Rating Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setDeliveryRating(starVal)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transition: 'transform 0.1s ease'
                        }}
                      >
                        <Star
                          size={28}
                          fill={starVal <= deliveryRating ? '#F59E0B' : '#E2E8F0'}
                          color={starVal <= deliveryRating ? '#D97706' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', marginLeft: '6px' }}>
                      {deliveryRating === 5 ? '5 ★ Prompt & Well-Packed' : deliveryRating === 4 ? '4 ★ Satisfactory' : deliveryRating === 3 ? '3 ★ Average' : deliveryRating === 2 ? '2 ★ Delayed / Damaged' : '1 ★ Unsatisfactory'}
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Delivery Comments (Optional):
                    </label>
                    <textarea
                      value={deliveryComment}
                      onChange={(e) => setDeliveryComment(e.target.value)}
                      placeholder="Was the crate drop at your lobby desk on time? Did the rider follow gate delivery notes?"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {reviewFeedbackMsg && (
                  <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>{reviewFeedbackMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      flex: 2,
                      padding: '10px',
                      background: '#234B3C',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: isSubmittingReview ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Delivery Rating'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= WEBSITE PLATFORM REVIEW MODAL ================= */}
      {isWebsiteReviewOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsWebsiteReviewOpen(false)}>
          <div className="modal-dialog-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-icon"
              onClick={() => setIsWebsiteReviewOpen(false)}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EBF2EE', color: '#234B3C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <MessageSquare size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#15221B', margin: 0 }}>
                Website & Platform Feedback
              </h3>
              <p style={{ fontSize: '13px', color: '#52635A', margin: '6px 0 0' }}>
                How easy was it to discover produce, customize quantities, and place your order?
              </p>
            </div>

            <form onSubmit={handleSubmitWebsiteReview}>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setWebsiteRating(starVal)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star
                        size={32}
                        fill={starVal <= websiteRating ? '#F59E0B' : '#E2E8F0'}
                        color={starVal <= websiteRating ? '#D97706' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                  {websiteRating === 5 ? '5 ★ Loved the website experience!' : websiteRating === 4 ? '4 ★ Good & easy to use' : websiteRating === 3 ? '3 ★ Average' : websiteRating === 2 ? '2 ★ Hard to navigate' : '1 ★ Needs major improvement'}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Your Suggestions / Experience (Optional):
                </label>
                <textarea
                  value={websiteComment}
                  onChange={(e) => setWebsiteComment(e.target.value)}
                  placeholder="Tell us what you liked or what features you would like to see added..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsWebsiteReviewOpen(false)}
                  style={{ flex: 1, padding: '11px', background: '#F1F5F9', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWebsiteReview}
                  style={{
                    flex: 2,
                    padding: '11px',
                    background: '#234B3C',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isSubmittingWebsiteReview ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingWebsiteReview ? 'Submitting...' : 'Submit Website Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DIGITAL TAX INVOICE & DELIVERY RECEIPT MODAL ================= */}
      {viewingReceiptOrder && (
        <div className="modal-backdrop-overlay" onClick={() => setViewingReceiptOrder(null)}>
          <div 
            className="modal-dialog-box" 
            style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EBF2EE', color: '#234B3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', margin: 0 }}>
                    Delivery Receipt & Invoice
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Order #{viewingReceiptOrder.id}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Print or Save as PDF"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingReceiptOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="printable-receipt-card" style={{ background: '#FAFBFB', border: '1px solid #E5ECE7', borderRadius: '12px', padding: '20px' }}>
              {/* Brand Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1.5px dashed #CBD5E1', paddingBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#234B3C', letterSpacing: '-0.5px' }}>
                    Freshioz
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#52635A', marginTop: '2px' }}>
                    Farm-Direct Fresh Produce • Dawn Mandi Harvest
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    www.freshioz.com
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    background: viewingReceiptOrder.status === 'DELIVERED' ? '#EBF7E5' : '#FEF3C7',
                    color: viewingReceiptOrder.status === 'DELIVERED' ? '#234B3C' : '#92400E',
                    fontWeight: 800,
                    fontSize: '11.5px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    {viewingReceiptOrder.status === 'DELIVERED' ? 'Delivered & Completed' : viewingReceiptOrder.status}
                  </span>
                  <div style={{ fontSize: '12px', color: '#15221B', fontWeight: 700, marginTop: '6px' }}>
                    Receipt Date: {viewingReceiptOrder.deliveryDate || new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Order Meta & Delivery Destination */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#234B3C', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.4px' }}>
                    Delivered To
                  </div>
                  <div style={{ fontWeight: 700, color: '#15221B', fontSize: '13px' }}>
                    {activeUser?.name || 'Resident Customer'}
                  </div>
                  <div style={{ color: '#52635A', marginTop: '2px' }}>
                    Flat / Door: <strong>{viewingReceiptOrder.flatNo || activeUser?.flatNo || 'Registered Flat'}</strong>
                  </div>
                  <div style={{ color: '#52635A' }}>
                    Community: <strong>{viewingReceiptOrder.societyName || activeUser?.societyName || 'Apartment Society'}</strong>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11.5px', marginTop: '2px' }}>
                    Phone: {viewingReceiptOrder.userPhone || activeUser?.phone || '—'}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, color: '#234B3C', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.4px' }}>
                    Payment & Drop Info
                  </div>
                  <div style={{ color: '#52635A' }}>
                    Payment Mode: <strong style={{ color: '#15221B' }}>{viewingReceiptOrder.paymentMethod || 'Online'}</strong>
                  </div>
                  <div style={{ color: '#52635A', marginTop: '2px' }}>
                    Payment Status: <strong style={{ color: viewingReceiptOrder.paymentStatus === 'PAID' || viewingReceiptOrder.codPaymentReceived ? '#166534' : '#B91C1C' }}>
                      {viewingReceiptOrder.paymentStatus === 'PAID' || viewingReceiptOrder.codPaymentReceived ? 'PAID ✅' : 'Cash / UPI on Delivery'}
                    </strong>
                  </div>
                  <div style={{ color: '#52635A', marginTop: '2px' }}>
                    Slot: <strong>{viewingReceiptOrder.deliverySlot || 'Dawn Drop (7:00 AM)'}</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Crops Table */}
              <div style={{ marginBottom: '18px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#EBF2EE', color: '#234B3C', textAlign: 'left', borderBottom: '1.5px solid #CBD5E1' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 800 }}>#</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800 }}>Harvest Crop / Produce</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'center' }}>Pack Unit</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingReceiptOrder.items || []).map((item, idx) => {
                      const itemPrice = item.price || item.retailPrice || 0;
                      const itemQty = item.quantity || item.qty || 1;
                      const lineTotal = itemPrice * itemQty;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <td style={{ padding: '8px 10px', color: '#64748B' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#15221B' }}>
                            {item.name}
                            {item.isWholesale && (
                              <span style={{ marginLeft: '6px', fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px' }}>
                                Wholesale
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#52635A' }}>{item.unit || '1 kg'}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#15221B' }}>{itemQty}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#52635A' }}>₹{itemPrice}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#15221B' }}>₹{lineTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635A' }}>
                    <span>Items Subtotal:</span>
                    <span style={{ fontWeight: 700, color: '#15221B' }}>
                      ₹{viewingReceiptOrder.subtotal || viewingReceiptOrder.totalAmount}
                    </span>
                  </div>

                  {viewingReceiptOrder.bulkSavings > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700 }}>
                      <span>Volume Savings:</span>
                      <span>-₹{viewingReceiptOrder.bulkSavings}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52635A' }}>
                    <span>Community Delivery:</span>
                    <span style={{ color: '#166534', fontWeight: 700 }}>FREE (₹0)</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1.5px solid #CBD5E1',
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#234B3C',
                    marginTop: '4px'
                  }}>
                    <span>Grand Total:</span>
                    <span>₹{viewingReceiptOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Freshness Note & Guarantee */}
              <div style={{ background: '#EBF2EE', padding: '10px 14px', borderRadius: '8px', fontSize: '11.5px', color: '#234B3C', textAlign: 'center' }}>
                🌿 <strong>100% Morning Mandi Freshness Guarantee:</strong> Harvested directly at APMC mandi dawn and delivered directly to your society doorstep.
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const ord = viewingReceiptOrder;
                  setViewingReceiptOrder(null);
                  handleReorder(ord);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EBF2EE',
                  color: '#234B3C',
                  border: '1px solid #C8DBD0',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
                <span>Reorder These Items</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                style={{
                  padding: '9px 24px',
                  background: '#234B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Reorder Toast Notification */}
      {reorderNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#234B3C',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} color="#78B159" />
          <span>{reorderNotice}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Receipt,
  AlertCircle,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { saveFreshiozStore } from '../shared/freshiozStore';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders'; // 'orders' | 'history' | 'profile'

  const { 
    activeUser, 
    logoutUser, 
    store, 
    setIsAuthModalOpen,
    addToCart,
    setIsCartOpen
  } = useStore();

  // Status sub-filter for Orders tab
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    saveFreshiozStore(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === cancellingOrder.id ? {
        ...o,
        status: 'CANCELLED',
        cancelledReason: cancelReason || 'Cancelled by resident before cutoff',
        cancelledAt: new Date().toISOString()
      } : o)
    }));

    setCancelSuccessMsg(`Order #${cancellingOrder.id} successfully cancelled. 100% refund of ₹${cancellingOrder.totalAmount} will be returned to ${cancellingOrder.paymentMethod || 'UPI'}.`);
    setCancellingOrder(null);
    setTimeout(() => setCancelSuccessMsg(''), 7000);
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

  // Filter orders belonging to this user
  const userOrders = store.orders.filter(o => 
    o.userPhone === activeUser.phone || 
    o.userId === activeUser.phone || 
    o.userId === activeUser.id || 
    (activeUser.phone === '9845012345' && (o.userId === 'user-1' || o.userPhone === '9845012345'))
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
  const totalCashbackGenerated = userOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + (o.societyCommissionEarned || 0), 0);

  // Quick reorder helper
  const handleReorder = (order) => {
    let addedCount = 0;
    order.items.forEach(item => {
      const prod = store.products.find(p => p.id === item.id);
      if (prod) {
        addToCart(prod, item.isWholesale || false);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="section-container" style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '880px' }}>
      {/* Top User Profile Header Banner */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '22px',
        border: '1.5px solid #E5ECE7',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(21, 34, 27, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #234B3C 0%, #173328 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: 800,
            boxShadow: '0 6px 14px rgba(35, 75, 60, 0.25)',
            flexShrink: 0
          }}>
            {activeUser.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '23px', fontWeight: 800, color: '#15221B', letterSpacing: '-0.3px', margin: 0 }}>
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

            <div style={{ fontSize: '13.5px', color: '#52635A', marginTop: '3px' }}>
              +91 {activeUser.phone} {activeUser.email ? `• ${activeUser.email}` : ''}
            </div>

            <div style={{ fontSize: '12.5px', color: '#234B3C', fontWeight: 600, marginTop: '4px' }}>
              🏢 {activeUser.societyName || 'Greenfield Heights'} ({activeUser.flatNo || 'Tower B - Flat 402'})
            </div>
          </div>
        </div>

        {/* Prominent High-Visibility Logout Button */}
        <button
          type="button"
          onClick={() => {
            logoutUser();
            navigate('/');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '9999px',
            background: '#FFF1F2',
            border: '1.5px solid #FFE4E6',
            color: '#E11D48',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Sign out of your Freshioz account"
        >
          <LogOut size={16} />
          <span>Logout Account</span>
        </button>
      </div>

      {/* Top 3 Navigation Tabs: Orders, History, Profile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #E5ECE7',
        marginBottom: '24px',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'orders' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            color: activeTab === 'orders' ? '#234B3C' : '#52635A',
            borderBottom: activeTab === 'orders' ? '3px solid #234B3C' : '3px solid transparent',
            marginBottom: '-4px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={17} />
          <span>My Orders & Live Tracking</span>
          {pendingOrders.length > 0 && (
            <span style={{
              background: '#234B3C',
              color: '#FFF',
              fontSize: '11px',
              padding: '1px 7px',
              borderRadius: '9999px',
              fontWeight: 800
            }}>
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'history' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            color: activeTab === 'history' ? '#234B3C' : '#52635A',
            borderBottom: activeTab === 'history' ? '3px solid #234B3C' : '3px solid transparent',
            marginBottom: '-4px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Clock size={17} />
          <span>Purchase History</span>
          <span style={{
            background: '#F0F4F2',
            color: '#52635A',
            fontSize: '11px',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontWeight: 700
          }}>
            {completedOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'profile' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            color: activeTab === 'profile' ? '#234B3C' : '#52635A',
            borderBottom: activeTab === 'profile' ? '3px solid #234B3C' : '3px solid transparent',
            marginBottom: '-4px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <User size={17} />
          <span>My Profile & Society Details</span>
        </button>
      </div>

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
                              <span style={{ color: '#83968D', fontSize: '12px' }}>({item.unit}) × {item.qty}</span>
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
                        <div>Reason: {order.cancelledReason} • 100% Refunded back to UPI</div>
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
                          Total Paid: ₹{order.totalAmount}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* PENDING: PROMINENT LIVE TRACK BUTTON */}
                        {isPending && (
                          <Link
                            to={`/tracking/${order.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#234B3C',
                              color: '#FFFFFF',
                              padding: '9px 18px',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(35, 75, 60, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Truck size={15} />
                            <span>Track Delivery Live</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('Placed order by mistake');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#FFF5F5',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '8px 14px',
                              borderRadius: '9999px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <XCircle size={14} />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        {/* DELIVERED: Reorder and Invoice button */}
                        {isDelivered && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#EBF2EE',
                                color: '#234B3C',
                                border: '1px solid #C8DBD0',
                                padding: '8px 14px',
                                borderRadius: '9999px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Reorder Produce</span>
                            </button>

                            <Link
                              to={`/tracking/${order.id}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#52635A',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                padding: '8px 12px'
                              }}
                            >
                              <span>View Receipt</span>
                              <ChevronRight size={14} />
                            </Link>
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

      {/* TAB 2: PURCHASE HISTORY */}
      {activeTab === 'history' && (
        <div>
          {/* Summary Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5ECE7' }}>
              <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Delivered Orders</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>{completedOrders.length}</div>
              <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>100% farm-fresh dawn deliveries</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px', border: '1.5px solid #E5ECE7' }}>
              <div style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>₹{totalSpent}</div>
              <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>Zero middleman mandi pricing</div>
            </div>

            <div style={{ background: '#F0F7F3', borderRadius: '16px', padding: '18px', border: '1.5px solid #CDE2D6' }}>
              <div style={{ fontSize: '12px', color: '#234B3C', fontWeight: 700, textTransform: 'uppercase' }}>Produce Items Delivered</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#234B3C', marginTop: '4px' }}>
                {completedOrders.reduce((acc, o) => acc + (o.items?.reduce((sum, i) => sum + i.qty, 0) || 0), 0)} items
              </div>
              <div style={{ fontSize: '12px', color: '#52635A', marginTop: '2px' }}>Fresh vegetables & fruits</div>
            </div>
          </div>

          {/* Historical Order Items Breakdown */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E5ECE7',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', marginBottom: '16px' }}>
              Delivered Produce & Past Receipts
            </h3>

            {completedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#83968D' }}>
                <Clock size={32} color="#CBD8D0" style={{ margin: '0 auto 10px' }} />
                <div>No completed deliveries yet. Your orders will appear here once delivered tomorrow morning!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      background: '#FAFBFB',
                      borderRadius: '14px',
                      border: '1px solid #E5ECE7',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#234B3C' }}>{order.id}</span>
                        <span style={{ fontSize: '12px', color: '#52635A' }}>• Delivered {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : order.deliveryDate}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#52635A', marginTop: '4px' }}>
                        {order.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#15221B' }}>
                        ₹{order.totalAmount}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        style={{
                          background: '#234B3C',
                          color: '#FFF',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & SOCIETY DETAILS */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Personal Resident Details */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E5ECE7',
            padding: '24px 28px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', marginBottom: '16px' }}>
              Resident Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</label>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', marginTop: '4px' }}>{activeUser.name}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Registered Mobile</label>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', marginTop: '4px' }}>+91 {activeUser.phone}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', marginTop: '4px' }}>{activeUser.email || 'Not provided'}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Member Status</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#234B3C', marginTop: '4px' }}>Active Community Resident</div>
              </div>
            </div>
          </div>

          {/* Society & Drop Desk Details */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E5ECE7',
            padding: '24px 28px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15221B', marginBottom: '16px' }}>
              Registered Society & Delivery Point
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Apartment / Hostel Name</label>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', marginTop: '4px' }}>{activeUser.societyName}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Wing / Flat Number</label>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#15221B', marginTop: '4px' }}>{activeUser.flatNo}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Preferred Morning Slot</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#234B3C', marginTop: '4px' }}>06:30 AM – 08:30 AM (Next Day)</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#83968D', fontWeight: 700, textTransform: 'uppercase' }}>Society Collection Point</label>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#234B3C', marginTop: '4px' }}>Main Security Gate / Lobby Drop Desk</div>
              </div>
            </div>
          </div>

          {/* Account Actions & Logout Card */}
          <div style={{
            background: '#FFF5F5',
            borderRadius: '20px',
            border: '1.5px solid #FECDD3',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B' }}>
                Account Session & Security
              </div>
              <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '3px' }}>
                Sign out of your device. Your saved cart and past orders will remain safe on your registered phone.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                navigate('/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '9999px',
                background: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={16} />
              <span>Logout Freshioz Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <div className="modal-backdrop-overlay" onClick={() => setCancellingOrder(null)}>
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
                100% refund of <strong>₹{cancellingOrder.totalAmount}</strong> will be immediately initiated back to your {cancellingOrder.paymentMethod || 'UPI'}.
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
                  style={{ flex: 2, padding: '11px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '9999px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)' }}
                >
                  Confirm Cancellation & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

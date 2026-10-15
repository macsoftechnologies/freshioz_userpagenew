import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Leaf, 
  PackageCheck, 
  Truck, 
  Home, 
  Building2, 
  ArrowLeft,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { saveFreshiozStore } from '../shared/freshiozStore';
import LiveVanTransitVisualizer from '../components/tracking/LiveVanTransitVisualizer';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { store, activeUser } = useStore();

  // Secure order lookup: strictly match requested orderId or current user's latest order
  const userOrders = (store?.orders || []).filter(o => {
    if (!activeUser) return false;
    return o.userPhone === activeUser.phone || o.userId === activeUser.id;
  });

  const currentOrder = (store?.orders || []).find(o => o.id === orderId || o.uuid === orderId) 
    || userOrders[0] 
    || null;

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

  const steps = [
    { key: 'CONFIRMED', title: '1. Order Confirmed & Batched', desc: 'Batched with other society residents for dawn mandi harvest', icon: Clock },
    { key: 'PROCURING', title: '2. Procured from Mandi & Farmers', desc: 'Procurement officer bidding at morning APMC Mandi', icon: Leaf },
    { key: 'PACKED', title: '3. Quality Inspected & Flat Tagged', desc: 'Graded and packed at warehouse into society delivery crate', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', title: '4. Out for Delivery to Society', desc: 'Van en-route to your apartment/hostel drop point', icon: Truck },
    { key: 'DELIVERED', title: '5. Delivered to Society Desk', desc: 'Safely delivered and ready for morning pickup / doorstep', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'CONFIRMED': return 0;
      case 'PROCURING': return 1;
      case 'AT_WAREHOUSE':
      case 'PACKED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder?.status || 'CONFIRMED');

  const advanceOrderStatus = () => {
    if (!currentOrder || currentOrder.status === 'DELIVERED') return;
    const statusCycle = ['CONFIRMED', 'PROCURING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusCycle.indexOf(currentOrder.status);
    const nextIdx = currentIdx >= 0 ? Math.min(currentIdx + 1, statusCycle.length - 1) : 1;
    const nextStatus = statusCycle[nextIdx];

    saveFreshiozStore(prev => ({
      ...prev,
      orders: (prev.orders || []).map(o => o.id === currentOrder.id ? {
        ...o,
        status: nextStatus,
        ...(nextStatus === 'DELIVERED' ? { deliveredAt: new Date().toISOString() } : {})
      } : o)
    }));
  };

  return (
    <div className="section-container" style={{ paddingTop: '20px', maxWidth: '840px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#52635A', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
          <div>
            <h1 style={{ fontSize: '26px', color: '#234B3C' }}>Live Order Tracking</h1>
            <div style={{ fontSize: '13.5px', color: '#52635A', marginTop: '2px' }}>
              Order ID: <strong style={{ fontFamily: 'monospace', color: '#15221B' }}>{currentOrder?.id}</strong>
            </div>
          </div>

          <span style={{
            background: currentOrder?.status === 'DELIVERED' ? '#EBF7E5' : '#FEF3C7',
            color: currentOrder?.status === 'DELIVERED' ? '#234B3C' : '#92400E',
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
        onAdvanceStatus={advanceOrderStatus} 
      />

      {/* 5-Step Visual Tracker Pipeline */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: 'none',
        boxShadow: '0 8px 24px rgba(35, 75, 60, 0.05)',
        padding: '28px 24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ fontSize: '17px', color: '#15221B', marginBottom: '24px' }}>
          Farm-to-Doorstep Journey
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isCompleted ? '#234B3C' : '#F0F4F2',
                  color: isCompleted ? '#FFFFFF' : '#83968D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isCurrent ? '0 0 0 4px #C3E6B4' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: isCompleted ? '#15221B' : '#83968D'
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#52635A', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>

                {isCompleted && (
                  <CheckCircle2 size={18} color="#78B159" style={{ flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

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
                <div style={{ fontSize: '12px', color: '#52635A' }}>{item.qty} * {item.unit}</div>
              </div>
              <div style={{ fontWeight: 800, color: '#234B3C', fontSize: '14px' }}>
                ₹{item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', fontSize: '15px', fontWeight: 800, color: '#234B3C', borderTop: '1px solid #E2E8F0' }}>
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
          <span style={{ fontSize: '17px' }}>₹{currentOrder?.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}

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
  const { store } = useStore();

  const fallbackOrder = {
    id: orderId || 'FZ-2026-8815',
    userId: 'user-1',
    userName: 'Kavitha R',
    userPhone: '9845012345',
    societyId: 'soc-1',
    societyName: 'Greenfield Heights Apartments',
    flatNo: 'Tower B - Flat 402',
    orderType: 'RETAIL',
    items: [
      { id: 'prod-7', name: 'Royal Shimla Red Delicious Apples', unit: '4 pcs (Approx 600g)', qty: 2, price: 125 },
      { id: 'prod-8', name: 'Juicy Nagpur Sweet Oranges (Mosambi)', unit: '1 kg', qty: 1, price: 78 },
      { id: 'prod-12', name: 'Tender Coconut (Sweet Water)', unit: '1 pc', qty: 2, price: 52 }
    ],
    subtotal: 432,
    deliveryFee: 0,
    gstAmount: 0,
    totalAmount: 432,
    deliveryDate: 'Tomorrow Morning',
    deliverySlot: 'Morning Fresh Slot (06:30 AM - 08:30 AM)',
    orderPlacedAt: new Date().toISOString(),
    status: 'OUT_FOR_DELIVERY',
    paymentMethod: 'UPI',
    societyCommissionEarned: 15.12
  };

  const currentOrder = store?.orders?.find(o => o.id === orderId) || store?.orders?.[0] || fallbackOrder;

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

  // Allow simulator toggle for demonstration purposes
  const advanceOrderStatus = (nextStatus) => {
    saveFreshiozStore(prev => {
      const isNewlyDelivered = nextStatus === 'DELIVERED' && currentOrder?.status !== 'DELIVERED';
      const commEarned = (isNewlyDelivered && currentOrder?.societyCommissionEarned) ? currentOrder.societyCommissionEarned : 0;

      const updatedSocieties = isNewlyDelivered ? prev.societies.map(s => {
        if (s.id === currentOrder?.societyId || s.name === currentOrder?.societyName) {
          return {
            ...s,
            balanceEarned: Number(((s.balanceEarned || 0) + commEarned).toFixed(2)),
            totalOrdersDelivered: (s.totalOrdersDelivered || 0) + 1
          };
        }
        return s;
      }) : prev.societies;

      return {
        ...prev,
        societies: updatedSocieties,
        orders: prev.orders.map(o => o.id === currentOrder.id ? {
          ...o,
          status: nextStatus,
          deliveredAt: nextStatus === 'DELIVERED' ? new Date().toISOString() : o.deliveredAt
        } : o)
      };
    });
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

        {/* Demo Simulation Stepper */}
        <div style={{ borderTop: '1px solid #E5ECE7', marginTop: '24px', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#83968D', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ Demo Pipeline Simulator (Advance order status):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['CONFIRMED', 'PROCURING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => advanceOrderStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: currentOrder?.status === st ? '#234B3C' : '#F0F4F2',
                  color: currentOrder?.status === st ? '#FFF' : '#52635A',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
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
                <div style={{ fontSize: '12px', color: '#52635A' }}>{item.unit} × {item.qty}</div>
              </div>
              <div style={{ fontWeight: 800, color: '#234B3C', fontSize: '14px' }}>
                ₹{item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', fontSize: '16px', fontWeight: 800, color: '#234B3C' }}>
          <span>Total Paid ({currentOrder?.paymentMethod})</span>
          <span>₹{currentOrder?.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}

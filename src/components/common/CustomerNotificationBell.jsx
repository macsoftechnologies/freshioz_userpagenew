import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CustomerNotificationBell() {
  const navigate = useNavigate();
  const { store, activeUser, partnerAuth, setIsAuthModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userKey = activeUser?.phone || partnerAuth?.id || 'guest';
  const storageKey = `freshioz_customer_read_notifs_${userKey}`;
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setReadIds(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setReadIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const list = [];
    const orders = Array.isArray(store?.orders) ? store.orders : [];

    // Helper to normalize phone numbers for robust matching
    const normalize = (p) => String(p || '').replace(/\D/g, '').slice(-10);
    const userPhoneNorm = normalize(activeUser?.phone);

    // 1. Resident Customer Notifications
    if (activeUser) {
      const myOrders = orders.filter(o => {
        if (!o) return false;
        if (userPhoneNorm && normalize(o.userPhone) === userPhoneNorm) return true;
        if (userPhoneNorm && normalize(o.userId) === userPhoneNorm) return true;
        if (activeUser.id && (o.userId === activeUser.id || o.userPhone === activeUser.id)) return true;
        return false;
      });

      myOrders.slice(0, 10).forEach(o => {
        const orderDateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';
        const orderTimeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

        // Status milestone notifications
        if (o.status === 'DELIVERED') {
          list.push({
            id: `cust-deliv-${o.id}`,
            icon: '✅',
            title: `Order #${o.id} Delivered`,
            desc: `Delivered to Flat ${o.flatNo || 'your door'}${o.freshCoinsEarned ? ` · +${o.freshCoinsEarned} FreshCoins earned!` : ''}`,
            route: `/tracking/${o.id}`,
            badge: 'DELIVERED',
            badgeBg: '#ECFDF5',
            badgeColor: '#059669',
            time: o.deliveredAt ? new Date(o.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : orderTimeStr
          });
        }

        if (o.status === 'OUT_FOR_DELIVERY' || o.status === 'DELIVERED') {
          list.push({
            id: `cust-ofd-${o.id}`,
            icon: '🛵',
            title: `Order #${o.id} Dispatched & Out for Delivery`,
            desc: `${o.deliveryPartnerName ? `${o.deliveryPartnerName} is on the way` : 'Driver dispatched'} · ${o.deliverySlot || 'Scheduled drop'}`,
            route: `/tracking/${o.id}`,
            badge: 'ON THE WAY',
            badgeBg: '#EFF6FF',
            badgeColor: '#1D4ED8',
            time: o.dispatchedAt ? new Date(o.dispatchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : orderTimeStr
          });
        }

        if (['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)) {
          list.push({
            id: `cust-pack-${o.id}`,
            icon: '📦',
            title: `Order #${o.id} Packed at Hub`,
            desc: `Fresh produce crate inspected & sealed for ${o.societyName || 'your society'}`,
            route: `/tracking/${o.id}`,
            badge: 'PACKED',
            badgeBg: '#FEF3C7',
            badgeColor: '#B45309',
            time: orderTimeStr
          });
        }

        if (o.status === 'CANCELLED') {
          list.push({
            id: `cust-canc-${o.id}`,
            icon: '❌',
            title: `Order #${o.id} Cancelled`,
            desc: o.paymentMethod !== 'PAY_ON_DELIVERY' ? 'Prepaid refund initiated to original payment source' : 'Order was cancelled / returned',
            route: `/tracking/${o.id}`,
            badge: 'CANCELLED',
            badgeBg: '#FEF2F2',
            badgeColor: '#DC2626',
            time: o.cancelledAt ? new Date(o.cancelledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : orderTimeStr
          });
        }

        // Always show the initial confirmation milestone
        list.push({
          id: `cust-conf-${o.id}`,
          icon: '🌱',
          title: `Order #${o.id} Confirmed`,
          desc: `Farm produce reserved for ${o.deliveryDate || 'scheduled delivery'} (${o.deliverySlot || ''})`,
          route: `/tracking/${o.id}`,
          badge: 'CONFIRMED',
          badgeBg: '#ECFDF5',
          badgeColor: '#059669',
          time: orderDateStr || orderTimeStr
        });
      });
    }

    // 2. Society Partner Desk Notifications
    if (partnerAuth && !activeUser) {
      const socOrders = orders.filter(o => o.societyId === partnerAuth.id || o.societyName === partnerAuth.name);
      const deliveredSoc = socOrders.filter(o => o.status === 'DELIVERED');
      if (deliveredSoc.length > 0) {
        list.push({
          id: `partner-deliv-${deliveredSoc.length}`,
          icon: '🎁',
          title: `${deliveredSoc.length} Community Orders Delivered`,
          desc: `Welfare reward points updated for ${partnerAuth.name}`,
          route: '/society-portal',
          badge: 'REWARDS',
          badgeBg: '#ECFDF5',
          badgeColor: '#059669'
        });
      }
    }

    return list;
  }, [store?.orders, activeUser, partnerAuth]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(allIds));
    } catch (e) {}
  };

  const handleSelect = (n) => {
    markRead(n.id);
    setIsOpen(false);
    if (n.route) navigate(n.route);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Order & Delivery Updates"
        style={{
          position: 'relative',
          height: '36px',
          padding: '0 10px',
          borderRadius: '10px',
          background: unreadCount > 0 ? '#FEF3C7' : (isOpen ? '#EBF2EE' : '#F8FAFC'),
          border: unreadCount > 0 ? '1.5px solid #F59E0B' : '1px solid #CBD5E1',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          color: unreadCount > 0 ? '#B45309' : '#234B3C',
          fontWeight: 800,
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        <Bell size={16} />
        <span style={{
          background: unreadCount > 0 ? '#DC2626' : '#E2E8F0',
          color: unreadCount > 0 ? '#FFFFFF' : '#475569',
          fontSize: '10px',
          fontWeight: 800,
          minWidth: '17px',
          height: '17px',
          padding: '0 5px',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {unreadCount}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: 'min(320px, 88vw)',
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)',
          zIndex: 99999,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 12px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>
              🔔 Order Updates ({unreadCount})
            </strong>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <CheckCheck size={12} /> Mark read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {!activeUser && !partnerAuth ? (
              <div style={{ padding: '18px 14px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                <div style={{ marginBottom: '10px', fontWeight: 600 }}>
                  Log in to receive real-time order, delivery & FreshCoins notifications.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (setIsAuthModalOpen) setIsAuthModalOpen(true);
                  }}
                  style={{
                    background: '#234B3C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Login to View Alerts
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '22px 14px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                No order notifications yet.
              </div>
            ) : (
              notifications.map(n => {
                const isUnread = !readIds.includes(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #F1F5F9',
                      background: isUnread ? '#F0FDF4' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '16px', lineHeight: 1.2 }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <strong style={{ fontSize: '12px', color: '#0F172A' }}>{n.title}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {n.time && <span style={{ fontSize: '10px', color: '#94A3B8' }}>{n.time}</span>}
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: n.badgeBg,
                            color: n.badgeColor,
                          }}>
                            {n.badge}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.3 }}>
                        {n.desc}
                      </div>
                    </div>
                    <ChevronRight size={13} color="#94A3B8" style={{ marginTop: '3px', flexShrink: 0 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


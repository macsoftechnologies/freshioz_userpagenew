import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CustomerNotificationBell() {
  const navigate = useNavigate();
  const { store, activeUser, partnerAuth } = useStore();
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

    // 1. Resident Customer Notifications
    if (activeUser) {
      const myOrders = orders.filter(
        o => o.userPhone === activeUser.phone || o.userId === activeUser.phone || o.userId === activeUser.id
      );

      myOrders.slice(0, 8).forEach(o => {
        if (o.status === 'DELIVERED') {
          list.push({
            id: `cust-deliv-${o.id}`,
            icon: '✅',
            title: `Order #${o.id} Delivered`,
            desc: `Delivered to ${o.flatNo || 'your flat'}${o.freshCoinsEarned ? ` · +${o.freshCoinsEarned} FreshCoins earned!` : ''}`,
            route: `/track/${o.id}`,
            badge: 'DELIVERED',
            badgeBg: '#ECFDF5',
            badgeColor: '#059669'
          });
        } else if (o.status === 'OUT_FOR_DELIVERY') {
          list.push({
            id: `cust-ofd-${o.id}`,
            icon: '🛵',
            title: `Order #${o.id} is Out for Delivery`,
            desc: `${o.deliveryPartnerName ? `${o.deliveryPartnerName} is on the way` : 'Driver dispatched'} · ${o.deliverySlot || ''}`,
            route: `/track/${o.id}`,
            badge: 'ON THE WAY',
            badgeBg: '#EFF6FF',
            badgeColor: '#1D4ED8'
          });
        } else if (o.status === 'PACKED') {
          list.push({
            id: `cust-pack-${o.id}`,
            icon: '📦',
            title: `Order #${o.id} Packed at Hub`,
            desc: `Freshly packed & ready for your ${o.deliverySlot || 'scheduled'} drop`,
            route: `/track/${o.id}`,
            badge: 'PACKED',
            badgeBg: '#FEF3C7',
            badgeColor: '#B45309'
          });
        } else if (o.status === 'CANCELLED') {
          list.push({
            id: `cust-canc-${o.id}`,
            icon: '❌',
            title: `Order #${o.id} Cancelled`,
            desc: o.paymentMethod !== 'PAY_ON_DELIVERY' ? 'Prepaid refund initiated to original source' : 'Order was cancelled',
            route: `/track/${o.id}`,
            badge: 'CANCELLED',
            badgeBg: '#FEF2F2',
            badgeColor: '#DC2626'
          });
        } else {
          list.push({
            id: `cust-conf-${o.id}`,
            icon: '🌱',
            title: `Order #${o.id} Confirmed`,
            desc: `Scheduled for ${o.deliveryDate || ''} (${o.deliverySlot || ''})`,
            route: `/track/${o.id}`,
            badge: 'CONFIRMED',
            badgeBg: '#ECFDF5',
            badgeColor: '#059669'
          });
        }
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

  if (!activeUser && !partnerAuth) return null;

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
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: isOpen ? '#EBF2EE' : '#F8FAFC',
          border: '1px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#234B3C',
          cursor: 'pointer'
        }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#DC2626',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 800,
            minWidth: '17px',
            height: '17px',
            padding: '0 4px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #FFFFFF'
          }}>
            {unreadCount}
          </span>
        )}
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
            {notifications.length === 0 ? (
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
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: n.badgeBg,
                          color: n.badgeColor,
                          flexShrink: 0
                        }}>
                          {n.badge}
                        </span>
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

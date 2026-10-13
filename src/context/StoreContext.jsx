import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFreshiozStore, saveFreshiozStore, syncFreshiozStoreFromServer } from '../shared/freshiozStore';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [store, setStore] = useState(() => getFreshiozStore());

  // Listen for storage changes across tabs, different browsers, and server sync
  useEffect(() => {
    const handleSync = (e) => {
      setStore(e.detail || getFreshiozStore());
    };
    window.addEventListener('freshioz_store_updated', handleSync);
    window.addEventListener('storage', () => setStore(getFreshiozStore()));

    // Initial sync from shared server file
    syncFreshiozStoreFromServer();

    // Sync immediately when user switches focus to this browser window
    const handleFocus = () => {
      syncFreshiozStoreFromServer();
    };
    window.addEventListener('focus', handleFocus);

    // Fast light poll (1.5s) for instant real-time mirroring between two open browsers
    const interval = setInterval(() => {
      syncFreshiozStoreFromServer();
    }, 1500);

    return () => {
      window.removeEventListener('freshioz_store_updated', handleSync);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Current logged in user (stored locally)
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = localStorage.getItem('freshioz_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Society / Community Partner authentication state
  const [partnerAuth, setPartnerAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('freshioz_partner_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for user and partner auth updates across tabs and events
  useEffect(() => {
    const handleUserUpdate = (e) => {
      setActiveUser(e.detail || null);
    };
    const handlePartnerUpdate = (e) => {
      setPartnerAuth(e.detail || null);
    };
    window.addEventListener('freshioz_active_user_updated', handleUserUpdate);
    window.addEventListener('freshioz_partner_auth_updated', handlePartnerUpdate);
    return () => {
      window.removeEventListener('freshioz_active_user_updated', handleUserUpdate);
      window.removeEventListener('freshioz_partner_auth_updated', handlePartnerUpdate);
    };
  }, []);

  // Selected society: defaults to user's society or first approved society
  const approvedSocieties = store.societies.filter(s => s.status === 'APPROVED');
  const [selectedSocietyId, setSelectedSocietyId] = useState(() => {
    if (activeUser?.societyId) return activeUser.societyId;
    if (partnerAuth?.societyId) return partnerAuth.societyId;
    return approvedSocieties[0]?.id || 'soc-1';
  });

  const selectedSociety = store.societies.find(s => s.id === selectedSocietyId) || approvedSocieties[0];

  // Wholesale Mode Switcher
  const [isWholesale, setIsWholesale] = useState(false);

  // Cart Management
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('freshioz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('freshioz_cart', JSON.stringify(cart));
  }, [cart]);

  // Modal visibility states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSocietyRequestModalOpen, setIsSocietyRequestModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Calculate Warehouse Cut-Off Logistics based on Resident's Society Serving Hub
  const servingShop = (store.shops || []).find(s => s.id === selectedSociety?.nearestShopId);
  const servingWarehouse = (store.warehouses || []).find(w => w.id === servingShop?.warehouseId) || store.warehouses[0] || { cutoffTime: '21:00', openTime: '05:00', slots: [] };
  const defaultWarehouse = servingWarehouse;
  
  const getCutoffCalculations = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Parse serving warehouse cutoff time e.g. "21:00"
    const [cutoffH, cutoffM] = (servingWarehouse.cutoffTime || '21:00').split(':').map(Number);
    
    const isPastCutoff = (currentHours > cutoffH) || (currentHours === cutoffH && currentMinutes >= cutoffM);

    // Calculate dates
    const deliveryDateObj = new Date();
    if (isPastCutoff) {
      deliveryDateObj.setDate(deliveryDateObj.getDate() + 2); // Day after tomorrow
    } else {
      deliveryDateObj.setDate(deliveryDateObj.getDate() + 1); // Tomorrow
    }

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDeliveryDate = deliveryDateObj.toLocaleDateString('en-IN', options);

    // Remaining time until cutoff today
    let hoursRemaining = cutoffH - currentHours;
    let minutesRemaining = cutoffM - currentMinutes;
    if (minutesRemaining < 0) {
      hoursRemaining -= 1;
      minutesRemaining += 60;
    }
    if (hoursRemaining < 0) {
      hoursRemaining = 0;
      minutesRemaining = 0;
    }

    return {
      isPastCutoff,
      cutoffTimeStr: `${cutoffH > 12 ? cutoffH - 12 : cutoffH}:${cutoffM.toString().padStart(2, '0')} ${cutoffH >= 12 ? 'PM' : 'AM'}`,
      formattedDeliveryDate,
      deliveryDayLabel: isPastCutoff ? 'Day After Tomorrow' : 'Tomorrow Morning',
      hoursRemaining,
      minutesRemaining,
      servingWarehouseName: servingWarehouse.name,
      servingWarehouseCode: servingWarehouse.code,
      servingWarehouseId: servingWarehouse.id
    };
  };

  const cutoffInfo = getCutoffCalculations();

  // Cart operations
  const addToCart = (product, wholesaleMode = isWholesale) => {
    // If not logged in, prompt user to log in
    if (!activeUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setCart(prev => {
      const key = `${product.id}_${wholesaleMode ? 'ws' : 'rt'}`;
      const existing = prev.find(item => item.key === key);
      const unit = wholesaleMode ? product.wholesaleUnit : product.retailUnit;
      const price = wholesaleMode ? product.wholesalePrice : product.retailPrice;

      if (existing) {
        return prev.map(item => item.key === key ? { ...item, qty: item.qty + 1 } : item);
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          unit,
          price,
          qty: 1,
          isWholesale: wholesaleMode,
          gstPercent: product.gstPercent || 0
        }
      ];
    });
  };

  const updateCartQty = (key, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.key === key) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Auth Operations
  const loginUser = (userData) => {
    setActiveUser(userData);
    localStorage.setItem('freshioz_active_user', JSON.stringify(userData));
    // Clear partner session to ensure strict mutual persona exclusivity
    setPartnerAuth(null);
    localStorage.removeItem('freshioz_partner_auth');
    window.dispatchEvent(new CustomEvent('freshioz_partner_auth_updated', { detail: null }));

    if (userData.societyId) {
      setSelectedSocietyId(userData.societyId);
    }
    setIsAuthModalOpen(false);
    window.dispatchEvent(new CustomEvent('freshioz_active_user_updated', { detail: userData }));
  };

  const logoutUser = () => {
    setActiveUser(null);
    localStorage.removeItem('freshioz_active_user');
    window.dispatchEvent(new CustomEvent('freshioz_active_user_updated', { detail: null }));
  };

  const loginPartner = (partnerData) => {
    setPartnerAuth(partnerData);
    localStorage.setItem('freshioz_partner_auth', JSON.stringify(partnerData));
    // Clear user session to ensure strict mutual persona exclusivity
    setActiveUser(null);
    localStorage.removeItem('freshioz_active_user');
    window.dispatchEvent(new CustomEvent('freshioz_active_user_updated', { detail: null }));

    if (partnerData.societyId) {
      setSelectedSocietyId(partnerData.societyId);
    }
    window.dispatchEvent(new CustomEvent('freshioz_partner_auth_updated', { detail: partnerData }));
  };

  const logoutPartner = () => {
    setPartnerAuth(null);
    localStorage.removeItem('freshioz_partner_auth');
    window.dispatchEvent(new CustomEvent('freshioz_partner_auth_updated', { detail: null }));
  };

  // Place Order Flow
  const placeOrder = ({ deliverySlot, paymentMethod }) => {
    if (!activeUser || cart.length === 0) return null;

    const society = selectedSociety;
    const newOrderId = `FZ-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    // Calculate Society Cashback/Commission
    let commissionEarned = 0;
    if (society) {
      if (society.commissionType === 'PERCENTAGE') {
        commissionEarned = Number(((cartSubtotal * (society.commissionValue || 3.5)) / 100).toFixed(2));
      } else {
        commissionEarned = Number((society.commissionValue || 5.0).toFixed(2));
      }
    }

    // Calculate Line-Item GST dynamically (Exempt raw produce is 0%, taxable items calculate per product gstPercent)
    let totalLineItemGst = 0;
    cart.forEach(i => {
      const prod = (store.products || []).find(p => p.id === i.productId);
      const gstRate = prod?.gstPercent || 0;
      if (gstRate > 0) {
        totalLineItemGst += ((i.price * i.qty) * gstRate) / 100;
      }
    });
    const calculatedGst = Math.round(totalLineItemGst);
    const calculatedDeliveryFee = cartSubtotal >= 199 ? 0 : 25;
    const finalTotal = cartSubtotal + calculatedDeliveryFee + calculatedGst;

    const defaultSlotLabel = servingWarehouse?.slots?.[0]?.label || 'Morning Fresh Slot (06:30 AM - 08:30 AM)';

    const orderRecord = {
      id: newOrderId,
      userId: activeUser.phone,
      userName: activeUser.name,
      userPhone: activeUser.phone,
      societyId: society?.id,
      societyName: society?.name,
      flatNo: activeUser.flatNo,
      orderType: isWholesale ? 'WHOLESALE' : 'RETAIL',
      items: cart.map(i => ({
        id: i.productId,
        name: i.name,
        unit: i.unit,
        qty: i.qty,
        price: i.price,
        isWholesale: i.isWholesale
      })),
      subtotal: cartSubtotal,
      deliveryFee: calculatedDeliveryFee,
      gstAmount: calculatedGst,
      totalAmount: finalTotal,
      deliveryDate: cutoffInfo.formattedDeliveryDate,
      deliverySlot: deliverySlot || defaultSlotLabel,
      orderPlacedAt: new Date().toISOString(),
      status: 'CONFIRMED',
      paymentMethod,
      warehouseId: servingWarehouse.id || 'wh-1',
      warehouseCode: servingWarehouse.code || 'WH-BLR-NORTH',
      // Society commission is recorded for accrual, but NOT credited to society wallet until order is DELIVERED!
      societyCommissionEarned: commissionEarned
    };

    saveFreshiozStore(prev => ({
      ...prev,
      orders: [orderRecord, ...prev.orders]
    }));

    clearCart();
    return orderRecord;
  };

  // Submit New Society Request
  const requestNewSociety = (leadData) => {
    const newLead = {
      id: `req-${Date.now()}`,
      ...leadData,
      createdAt: new Date().toISOString(),
      status: 'NEW_LEAD'
    };

    saveFreshiozStore(prev => ({
      ...prev,
      societyRequests: [newLead, ...(prev.societyRequests || [])]
    }));

    setIsSocietyRequestModalOpen(false);
    return newLead;
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        products: store.products,
        approvedSocieties,
        selectedSociety,
        setSelectedSocietyId,
        activeUser,
        loginUser,
        logoutUser,
        partnerAuth,
        loginPartner,
        logoutPartner,
        isWholesale,
        setIsWholesale,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        cutoffInfo,
        servingWarehouse,
        defaultWarehouse,
        placeOrder,
        requestNewSociety,
        // Modals
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSocietyRequestModalOpen,
        setIsSocietyRequestModalOpen,
        isCartOpen,
        setIsCartOpen,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

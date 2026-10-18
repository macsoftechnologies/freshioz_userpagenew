import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../hooks/useCatalog';
import { API_BASE_URL } from '../api/client';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const queryClient = useQueryClient();
  const catalog = useCatalog();

  const store = useMemo(() => ({
    products: catalog.products || [],
    categories: catalog.categories || [],
    units: catalog.units || [],
    societies: catalog.societies || [],
    warehouses: catalog.warehouses || [],
    deliveryConfig: catalog.deliveryConfig,
    orders: [],
  }), [catalog.products, catalog.categories, catalog.units, catalog.societies, catalog.warehouses, catalog.deliveryConfig]);

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
  const approvedSocieties = useMemo(
    () => (store.societies || []).filter(s => s.status === 'APPROVED'),
    [store.societies]
  );
  const [selectedSocietyId, setSelectedSocietyId] = useState(() => {
    if (activeUser?.societyId) return activeUser.societyId;
    if (partnerAuth?.societyId) return partnerAuth.societyId;
    return null;
  });

  useEffect(() => {
    if (!selectedSocietyId && approvedSocieties.length > 0) {
      setSelectedSocietyId(approvedSocieties[0].id);
    }
  }, [selectedSocietyId, approvedSocieties]);

  const selectedSociety = useMemo(() => {
    return (store.societies || []).find(s => s.id === selectedSocietyId) || approvedSocieties[0] || null;
  }, [store.societies, selectedSocietyId, approvedSocieties]);

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

  // Calculate Warehouse Cut-Off Logistics directly based on Resident's Society Serving Regional Warehouse Hub
  const servingWarehouse = (store.warehouses || []).find(w => w.id === selectedSociety?.warehouseId) 
    || (store.warehouses || [])[0] 
    || { cutoffTime: '21:00', openTime: '05:00', slots: [] };
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

  // Quantity-based bulk volume tier calculation (e.g. above 5kg or 10kg gets discount %)
  const getProductBulkPricing = (productOrItem, qty) => {
    const prod = (store.products || []).find(p => p.id === (productOrItem?.productId || productOrItem?.id)) || productOrItem || {};
    const retailPrice = Number(prod.retailPrice ?? productOrItem?.price) || 0;
    const minQty = Number(prod.bulkMinQty) || 0;
    const discountPercent = Number(prod.bulkDiscountPercent) || 0;
    const unit = prod.retailUnit || prod.defaultUnit || 'kg';

    const isBulkEligible = minQty > 0 && discountPercent > 0 && qty >= minQty;
    const effectiveUnitPrice = isBulkEligible
      ? Math.round(retailPrice * (1 - discountPercent / 100))
      : retailPrice;
    const totalWithoutDiscount = Math.round(retailPrice * qty);
    const totalWithDiscount = Math.round(effectiveUnitPrice * qty);
    const savings = Math.max(0, totalWithoutDiscount - totalWithDiscount);
    const remainingForDiscount = (!isBulkEligible && minQty > 0) ? Math.max(0, minQty - qty) : 0;

    return {
      retailPrice,
      minQty,
      discountPercent,
      isBulkEligible,
      effectiveUnitPrice,
      totalWithoutDiscount,
      totalWithDiscount,
      savings,
      remainingForDiscount,
      unit
    };
  };

  const cartSubtotal = Number(
    cart.reduce((acc, item) => {
      const pricing = getProductBulkPricing(item, item.qty);
      return acc + pricing.totalWithDiscount;
    }, 0).toFixed(2)
  );

  const totalBulkSavings = Number(
    cart.reduce((acc, item) => {
      const pricing = getProductBulkPricing(item, item.qty);
      return acc + pricing.savings;
    }, 0).toFixed(2)
  );

  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Calculate dynamic GST for current items in cart
  const cartGst = Math.round(
    cart.reduce((acc, item) => {
      const prod = (store.products || []).find(p => p.id === item.productId);
      const gstRate = prod?.gstPercent || 0;
      const pricing = getProductBulkPricing(item, item.qty);
      return acc + (gstRate > 0 ? (pricing.totalWithDiscount * gstRate) / 100 : 0);
    }, 0)
  );

  // Dynamic delivery fee calculation from store.deliveryConfig
  const deliveryConfig = store.deliveryConfig || { baseFee: 25, freeDeliveryThreshold: 199, enableFreeDelivery: true };
  const freeDeliveryThreshold = deliveryConfig.enableFreeDelivery ? (deliveryConfig.freeDeliveryThreshold ?? 199) : Infinity;
  const baseDeliveryFee = deliveryConfig.baseFee ?? 25;
  const deliveryFee = (cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0) ? 0 : baseDeliveryFee;

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

  const logoutUser = (redirectToHome = false) => {
    setActiveUser(null);
    setCart([]);
    localStorage.removeItem('freshioz_active_user');
    localStorage.removeItem('freshioz_user_token');
    localStorage.removeItem('freshioz_auth_token');
    localStorage.removeItem('freshioz_cart');

    queryClient.clear();

    window.dispatchEvent(new CustomEvent('freshioz_active_user_updated', { detail: null }));

    if (redirectToHome && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutTarget, setLogoutTarget] = useState('USER'); // 'USER' | 'PARTNER'

  const requestLogout = (target = 'USER') => {
    setLogoutTarget(target);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (logoutTarget === 'PARTNER') {
      logoutPartner(true);
    } else {
      logoutUser(true);
    }
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

  const logoutPartner = (redirectToHome = false) => {
    setPartnerAuth(null);
    localStorage.removeItem('freshioz_partner_auth');
    localStorage.removeItem('freshioz_partner_token');
    window.dispatchEvent(new CustomEvent('freshioz_partner_auth_updated', { detail: null }));

    if (redirectToHome && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Place Order Flow
  const placeOrder = async ({ deliverySlot, paymentMethod }) => {
    if (!activeUser || cart.length === 0) return null;

    const society = selectedSociety;
    const defaultSlotLabel = servingWarehouse?.slots?.[0]?.label || 'Morning Fresh Slot (06:30 AM - 08:30 AM)';

    const userToken = localStorage.getItem('freshioz_user_token');
    const headers = { 'Content-Type': 'application/json' };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const payload = {
      userPhone: activeUser.phone,
      userName: activeUser.name,
      societyId: society?.id || null,
      societyName: society?.name || 'Direct Resident Delivery',
      flatNo: activeUser.flatNo || 'Flat 101',
      warehouseId: servingWarehouse?.id || null,
      warehouseCode: servingWarehouse?.code || null,
      orderType: totalBulkSavings > 0 ? 'BULK' : 'RETAIL',
      subtotal: cartSubtotal,
      bulkSavings: totalBulkSavings,
      deliveryFee: deliveryFee,
      gstAmount: cartGst,
      totalAmount: cartSubtotal + deliveryFee + cartGst,
      deliveryDate: cutoffInfo?.formattedDeliveryDate || new Date().toLocaleDateString('en-GB'),
      deliverySlot: deliverySlot || defaultSlotLabel,
      // Phase 1: Only Cash on Delivery (PAY_ON_DELIVERY) is permitted.
      // Instant online UPI is commented out so nobody can submit or apply UPI orders from UI or console.
      // paymentMethod: paymentMethod || 'UPI',
      // paymentStatus: paymentMethod === 'UPI' ? 'PAID' : 'PENDING_COD',
      paymentMethod: 'PAY_ON_DELIVERY',
      paymentStatus: 'PENDING_COD',
      items: cart.map(i => {
        const pricing = getProductBulkPricing(i, i.qty);
        return {
          productId: i.productId || i.id,
          name: i.name,
          unit: i.unit || '1 kg',
          qty: i.qty,
          price: i.price,
          effectivePrice: pricing.effectiveUnitPrice,
          totalPrice: pricing.totalWithDiscount,
          isBulkApplied: !!pricing.isBulkEligible,
          bulkDiscountPercent: pricing.discountPercent || 0,
          bulkSavings: pricing.savings || 0
        };
      })
    };

    let serverOrder = null;
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Order creation failed (${res.status})`);
      }

      serverOrder = await res.json();
    } catch (e) {
      console.error('Order placement API error:', e);
      throw e;
    }

    const confirmedOrder = {
      ...serverOrder,
      id: serverOrder.id,
      uuid: serverOrder.uuid || serverOrder.id,
      userId: serverOrder.userPhone || activeUser.phone,
      userName: serverOrder.userName || activeUser.name,
      userPhone: serverOrder.userPhone || activeUser.phone,
      societyId: serverOrder.societyId || society?.id,
      societyName: serverOrder.societyName || society?.name,
      flatNo: serverOrder.flatNo || activeUser.flatNo,
      orderPlacedAt: serverOrder.orderPlacedAt || new Date().toISOString(),
      orderPlacedAtFormatted: serverOrder.orderPlacedAtFormatted,
      status: serverOrder.status || 'CONFIRMED',
      items: serverOrder.items || payload.items
    };

    queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    clearCart();
    return confirmedOrder;
  };

  // Submit New Society Request
  const requestNewSociety = async (leadData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inbound-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societyName: leadData.societyName,
          contactName: leadData.requesterName || leadData.contactName || 'Resident Lead',
          contactPhone: leadData.requesterPhone || leadData.contactPhone || '9876543210',
          contactRole: leadData.contactRole || 'Resident',
          flatCount: Number(leadData.estimatedFlats || leadData.flatCount) || undefined,
          clusterZone: leadData.clusterZone || leadData.city || undefined,
          address: leadData.address || undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Community onboarding request failed (${res.status})`);
      }

      const serverLead = await res.json();
      setIsSocietyRequestModalOpen(false);
      return serverLead;
    } catch (e) {
      console.error('Error submitting inbound request to API:', e);
      throw e;
    }
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
        totalBulkSavings,
        getProductBulkPricing,
        cartItemCount,
        cartGst,
        deliveryConfig,
        deliveryFee,
        freeDeliveryThreshold,
        baseDeliveryFee,
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
        setIsMobileDrawerOpen,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        logoutTarget,
        requestLogout,
        confirmLogout
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

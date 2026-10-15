// Freshioz Unified Shared Reactive Data Store for Admin Portal & User Web
// Synchronizes seamlessly with localStorage and dispatches window events for multi-tab sync

import {
  INITIAL_WAREHOUSES,
  INITIAL_EMPLOYEES,
  INITIAL_SOCIETIES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_WITHDRAWALS,
  INITIAL_PROCUREMENT_LOGS,
  INITIAL_SOCIETY_REQUESTS,
  INITIAL_VENDORS,
  INITIAL_WAREHOUSE_INVENTORY,
  DEFAULT_STORE
} from './data';

export {
  INITIAL_WAREHOUSES,
  INITIAL_EMPLOYEES,
  INITIAL_SOCIETIES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_WITHDRAWALS,
  INITIAL_PROCUREMENT_LOGS,
  INITIAL_SOCIETY_REQUESTS,
  INITIAL_VENDORS,
  INITIAL_WAREHOUSE_INVENTORY,
  DEFAULT_STORE
};

const STORAGE_KEY = 'freshioz_master_store_clean_v4';

export function getFreshiozStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = { ...DEFAULT_STORE };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    let hasUpdates = false;

    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = INITIAL_CATEGORIES;
      hasUpdates = true;
    }

    if (!parsed.units || parsed.units.length === 0) {
      parsed.units = INITIAL_UNITS;
      hasUpdates = true;
    }

    if (!parsed.employees || parsed.employees.length === 0) {
      parsed.employees = INITIAL_EMPLOYEES;
      hasUpdates = true;
    }

    if (!parsed.vendors || parsed.vendors.length === 0) {
      parsed.vendors = INITIAL_VENDORS;
      hasUpdates = true;
    }

    if (!parsed.warehouseInventory) {
      parsed.warehouseInventory = INITIAL_WAREHOUSE_INVENTORY;
      hasUpdates = true;
    }

    const collections = ['warehouses', 'societies', 'products', 'orders', 'withdrawals', 'procurementLogs', 'societyRequests', 'vendors'];
    collections.forEach(key => {
      if (!Array.isArray(parsed[key])) {
        parsed[key] = [];
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (e) {
    console.error('Error parsing store from localStorage', e);
    return { ...DEFAULT_STORE };
  }
}

import { API_BASE_URL } from '../api/client';

// In user-web (customer & resident portal), all database mutations occur strictly via dedicated REST APIs:
// - Orders -> POST /api/orders (via orderService)
// - Order Cancellations -> POST /api/orders/:id/cancel (via orderService)
// - Inbound Community Requests -> POST /api/inbound-requests
// - Society Payouts -> POST /api/societies/:id/payout-request
// Bulk store writes to /freshioz-store are strictly restricted to internal staff roles and never called by shopper web.
export async function pushStoreToServer(_storeData) {
  // No-op for customer storefront: database mutations use dedicated REST APIs above.
  return { success: true, clientOnly: true };
}

export function areEntityCollectionsEqual(localData, serverData) {
  if (!localData || !serverData) return false;
  const collections = [
    'categories', 'units', 'products', 'warehouses', 'societies',
    'orders', 'vendors', 'procurementLogs', 'warehouseInventory',
    'societyRequests', 'withdrawals'
  ];
  for (const key of collections) {
    if (JSON.stringify(localData[key] || []) !== JSON.stringify(serverData[key] || [])) {
      return false;
    }
  }
  return true;
}

export async function syncFreshiozStoreFromServer() {
  try {
    const token = localStorage.getItem('freshioz_user_token') || 
                  localStorage.getItem('freshioz_partner_token') || 
                  localStorage.getItem('freshioz_auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/freshioz-store`, { 
      headers,
      signal: AbortSignal.timeout(5000) 
    }).catch(() => null);

    if (res && res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object' && Array.isArray(serverData.categories)) {
        const currentLocal = getFreshiozStore();
        const mergedOrders = (Array.isArray(serverData.orders) && serverData.orders.length > 0)
          ? serverData.orders
          : (currentLocal.orders || []);

        const mergedData = {
          ...serverData,
          orders: mergedOrders,
        };

        if (!areEntityCollectionsEqual(currentLocal, mergedData)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
          window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: mergedData }));
          return mergedData;
        }
      }
    }
  } catch (err) {}
  return null;
}

export function saveFreshiozStore(updater, _options = {}) {
  const current = getFreshiozStore();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: next }));
  return next;
}

export async function saveFreshiozStoreAsync(updater) {
  const current = getFreshiozStore();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: next }));
  return { success: true, store: next };
}

export function resetFreshiozStoreToClean() {
  const clean = JSON.parse(JSON.stringify(DEFAULT_STORE));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: clean }));
  pushStoreToServer(clean);
  return clean;
}



import { generateUUID } from '../utils/idGenerator';

/**
 * Human-readable, client-demo friendly business reference codes
 * e.g., Orders: FRZ_ORD_TX211, FRZ_ORD_TX212...
 * Employees: FRZ_EMP_101, FRZ_EMP_102...
 * Users: FRZ_USR_201, FRZ_USR_202...
 * Warehouses: FRZ_WH_01, FRZ_WH_02...
 * Societies: FRZ_SOC_101, FRZ_SOC_102...
 * Products: FRZ_PRD_101, FRZ_PRD_102...
 * Vendors: FRZ_VEN_101, FRZ_VEN_102...
 * Lots: FRZ_LOT_101, FRZ_LOT_102...
 * Procurement: FRZ_PROC_101, FRZ_PROC_102...
 */
export function generateId(prefix = 'FRZ') {
  let store = {};
  try {
    store = getFreshiozStore() || {};
  } catch (e) {
    store = {};
  }

  if (prefix === 'FRZ_ORD') {
    const existing = store.orders || [];
    let num = 211 + existing.length;
    let code = `FRZ_ORD_TX${num}`;
    while (existing.some(o => o.id === code)) {
      num++;
      code = `FRZ_ORD_TX${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_EMP') {
    const existing = store.employees || [];
    let num = 101 + existing.length;
    let code = `FRZ_EMP_${num}`;
    while (existing.some(e => e.id === code)) {
      num++;
      code = `FRZ_EMP_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_USR') {
    const existing = store.users || [];
    let num = 201 + existing.length;
    let code = `FRZ_USR_${num}`;
    while (existing.some(u => u.id === code)) {
      num++;
      code = `FRZ_USR_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_WH') {
    const existing = store.warehouses || [];
    let num = 1 + existing.length;
    let code = `FRZ_WH_${String(num).padStart(2, '0')}`;
    while (existing.some(w => w.id === code)) {
      num++;
      code = `FRZ_WH_${String(num).padStart(2, '0')}`;
    }
    return code;
  }

  if (prefix === 'FRZ_SOC') {
    const existing = store.societies || [];
    let num = 101 + existing.length;
    let code = `FRZ_SOC_${num}`;
    while (existing.some(s => s.id === code)) {
      num++;
      code = `FRZ_SOC_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_VEN') {
    const existing = store.vendors || [];
    let num = 101 + existing.length;
    let code = `FRZ_VEN_${num}`;
    while (existing.some(v => v.id === code)) {
      num++;
      code = `FRZ_VEN_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_PRD') {
    const existing = store.products || [];
    let num = 101 + existing.length;
    let code = `FRZ_PRD_${num}`;
    while (existing.some(p => p.id === code)) {
      num++;
      code = `FRZ_PRD_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_LOT') {
    const orders = store.orders || [];
    const existingLots = new Set(orders.map(o => o.deliveryLotId).filter(Boolean));
    let num = 101 + existingLots.size;
    let code = `FRZ_LOT_${num}`;
    while (existingLots.has(code)) {
      num++;
      code = `FRZ_LOT_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_PROC') {
    const existing = store.procurementLogs || [];
    let num = 101 + existing.length;
    let code = `FRZ_PROC_${num}`;
    while (existing.some(l => l.id === code)) {
      num++;
      code = `FRZ_PROC_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_WDR') {
    const existing = store.withdrawals || [];
    let num = 101 + existing.length;
    let code = `FRZ_WDR_${num}`;
    while (existing.some(w => w.id === code)) {
      num++;
      code = `FRZ_WDR_${num}`;
    }
    return code;
  }

  if (prefix === 'FRZ_REQ') {
    const existing = store.societyRequests || [];
    let num = 101 + existing.length;
    let code = `FRZ_REQ_${num}`;
    while (existing.some(r => r.id === code)) {
      num++;
      code = `FRZ_REQ_${num}`;
    }
    return code;
  }

  const randNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}_TX${randNum}`;
}

export { API_BASE_URL, apiClient } from '../api/client';
export { generateUUID, generateId as standardGenerateId } from '../utils/idGenerator';
export { uploadService, uploadFile } from '../services/uploadService';
export { productService } from '../services/productService';
export { orderService } from '../services/orderService';
export { societyService } from '../services/societyService';
export { inboundService } from '../services/inboundService';

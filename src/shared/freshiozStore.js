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

// Isolated Customer / Shopper Storage Key (isolated from Admin Ops Desk)
const STORAGE_KEY = 'freshioz_shopper_store_v1';
const LEGACY_STORAGE_KEYS = [
  'freshioz_master_store_clean_v6',
  'freshioz_master_store_clean_v5',
  'freshioz_master_store_clean_v4',
  'freshioz_master_store_clean_v3',
  'freshioz_master_store_clean_v2',
  'freshioz_master_store_clean_v1',
  'freshioz_master_store'
];

export function getFreshiozStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      LEGACY_STORAGE_KEYS.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
    }

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

function areInventoriesEqual(invA = {}, invB = {}) {
  if (invA === invB) return true;
  if (!invA || !invB || typeof invA !== 'object' || typeof invB !== 'object') return false;
  const whIdsA = Object.keys(invA);
  const whIdsB = Object.keys(invB);
  const allWhIds = new Set([...whIdsA, ...whIdsB]);
  for (const whId of allWhIds) {
    const mapA = invA[whId] || {};
    const mapB = invB[whId] || {};
    const allKeys = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
    for (const k of allKeys) {
      if (Number(mapA[k] || 0) !== Number(mapB[k] || 0)) return false;
    }
  }
  return true;
}

export function areEntityCollectionsEqual(localData, serverData) {
  if (!localData || !serverData) return false;
  const collections = [
    'categories', 'units', 'products', 'warehouses', 'societies',
    'orders', 'vendors', 'procurementLogs', 'warehouseInventory',
    'societyRequests', 'withdrawals'
  ];
  for (const key of collections) {
    const localVal = localData[key];
    const serverVal = serverData[key];

    if (key === 'warehouseInventory') {
      if (!areInventoriesEqual(localVal, serverVal)) return false;
      continue;
    }

    const localArr = localVal || [];
    const serverArr = serverVal || [];
    if (!Array.isArray(localArr) || !Array.isArray(serverArr)) {
      if (JSON.stringify(localArr) !== JSON.stringify(serverArr)) return false;
      continue;
    }

    if (localArr.length !== serverArr.length) return false;

    const localMap = new Map();
    for (const item of localArr) {
      if (item && item.id) localMap.set(String(item.id), item);
    }

    for (const s of serverArr) {
      if (!s || !s.id) continue;
      const l = localMap.get(String(s.id));
      if (!l) return false;
      if (l.status !== s.status || l.name !== s.name) return false;
      if (key === 'products') {
        if (
          Number(l.retailPrice) !== Number(s.retailPrice) ||
          Number(l.retailMarketPrice) !== Number(s.retailMarketPrice) ||
          Number(l.bulkMinQty) !== Number(s.bulkMinQty) ||
          Number(l.bulkDiscountPercent) !== Number(s.bulkDiscountPercent) ||
          Boolean(l.inStock) !== Boolean(s.inStock) ||
          Number(l.gstPercent) !== Number(s.gstPercent) ||
          l.badge !== s.badge ||
          l.image !== s.image
        ) return false;
      }
    }
  }
  return true;
}

export async function syncFreshiozStoreFromServer() {
  try {
    // If the user is currently typing in an input, textarea, or contentEditable element,
    // skip dispatching store re-renders to prevent cursor jumps or flickering forms.
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return null;
      }
    }

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
        const mergedOrders = Array.isArray(serverData.orders) ? serverData.orders : [];

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

export function matchesProductCategory(product, selectedCatId, categories = []) {
  if (!selectedCatId || selectedCatId === 'ALL') return true;
  if (!product) return false;

  const target = String(selectedCatId).trim().toLowerCase();

  // 1. Direct match on product.categoryId
  if (product.categoryId && String(product.categoryId).trim().toLowerCase() === target) {
    return true;
  }

  // 2. Direct match on product.category (string or object)
  const prodCatStr = typeof product.category === 'object'
    ? (product.category?.name || product.category?.id || product.category?.slug || '')
    : String(product.category || '');

  if (prodCatStr && prodCatStr.trim().toLowerCase() === target) {
    return true;
  }

  if (typeof product.category === 'object' && product.category?.id) {
    if (String(product.category.id).trim().toLowerCase() === target) return true;
  }

  // 3. Match via categories list taxonomy (slug, id, name)
  const catObj = (categories || []).find(c => 
    String(c.id || '').trim().toLowerCase() === target ||
    String(c.name || c.label || '').trim().toLowerCase() === target ||
    String(c.slug || '').trim().toLowerCase() === target
  );

  if (catObj) {
    const catId = String(catObj.id || '').trim().toLowerCase();
    const catName = String(catObj.name || catObj.label || '').trim().toLowerCase();
    const catSlug = String(catObj.slug || '').trim().toLowerCase();

    const pCatId = String(product.categoryId || '').trim().toLowerCase();
    const pCatName = prodCatStr.trim().toLowerCase();

    if (catId && (pCatId === catId || pCatName === catId)) return true;
    if (catName && (pCatId === catName || pCatName === catName)) return true;
    if (catSlug && (pCatId === catSlug || pCatName === catSlug)) return true;
  }

  return false;
}

export { API_BASE_URL, apiClient } from '../api/client';
export { generateUUID, generateId as standardGenerateId } from '../utils/idGenerator';
export { uploadService, uploadFile } from '../services/uploadService';
export { productService } from '../services/productService';
export { orderService } from '../services/orderService';
export { societyService } from '../services/societyService';
export { inboundService } from '../services/inboundService';

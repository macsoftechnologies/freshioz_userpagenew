// Freshioz Unified Shared Reactive Data Store for Admin Portal & User Web
// Synchronizes seamlessly with localStorage and dispatches window events for multi-tab sync

import {
  INITIAL_WAREHOUSES,
  INITIAL_SHOPS,
  INITIAL_EMPLOYEES,
  INITIAL_SOCIETIES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_WITHDRAWALS,
  INITIAL_PROCUREMENT_LOGS,
  INITIAL_SOCIETY_REQUESTS,
  DEFAULT_STORE
} from './data';

export {
  INITIAL_WAREHOUSES,
  INITIAL_SHOPS,
  INITIAL_EMPLOYEES,
  INITIAL_SOCIETIES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_WITHDRAWALS,
  INITIAL_PROCUREMENT_LOGS,
  INITIAL_SOCIETY_REQUESTS,
  DEFAULT_STORE
};

const STORAGE_KEY = 'freshioz_master_store_clean_v1';

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

    const collections = ['warehouses', 'shops', 'societies', 'products', 'orders', 'withdrawals', 'procurementLogs', 'societyRequests'];
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

// Cross-process server file persistence
function pushStoreToServer(storeData) {
  try {
    fetch('/api/freshioz-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData)
    }).catch(() => {});
  } catch (e) {}
}

export async function syncFreshiozStoreFromServer() {
  try {
    const res = await fetch('/api/freshioz-store');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object' && Array.isArray(serverData.categories)) {
        const localRaw = localStorage.getItem(STORAGE_KEY);
        const serverRaw = JSON.stringify(serverData);
        if (localRaw !== serverRaw) {
          localStorage.setItem(STORAGE_KEY, serverRaw);
          window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: serverData }));
          return serverData;
        }
      }
    } else if (res.status === 404) {
      pushStoreToServer(getFreshiozStore());
    }
  } catch (err) {}
  return null;
}

export function saveFreshiozStore(updater) {
  const current = getFreshiozStore();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: next }));
  pushStoreToServer(next);
  return next;
}

export function resetFreshiozStoreToClean() {
  const clean = JSON.parse(JSON.stringify(DEFAULT_STORE));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: clean }));
  pushStoreToServer(clean);
  return clean;
}

// Seed realistic sample data for quick end-to-end testing
export function seedFreshiozSampleData() {
  const sampleStore = {
    ...DEFAULT_STORE,
    warehouses: [
      {
        id: 'WH-BLR-01',
        name: 'Central Cold Atmosphere Hub - Hebbal',
        code: 'WH-BLR-01',
        type: 'COLD_STORAGE',
        address: 'Plot 42, Hebbal Industrial Agro Estate, Bengaluru 560024',
        pincode: '560024',
        contactPerson: 'Ramesh Gowda',
        phone: '9845012345',
        cutoffTime: '21:00',
        capacityKg: 15000,
        status: 'ACTIVE',
        zones: ['Zone North', 'Zone East'],
        slots: [
          { id: 'SLOT-01', label: 'Morning Fresh Slot (06:30 AM - 08:30 AM)', cutoff: '21:00' },
          { id: 'SLOT-02', label: 'Sunrise Early Desk (05:45 AM - 07:15 AM)', cutoff: '20:30' }
        ]
      }
    ],
    shops: [
      {
        id: 'SHOP-BLR-01',
        name: 'Indiranagar Hub Point',
        code: 'SHOP-BLR-01',
        warehouseId: 'WH-BLR-01',
        address: '100ft Road, HAL 2nd Stage, Indiranagar',
        pincode: '560038',
        managerName: 'Sunil Kumar',
        phone: '9876543210',
        capacityPerDay: 500,
        status: 'ACTIVE'
      },
      {
        id: 'SHOP-BLR-02',
        name: 'Whitefield Agro Express Hub',
        code: 'SHOP-BLR-02',
        warehouseId: 'WH-BLR-01',
        address: 'ITPL Main Road, Whitefield',
        pincode: '560066',
        managerName: 'Kavitha R',
        phone: '9876543211',
        capacityPerDay: 600,
        status: 'ACTIVE'
      }
    ],
    societies: [
      {
        id: 'SOC-01',
        name: 'Prestige Shantiniketan',
        code: 'PSN-WFD',
        address: 'ITPL Main Road, Whitefield, Bengaluru',
        pincode: '560066',
        flatsCount: 3000,
        nearestShopId: 'SHOP-BLR-02',
        primaryContact: 'Anand Sharma (RWA Secretary)',
        phone: '9845112233',
        commissionType: 'PERCENTAGE',
        commissionValue: 3.5,
        status: 'APPROVED',
        joinedDate: '2026-01-15'
      },
      {
        id: 'SOC-02',
        name: 'Sobha Silicon Oasis',
        code: 'SSO-IND',
        address: 'Hosa Road, Off Electronic City Corridor',
        pincode: '560100',
        flatsCount: 1800,
        nearestShopId: 'SHOP-BLR-01',
        primaryContact: 'Dr. Meera N (Treasurer)',
        phone: '9845223344',
        commissionType: 'PERCENTAGE',
        commissionValue: 4.0,
        status: 'APPROVED',
        joinedDate: '2026-02-01'
      }
    ],
    products: [
      {
        id: 'prod-tomato',
        name: 'Bangalore Farm Tomatoes (Hybrid & Country)',
        kannadaName: 'ಟೊಮೆಟೊ (Tomato)',
        category: 'VEGETABLES',
        retailUnit: '1 kg',
        retailPrice: 36,
        retailMarketPrice: 48,
        wholesaleUnit: '20 kg Mandi Crate',
        wholesalePrice: 560,
        wholesaleSavings: 'Save 28%',
        origin: 'APMC Kolar Auction Yard, Karnataka',
        shelfLife: '4-5 Days',
        desc: 'Vine-ripened firm red tomatoes graded at 4:00 AM auction. Ideal for daily curries and fresh salads.',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        badge: 'Harvested Today',
        tags: ['Farm Fresh', 'Mandi Direct', 'Bestseller'],
        gstPercent: 0,
        status: 'ACTIVE'
      },
      {
        id: 'prod-onion',
        name: 'Nashik Pink Onions (Medium-Large Grade)',
        kannadaName: 'ಈರುಳ್ಳಿ (Eerulli)',
        category: 'VEGETABLES',
        retailUnit: '1 kg',
        retailPrice: 38,
        retailMarketPrice: 52,
        wholesaleUnit: '25 kg Gunny Sack',
        wholesalePrice: 720,
        wholesaleSavings: 'Save 30%',
        origin: 'Lasalgaon Mandi, Maharashtra Direct',
        shelfLife: '14 Days',
        desc: 'Sun-cured medium pungent pink onions with tight papery skins. Minimal water moisture.',
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
        badge: 'Zero Moisture Loss',
        tags: ['Kitchen Essential', 'Direct Farmer Load'],
        gstPercent: 0,
        status: 'ACTIVE'
      },
      {
        id: 'prod-apple',
        name: 'Shimla Royal Delicious Apples (Tree-Ripened)',
        kannadaName: 'ಸೇಬು (Sebu)',
        category: 'FRUITS',
        retailUnit: '1 kg (approx 4-5 pcs)',
        retailPrice: 165,
        retailMarketPrice: 220,
        wholesaleUnit: '10 kg Orchard Master Box',
        wholesalePrice: 1380,
        wholesaleSavings: 'Save 22%',
        origin: 'Kotgarh Valley Orchards, Himachal Pradesh',
        shelfLife: '7-10 Days',
        desc: 'Crisp, sweet mountain apples direct from orchard harvest. Wax-free and naturally crunchy.',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
        badge: '100% Wax Free',
        tags: ['Orchard Direct', 'Sweet & Crisp'],
        gstPercent: 0,
        status: 'ACTIVE'
      },
      {
        id: 'prod-palak',
        name: 'Hydro-Washed Baby Palak (Spinach)',
        kannadaName: 'ಪಾಲಕ್ ಸೊಪ್ಪು (Palak Soppu)',
        category: 'LEAFY_GREENS',
        retailUnit: '1 bunch (250g)',
        retailPrice: 22,
        retailMarketPrice: 35,
        wholesaleUnit: '20 bunches Harvesting Crate',
        wholesalePrice: 310,
        wholesaleSavings: 'Save 32%',
        origin: 'Hoskote Greenhouses, Karnataka',
        shelfLife: '2-3 Days',
        desc: 'Ozone-purified water washed fresh tender spinach leaves. Zero soil grit, ready to cook.',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
        badge: 'Ozone Washed',
        tags: ['Hydro Cleansed', 'Zero Soil'],
        gstPercent: 0,
        status: 'ACTIVE'
      },
      {
        id: 'prod-avocado',
        name: 'Kodaikanal Butter Avocado & Herb Duo',
        kannadaName: 'ಬೆಣ್ಣೆ ಹಣ್ಣು (Benne Hannu)',
        category: 'EXOTIC',
        retailUnit: '1 pack (500g)',
        retailPrice: 110,
        retailMarketPrice: 160,
        wholesaleUnit: '10 packs Farm Tray',
        wholesalePrice: 850,
        wholesaleSavings: 'Save 26%',
        origin: 'Lower Palani Hills Organic Growers, Tamil Nadu',
        shelfLife: '4-5 Days',
        desc: 'Nutty, creamy Hass-hybrid butter avocados grown at 1200m elevation. High monounsaturated fats.',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
        badge: 'Superfood',
        tags: ['High Nutrition', 'Organic Shade Grown'],
        gstPercent: 0,
        status: 'ACTIVE'
      }
    ],
    orders: [
      {
        id: 'FZ-TEST-1001',
        userId: '9845099881',
        userName: 'Priya Narayanan',
        userPhone: '9845099881',
        societyId: 'SOC-01',
        societyName: 'Prestige Shantiniketan',
        flatNo: 'Tower 4, Apt 802',
        orderType: 'RETAIL',
        items: [
          { id: 'prod-tomato', name: 'Bangalore Farm Tomatoes', price: 36, qty: 2, unit: '1 kg', category: 'VEGETABLES' },
          { id: 'prod-palak', name: 'Hydro-Washed Baby Palak', price: 22, qty: 2, unit: '1 bunch', category: 'LEAFY_GREENS' },
          { id: 'prod-apple', name: 'Shimla Royal Delicious Apples', price: 165, qty: 1, unit: '1 kg', category: 'FRUITS' }
        ],
        subtotal: 281,
        deliveryFee: 0,
        gstAmount: 0,
        totalAmount: 281,
        status: 'PLACED',
        deliverySlot: 'Morning Fresh Slot (06:30 AM - 08:30 AM)',
        createdAt: new Date().toISOString(),
        paymentStatus: 'PAID',
        paymentMethod: 'UPI'
      }
    ],
    procurementLogs: [
      {
        id: 'PROC-MOCK-01',
        date: new Date().toISOString().split('T')[0],
        mandiLocation: 'APMC Kolar Yard No. 4',
        procurementOfficer: 'Karthik Raja',
        totalItems: 3,
        totalQuantityKg: 650,
        totalSpend: 18450,
        notes: 'Morning dawn auction prices. Graded Grade-A quality.',
        status: 'COMPLETED'
      }
    ],
    withdrawals: [
      {
        id: 'WD-01',
        societyId: 'SOC-01',
        societyName: 'Prestige Shantiniketan',
        amount: 3500,
        requestedDate: new Date().toISOString().split('T')[0],
        status: 'PENDING_APPROVAL',
        bankAccount: 'HDFC Bank • A/C ...8821',
        ifsc: 'HDFC0001234',
        purpose: 'Green Club & Society Garden Composting Maintenance Fund'
      }
    ]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStore));
  window.dispatchEvent(new CustomEvent('freshioz_store_updated', { detail: sampleStore }));
  pushStoreToServer(sampleStore);
  return sampleStore;
}

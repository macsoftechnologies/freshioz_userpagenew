/**
 * ============================================================================
 * Freshioz Enterprise Master Data Store (Static Schema & Clean Seed State)
 * ============================================================================
 * Clean database state for testing the complete end-to-end operational flow.
 * Only the Master Super Administrator account is retained.
 */

export const INITIAL_WAREHOUSES = [];
export const INITIAL_SHOPS = [];
export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-101',
    name: 'Vikramaditya Rao',
    phone: '9845011000',
    email: 'vikram.rao@freshioz.com',
    roles: ['SUPER_ADMIN'],
    assignedWarehouseId: 'ALL',
    assignedLocationType: 'HEADQUARTERS',
    assignedLocationName: 'Freshioz HQ Command Center',
    status: 'ACTIVE',
    dateJoined: '2026-01-01',
    authMethod: 'PASSWORD',
    password: 'Freshioz@Ops2026',
    notes: 'Platform Director & Master Operations Head'
  }
];
export const INITIAL_SOCIETIES = [];
export const INITIAL_CATEGORIES = [
  { id: 'VEGETABLES', name: 'Fresh Vegetables', slug: 'vegetables', icon: '🥦', description: 'Daily farm-fresh kitchen essentials and root vegetables', status: 'ACTIVE' },
  { id: 'FRUITS', name: 'Seasonal Fruits', slug: 'fruits', icon: '🍎', description: 'Sweet, tree-ripened orchard and citrus fruits', status: 'ACTIVE' },
  { id: 'LEAFY_GREENS', name: 'Leafy Greens & Herbs', slug: 'leafy-greens', icon: '🌿', description: 'Hydro-washed palak, methi, coriander, and fresh culinary herbs', status: 'ACTIVE' },
  { id: 'ORGANIC', name: 'Certified Organic', slug: 'organic', icon: '🌱', description: 'Zero pesticide certified organic vegetables and grains', status: 'ACTIVE' },
  { id: 'EXOTIC', name: 'Exotic & Salads', slug: 'exotic', icon: '🥑', description: 'Avocados, bell peppers, broccoli, lettuce, and salad kits', status: 'ACTIVE' }
];
export const INITIAL_UNITS = [
  { id: 'u-kg', name: 'kg', label: 'Kilogram (kg)', description: 'Standard consumer produce weight', status: 'ACTIVE' },
  { id: 'u-tones', name: 'tones', label: 'Metric Ton (tones)', description: 'Mandi truckloads and warehouse handling', status: 'ACTIVE' },
  { id: 'u-crate', name: 'crate', label: 'Standard Crate (crate)', description: 'Standard 20kg APMC harvesting / shipping crate', status: 'ACTIVE' },
  { id: 'u-g', name: 'g', label: 'Grams (g)', description: 'Punnet packs & small quantities (e.g., 250g, 500g)', status: 'ACTIVE' },
  { id: 'u-pack', name: 'pack', label: 'Prepack Polybag (pack)', description: 'Pre-sorted combo vegetables & tray packs', status: 'ACTIVE' },
  { id: 'u-bunch', name: 'bunch', label: 'Harvest Bunch (bunch)', description: 'Fresh leafy greens and herbs tied bunch', status: 'ACTIVE' }
];
export const INITIAL_PRODUCTS = [];
export const INITIAL_ORDERS = [];
export const INITIAL_WITHDRAWALS = [];
export const INITIAL_PROCUREMENT_LOGS = [];
export const INITIAL_SOCIETY_REQUESTS = [];

export const DEFAULT_STORE = {
  warehouses: INITIAL_WAREHOUSES,
  shops: INITIAL_SHOPS,
  employees: INITIAL_EMPLOYEES,
  societies: INITIAL_SOCIETIES,
  categories: INITIAL_CATEGORIES,
  units: INITIAL_UNITS,
  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  withdrawals: INITIAL_WITHDRAWALS,
  procurementLogs: INITIAL_PROCUREMENT_LOGS,
  societyRequests: INITIAL_SOCIETY_REQUESTS
};

export default DEFAULT_STORE;

import Dexie, { Table } from 'dexie';

// ==================== INTERFACES ====================

export interface Business {
  id?: number;
  name: string;
  nameNepali?: string;
  address: string;
  phone: string;
  email?: string;
  panNumber?: string;
  vatRegistered: boolean;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id?: number;
  name: string;
  nameNepali?: string;
  barcode?: string;
  category: string;
  unit: 'piece' | 'kg' | 'liter' | 'dozen' | 'box' | 'meter';
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockAlert: number;
  taxable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id?: number;
  name: string;
  nameNepali?: string;
  phone: string;
  email?: string;
  address?: string;
  panNumber?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id?: number;
  invoiceNumber: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountPercent: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'credit' | 'bank_transfer';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount: number;
  dueAmount: number;
  saleDate: Date;
  nepaliDate: string;
  fiscalYear: string;
  notes?: string;
  isSynced: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  productName: string;
  barcode?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  taxable: boolean;
  discount: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface InventoryTransaction {
  id?: number;
  productId: number;
  productName: string;
  transactionType: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  balanceStock: number;
  referenceNumber?: string;
  notes?: string;
  transactionDate: Date;
  nepaliDate: string;
  createdAt: Date;
  createdBy: string;
}

export interface SyncQueue {
  id?: number;
  entityType: 'product' | 'sale' | 'customer' | 'inventory';
  entityId: number;
  operation: 'create' | 'update' | 'delete';
  data: string;
  retryCount: number;
  lastError?: string;
  createdAt: Date;
  syncedAt?: Date;
}

export interface AppSettings {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}

// ==================== DATABASE CLASS ====================

export class AppDatabase extends Dexie {
  business!: Table<Business>;
  products!: Table<Product>;
  customers!: Table<Customer>;
  sales!: Table<Sale>;
  saleItems!: Table<SaleItem>;
  inventoryTransactions!: Table<InventoryTransaction>;
  syncQueue!: Table<SyncQueue>;
  settings!: Table<AppSettings>;

  constructor() {
    // CHANGED NAME TO FORCE NEW DATABASE
    super('NepalBillingFinal');
    
    this.version(1).stores({
      business: '++id',
      products: '++id, name, category',
      customers: '++id, name, phone',
      sales: '++id, invoiceNumber, customerId, saleDate',
      saleItems: '++id, saleId, productId',
      inventoryTransactions: '++id, productId, transactionType',
      syncQueue: '++id, entityType, entityId',
      settings: '++id, key'
    });
  }
}

// ==================== DATABASE INSTANCE ====================

export const db = new AppDatabase();

// ==================== INITIAL SETUP ====================

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    const businessCount = await db.business.count();
    
    if (businessCount === 0) {
      await db.business.add({
        name: 'My Business',
        nameNepali: 'मेरो व्यापार',
        address: 'Kathmandu, Nepal',
        phone: '9800000000',
        vatRegistered: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Default business created');
    }

    const settingsCount = await db.settings.count();
    
    if (settingsCount === 0) {
      await db.settings.bulkAdd([
        { key: 'language', value: 'en', updatedAt: new Date() },
        { key: 'currency', value: 'NPR', updatedAt: new Date() },
        { key: 'vatRate', value: '13', updatedAt: new Date() },
        { key: 'fiscalYear', value: '2080/81', updatedAt: new Date() },
        { key: 'invoicePrefix', value: 'INV', updatedAt: new Date() },
        { key: 'lastInvoiceNumber', value: '0', updatedAt: new Date() }
      ]);
      console.log('✅ Default settings created');
    }

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.where('key').equals(key).first();
  return setting ? setting.value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  
  if (existing && existing.id) {
    await db.settings.update(existing.id, {
      value,
      updatedAt: new Date()
    });
  } else {
    await db.settings.add({
      key,
      value,
      updatedAt: new Date()
    });
  }
}

export async function getNextInvoiceNumber(): Promise<string> {
  const prefix = await getSetting('invoicePrefix') || 'INV';
  const lastNumber = parseInt(await getSetting('lastInvoiceNumber') || '0');
  const nextNumber = lastNumber + 1;
  
  await setSetting('lastInvoiceNumber', nextNumber.toString());
  
  return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
}

export async function getCurrentFiscalYear(): Promise<string> {
  return await getSetting('fiscalYear') || '2080/81';
}

export async function getVATRate(): Promise<number> {
  const rate = await getSetting('vatRate');
  return parseFloat(rate || '13');
}

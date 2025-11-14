import { db, Customer } from '../database/db';

// This service handles all customer-related operations
// Similar to productService but for customers

// ==================== CREATE CUSTOMER ====================

/**
 * Creates a new customer in the database
 * @param customer - Customer details (name, phone, address, etc.)
 * @returns Customer ID (number)
 */
export async function createCustomer(
  customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchases'>
): Promise<number> {
  const now = new Date();
  
  // Check if phone already exists (each customer should have unique phone)
  const allCustomers = await db.customers.toArray();
  const existing = allCustomers.find(c => c.phone === customer.phone);
  
  if (existing) {
    throw new Error('Customer with this phone number already exists');
  }

  // Add customer to database
  const customerId = await db.customers.add({
    ...customer,
    totalPurchases: 0,  // New customer starts with 0 purchases
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ Customer created with ID:', customerId);
  return customerId;
}

// ==================== READ CUSTOMERS ====================

/**
 * Gets all customers from database
 * @param includeInactive - If true, shows deleted/inactive customers too
 * @returns Array of customers
 */
export async function getAllCustomers(includeInactive = false): Promise<Customer[]> {
  const allCustomers = await db.customers.toArray();
  
  if (includeInactive) {
    return allCustomers;
  }
  
  // Filter only active customers
  return allCustomers.filter(c => c.isActive === true);
}

/**
 * Gets a single customer by their ID
 * @param id - Customer ID
 * @returns Customer or undefined if not found
 */
export async function getCustomerById(id: number): Promise<Customer | undefined> {
  return await db.customers.get(id);
}

/**
 * Gets a customer by their phone number
 * @param phone - Phone number
 * @returns Customer or undefined if not found
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | undefined> {
  const allCustomers = await db.customers.toArray();
  return allCustomers.find(c => c.phone === phone && c.isActive === true);
}

/**
 * Search customers by name, phone, or email
 * @param query - Search text
 * @returns Matching customers
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  const lowerQuery = query.toLowerCase();
  
  const customers = await db.customers.toArray();

  return customers.filter(c => 
    c.isActive === true && (
      c.name.toLowerCase().includes(lowerQuery) ||
      (c.nameNepali && c.nameNepali.includes(query)) ||
      c.phone.includes(query) ||
      (c.email && c.email.toLowerCase().includes(lowerQuery))
    )
  );
}

// ==================== UPDATE CUSTOMER ====================

/**
 * Updates an existing customer
 * @param id - Customer ID to update
 * @param updates - Fields to update
 */
export async function updateCustomer(
  id: number, 
  updates: Partial<Customer>
): Promise<void> {
  const customer = await db.customers.get(id);
  
  if (!customer) {
    throw new Error('Customer not found');
  }

  // If updating phone, check it's unique
  if (updates.phone && updates.phone !== customer.phone) {
    const allCustomers = await db.customers.toArray();
    const existing = allCustomers.find(c => c.phone === updates.phone && c.id !== id);
    
    if (existing) {
      throw new Error('Phone number already exists');
    }
  }

  // Update the customer
  await db.customers.update(id, {
    ...updates,
    updatedAt: new Date()
  });

  console.log('✅ Customer updated:', id);
}

/**
 * Updates customer's total purchases (called after each sale)
 * @param customerId - Customer ID
 * @param amount - Sale amount to add
 */
export async function updateCustomerPurchase(
  customerId: number, 
  amount: number
): Promise<void> {
  const customer = await db.customers.get(customerId);
  
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Add to total purchases
  await db.customers.update(customerId, {
    totalPurchases: customer.totalPurchases + amount,
    lastPurchaseDate: new Date(),
    updatedAt: new Date()
  });

  console.log(`✅ Customer ${customer.name} - Total purchases updated: NPR ${customer.totalPurchases + amount}`);
}

// ==================== DELETE CUSTOMER ====================

/**
 * Deletes a customer (soft delete by default)
 * @param id - Customer ID
 * @param hardDelete - If true, permanently removes from database
 */
export async function deleteCustomer(id: number, hardDelete = false): Promise<void> {
  if (hardDelete) {
    // Permanently remove from database
    await db.customers.delete(id);
    console.log('🗑️ Customer permanently deleted:', id);
  } else {
    // Soft delete: Just mark as inactive
    await db.customers.update(id, {
      isActive: false,
      updatedAt: new Date()
    });
    console.log('✅ Customer deactivated:', id);
  }
}

// ==================== ANALYTICS ====================

/**
 * Gets top customers by total purchases
 * @param limit - How many to return (default 10)
 * @returns Top customers sorted by spending
 */
export async function getTopCustomers(limit = 10): Promise<Customer[]> {
  const customers = await db.customers.toArray();
  const activeCustomers = customers.filter(c => c.isActive === true);
  
  // Sort by totalPurchases (highest first)
  return activeCustomers
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, limit);
}

/**
 * Gets customer statistics
 * @returns Object with total customers, revenue, etc.
 */
export async function getCustomerStats() {
  const allCustomers = await db.customers.toArray();
  const customers = allCustomers.filter(c => c.isActive === true);
  
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const averagePurchase = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  // Customers with purchases in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeCustomers = customers.filter(c => 
    c.lastPurchaseDate && c.lastPurchaseDate >= thirtyDaysAgo
  ).length;
  
  return {
    totalCustomers,
    totalRevenue,
    averagePurchase,
    activeCustomers  // Purchased in last 30 days
  };
}

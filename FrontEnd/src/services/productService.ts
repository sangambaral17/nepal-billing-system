import { db, Product } from '../database/db';

// ==================== CREATE PRODUCT ====================

export async function createProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = new Date();
  
  // Check if barcode already exists (if barcode provided)
  if (product.barcode) {
    const allProducts = await db.products.toArray();
    const existing = allProducts.find(p => p.barcode === product.barcode);
    
    if (existing) {
      throw new Error('Barcode already exists');
    }
  }

  // Add product to database
  const productId = await db.products.add({
    ...product,
    createdAt: now,
    updatedAt: now,
    isActive: true
  });

  console.log('✅ Product created with ID:', productId);
  return productId;
}

// ==================== READ PRODUCTS ====================

export async function getAllProducts(includeInactive = false): Promise<Product[]> {
  const allProducts = await db.products.toArray();
  
  if (includeInactive) {
    return allProducts;
  }
  
  // Filter in JavaScript, not in database query
  return allProducts.filter(p => p.isActive === true);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  return await db.products.get(id);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const lowerQuery = query.toLowerCase();
  
  // Get all products, then filter
  const products = await db.products.toArray();

  return products.filter(p => 
    p.isActive === true && (
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.nameNepali && p.nameNepali.includes(query)) ||
      (p.barcode && p.barcode.includes(query)) ||
      p.category.toLowerCase().includes(lowerQuery)
    )
  );
}

export async function getLowStockProducts(): Promise<Product[]> {
  const products = await db.products.toArray();
  
  return products.filter(p => 
    p.isActive === true && p.currentStock <= p.minStockAlert
  );
}

// ==================== UPDATE PRODUCT ====================

export async function updateProduct(
  id: number, 
  updates: Partial<Product>
): Promise<void> {
  const product = await db.products.get(id);
  
  if (!product) {
    throw new Error('Product not found');
  }

  // If updating barcode, check it's unique
  if (updates.barcode && updates.barcode !== product.barcode) {
    const allProducts = await db.products.toArray();
    const existing = allProducts.find(p => p.barcode === updates.barcode && p.id !== id);
    
    if (existing) {
      throw new Error('Barcode already exists');
    }
  }

  // Update the product
  await db.products.update(id, {
    ...updates,
    updatedAt: new Date()
  });

  console.log('✅ Product updated:', id);
}

// ==================== DELETE PRODUCT ====================

export async function deleteProduct(id: number, hardDelete = false): Promise<void> {
  if (hardDelete) {
    await db.products.delete(id);
    console.log('🗑️ Product permanently deleted:', id);
  } else {
    await db.products.update(id, {
      isActive: false,
      updatedAt: new Date()
    });
    console.log('✅ Product deactivated:', id);
  }
}

// ==================== STATISTICS ====================

export async function getProductStats() {
  const allProducts = await db.products.toArray();
  const products = allProducts.filter(p => p.isActive === true);
  
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + (p.currentStock * p.costPrice), 
    0
  );
  const lowStockCount = products.filter(
    p => p.currentStock <= p.minStockAlert
  ).length;
  const outOfStockCount = products.filter(
    p => p.currentStock === 0
  ).length;
  
  return {
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount
  };
}

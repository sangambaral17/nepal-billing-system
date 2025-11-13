import { useEffect, useState } from 'react'
import { initializeDatabase } from './database/db'
import { createProduct, getAllProducts } from './services/productService'

function App() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    setupApp()
  }, [])

  const setupApp = async () => {
    try {
      await initializeDatabase()
      
      // Test: Create a sample product
      await createProduct({
        name: 'Coca Cola',
        nameNepali: 'कोका कोला',
        barcode: '1234567890123',
        category: 'Beverages',
        unit: 'piece',
        costPrice: 40,
        sellingPrice: 50,
        currentStock: 100,
        minStockAlert: 20,
        taxable: true
      })
      
      // Get all products
      const allProducts = await getAllProducts()
      setProducts(allProducts)
      setDbStatus('success')
    } catch (error) {
      console.error('Setup failed:', error)
      setDbStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🇳🇵 Nepal Billing System - Product Service Test
        </h1>

        {dbStatus === 'loading' && <p>Loading...</p>}
        
        {dbStatus === 'success' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Products in Database: {products.length}
            </h2>
            
            {products.map((product, index) => (
              <div key={index} className="border-b py-3">
                <p className="font-semibold">{product.name} ({product.nameNepali})</p>
                <p className="text-sm text-gray-600">
                  Barcode: {product.barcode} | 
                  Price: NPR {product.sellingPrice} | 
                  Stock: {product.currentStock}
                </p>
              </div>
            ))}
            
            <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">
                ✅ Product Service Working!
              </p>
              <p className="text-sm text-green-700 mt-2">
                Check console (F12) for logs
              </p>
            </div>
          </div>
        )}
        
        {dbStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">❌ Error! Check console.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

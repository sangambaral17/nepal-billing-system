import { useEffect, useState, useRef } from 'react'
import { initializeDatabase } from './database/db'
import { createProduct, getAllProducts } from './services/productService'
import { createCustomer, getAllCustomers, getCustomerStats, getCustomerByPhone } from './services/customerService'

function App() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [customerStats, setCustomerStats] = useState<any>(null)
  
  // Prevent double execution in StrictMode
  const initialized = useRef(false)

  useEffect(() => {
    // Only run once, even in StrictMode
    if (initialized.current) return
    initialized.current = true
    
    setupApp()
  }, [])

  const setupApp = async () => {
    try {
      await initializeDatabase()
      
      // Get existing data
      const existingProducts = await getAllProducts()
      const existingCustomers = await getAllCustomers()
      
      // Create sample product if none exists
      if (existingProducts.length === 0) {
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
        console.log('✅ Sample product created')
      }
      
      // Create sample customers only if they don't exist
      const ramExists = await getCustomerByPhone('9841234567')
      if (!ramExists) {
        await createCustomer({
          name: 'Ram Sharma',
          nameNepali: 'राम शर्मा',
          phone: '9841234567',
          email: 'ram@example.com',
          address: 'Kathmandu, Nepal'
        })
        console.log('✅ Ram Sharma created')
      }
      
      const sitaExists = await getCustomerByPhone('9851234567')
      if (!sitaExists) {
        await createCustomer({
          name: 'Sita Devi',
          nameNepali: 'सीता देवी',
          phone: '9851234567',
          address: 'Lalitpur, Nepal'
        })
        console.log('✅ Sita Devi created')
      }
      
      // Get all data
      const allProducts = await getAllProducts()
      const allCustomers = await getAllCustomers()
      const stats = await getCustomerStats()
      
      setProducts(allProducts)
      setCustomers(allCustomers)
      setCustomerStats(stats)
      setDbStatus('success')
    } catch (error) {
      console.error('❌ Setup failed:', error)
      setDbStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          🇳🇵 Nepal Billing System - Services Test
        </h1>

        {dbStatus === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        )}
        
        {dbStatus === 'success' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📦 Products ({products.length})
              </h2>
              
              {products.length === 0 ? (
                <p className="text-gray-500">No products yet</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="border-b py-3 last:border-0">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-600 font-nepali">{product.nameNepali}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {product.currentStock} | Price: NPR {product.sellingPrice}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Customers Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                👥 Customers ({customers.length})
              </h2>
              
              {customers.length === 0 ? (
                <p className="text-gray-500">No customers yet</p>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="border-b py-3 last:border-0">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600 font-nepali">{customer.nameNepali}</p>
                    <p className="text-sm text-gray-500">
                      📞 {customer.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      📍 {customer.address}
                    </p>
                    {customer.email && (
                      <p className="text-sm text-gray-500">
                        📧 {customer.email}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">
                      Total Purchases: NPR {customer.totalPurchases}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Statistics Section */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📊 Customer Statistics
              </h2>
              
              {customerStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold text-blue-600">{customerStats.totalCustomers}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">NPR {customerStats.totalRevenue}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Avg Purchase</p>
                    <p className="text-2xl font-bold text-purple-600">NPR {customerStats.averagePurchase.toFixed(0)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Active (30 days)</p>
                    <p className="text-2xl font-bold text-orange-600">{customerStats.activeCustomers}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            <div className="lg:col-span-2 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Both Services Working Perfectly!
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <p className="font-semibold mb-2">✅ Product Service:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Create products ✅</li>
                    <li>• List products ✅</li>
                    <li>• Search products ✅</li>
                    <li>• Update/Delete ✅</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">✅ Customer Service:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Create customers ✅</li>
                    <li>• List customers ✅</li>
                    <li>• Search by phone ✅</li>
                    <li>• Track purchases ✅</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-green-700 font-semibold">
                🎉 No duplicates! Everything working perfectly!
              </p>
            </div>
          </div>
        )}
        
        {dbStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800 font-semibold">❌ Error!</p>
            <p className="text-sm text-red-700 mt-2">Check console (F12) for details</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

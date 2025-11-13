import { useEffect, useState } from 'react'
import { initializeDatabase, db } from './database/db'

function App() {
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [stats, setStats] = useState({ products: 0, customers: 0, sales: 0 })

  useEffect(() => {
    setupDatabase()
  }, [])

  const setupDatabase = async () => {
    try {
      const success = await initializeDatabase()
      
      if (success) {
        const productCount = await db.products.count()
        const customerCount = await db.customers.count()
        const salesCount = await db.sales.count()
        
        setStats({
          products: productCount,
          customers: customerCount,
          sales: salesCount
        })
        
        setDbStatus('success')
      } else {
        setDbStatus('error')
      }
    } catch (error) {
      console.error('Database setup failed:', error)
      setDbStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            🇳🇵 Nepal Billing System
          </h1>
          <p className="text-xl text-gray-700 font-nepali">
            नेपाल बिलिंग प्रणाली
          </p>
        </div>

        {dbStatus === 'loading' && (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing database...</p>
          </div>
        )}

        {dbStatus === 'success' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500 text-sm">Products</p>
                <p className="text-3xl font-bold text-blue-600">{stats.products}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500 text-sm">Customers</p>
                <p className="text-3xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500 text-sm">Sales</p>
                <p className="text-3xl font-bold text-purple-600">{stats.sales}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Database Initialized Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Your offline database is ready. All data will be stored locally on this device.
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✓ IndexedDB initialized</li>
                <li>✓ Business settings configured</li>
                <li>✓ VAT rate set to 13% (Nepal standard)</li>
                <li>✓ Ready for offline operation</li>
              </ul>
            </div>
          </div>
        )}

        {dbStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Database Initialization Failed
            </h3>
            <p className="text-red-700">
              Please check the browser console for errors and try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

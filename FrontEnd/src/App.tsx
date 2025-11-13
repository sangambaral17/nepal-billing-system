import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🇳🇵 Nepal Billing System
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          नेपाल बिलिंग प्रणाली
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-gray-600">
            Click the button to test React
          </p>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">✅ Phase 6 Complete!</p>
          <p className="text-green-700 text-sm mt-2">
            All dependencies installed and Tailwind CSS is working
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

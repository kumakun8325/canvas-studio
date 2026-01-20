import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Canvas Studio</h1>
        <p className="text-gray-600 mb-6">Vite + React + TypeScript + Tailwind CSS v4</p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App

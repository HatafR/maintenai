'use client'

import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${API_URL}/health`)
        setError(null)
      } catch (err) {
        setError('⚠️ Backend not running. Start with: python -m uvicorn backend.main:app --reload')
      }
    }

    checkBackend()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 text-red-100 text-center sticky top-0 z-50">
          {error}
        </div>
      )}
      <Dashboard apiUrl={API_URL} />
    </main>
  )
}

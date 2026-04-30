'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import HealthCard from './HealthCard'
import SensorMetrics from './SensorMetrics'
import SensorChart from './SensorChart'
import StatusBadge from './StatusBadge'

interface SensorData {
  temperature: number
  vibration: number
  pressure: number
}

interface Prediction {
  anomaly_score: number
  health_score: number
  status: 'normal' | 'warning' | 'critical'
  confidence: number
  message: string
}

interface Reading {
  timestamp: string
  sensor_data: SensorData
  prediction: Prediction
}

export default function Dashboard({ apiUrl }: { apiUrl: string }) {
  const [currentReading, setCurrentReading] = useState<Reading | null>(null)
  const [history, setHistory] = useState<Reading[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchSensorData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const response = await axios.get(`${apiUrl}/simulate`)
      setCurrentReading(response.data)
      
      setHistory(prev => [response.data, ...prev].slice(0, 50))
    } catch (err) {
      console.error('Error fetching sensor data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchSensorData()
  }, [fetchSensorData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchSensorData()
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchSensorData])

  return (
    <div className="min-h-screen p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">MaintenAI</h1>
        <p className="text-gray-400">AI-Powered Predictive Maintenance Platform</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={fetchSensorData}
          disabled={isRefreshing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isRefreshing ? '⟳ Updating...' : '🔄 Simulate'}
        </button>
        
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            autoRefresh
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {autoRefresh ? '▶ Auto ON' : '⏸ Auto OFF'}
        </button>
      </div>

      {!currentReading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Top Row: Health Card + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <HealthCard healthScore={currentReading.prediction.health_score} />
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <StatusBadge status={currentReading.prediction.status} />
              <p className="text-gray-300 mt-4 text-sm">{currentReading.prediction.message}</p>
              <p className="text-gray-500 text-xs mt-2">
                Confidence: {(currentReading.prediction.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Sensor Metrics */}
          <SensorMetrics sensorData={currentReading.sensor_data} />

          {/* Charts */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mt-8">
            <h2 className="text-xl font-semibold mb-4">Trend Analysis</h2>
            {history.length > 0 ? (
              <SensorChart history={history} />
            ) : (
              <p className="text-gray-400">Loading chart data...</p>
            )}
          </div>

          {/* Metadata */}
          <div className="text-gray-500 text-xs mt-8 text-center">
            Last update: {new Date(currentReading.timestamp).toLocaleTimeString()}
            <br />
            Readings collected: {history.length}
          </div>
        </>
      )}
    </div>
  )
}

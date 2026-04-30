interface SensorData {
  temperature: number
  vibration: number
  pressure: number
}

export default function SensorMetrics({ sensorData }: { sensorData: SensorData }) {
  const metrics = [
    {
      name: 'Temperature',
      value: `${sensorData.temperature.toFixed(1)}°C`,
      normal: { min: 70, max: 85 },
      icon: '🌡️',
      unit: '°C'
    },
    {
      name: 'Vibration',
      value: sensorData.vibration.toFixed(2),
      normal: { min: 0.4, max: 0.7 },
      icon: '📊',
      unit: 'units'
    },
    {
      name: 'Pressure',
      value: `${sensorData.pressure.toFixed(1)} PSI`,
      normal: { min: 95, max: 115 },
      icon: '⚙️',
      unit: 'PSI'
    }
  ]

  const getStatus = (value: number, min: number, max: number) => {
    return (value >= min && value <= max) ? 'normal' : 'warning'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, idx) => {
        const value = metric.name === 'Temperature' ? sensorData.temperature :
                     metric.name === 'Vibration' ? sensorData.vibration :
                     sensorData.pressure
        
        const status = getStatus(value, metric.normal.min, metric.normal.max)

        return (
          <div
            key={idx}
            className={`rounded-xl p-6 border transition ${
              status === 'normal'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-yellow-900/20 border-yellow-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 font-semibold text-sm">{metric.name}</span>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
            <div className="text-xs text-gray-500">
              Normal: {metric.normal.min}–{metric.normal.max} {metric.unit}
            </div>
            {status === 'warning' && (
              <div className="text-xs text-yellow-400 mt-2">⚠️ Out of normal range</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

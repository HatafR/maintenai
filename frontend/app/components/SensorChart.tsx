import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Reading {
  timestamp: string
  sensor_data: {
    temperature: number
    vibration: number
    pressure: number
  }
}

export default function SensorChart({ history }: { history: Reading[] }) {
  const chartData = history
    .slice()
    .reverse()
    .map((reading, idx) => ({
      time: idx,
      temperature: reading.sensor_data.temperature,
      vibration: Math.round(reading.sensor_data.vibration * 50), // Scale for visibility
      pressure: reading.sensor_data.pressure
    }))

  if (chartData.length === 0) {
    return <div className="text-gray-400">No data to display</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="time" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="temperature" 
          stroke="#ef4444" 
          name="Temp (°C)"
          dot={false}
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="vibration" 
          stroke="#3b82f6" 
          name="Vibration (×50)"
          dot={false}
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="pressure" 
          stroke="#10b981" 
          name="Pressure (PSI)"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

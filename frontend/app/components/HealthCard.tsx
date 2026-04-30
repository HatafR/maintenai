export default function HealthCard({ healthScore }: { healthScore: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBgColor = (score: number) => {
    if (score >= 80) return 'from-green-900/20 to-green-900/5'
    if (score >= 60) return 'from-yellow-900/20 to-yellow-900/5'
    return 'from-red-900/20 to-red-900/5'
  }

  const getStatus = (score: number) => {
    if (score >= 80) return '✅ Healthy'
    if (score >= 60) return '⚠️ Monitor'
    return '🚨 Critical'
  }

  return (
    <div className={`bg-gradient-to-br ${getBgColor(healthScore)} rounded-2xl p-8 border border-gray-800`}>
      <h2 className="text-lg font-semibold text-gray-300 mb-6">Machine Health</h2>
      
      {/* Circular progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#eab308' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={`${(healthScore / 100) * 282.6} 282.6`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${getColor(healthScore)}`}>
              {healthScore}
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
        </div>
      </div>

      {/* Status text */}
      <p className="text-center text-gray-300 font-semibold">
        {getStatus(healthScore)}
      </p>
    </div>
  )
}

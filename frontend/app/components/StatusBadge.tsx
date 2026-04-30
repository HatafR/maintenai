interface Props {
  status: 'normal' | 'warning' | 'critical'
}

export default function StatusBadge({ status }: Props) {
  const colors = {
    normal: { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-700' },
    warning: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700' },
    critical: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700' }
  }

  const icons = {
    normal: '✅',
    warning: '⚠️',
    critical: '🚨'
  }

  const labels = {
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical'
  }

  const color = colors[status]

  return (
    <div className={`inline-block px-4 py-3 rounded-lg border ${color.bg} ${color.border}`}>
      <span className={`font-semibold text-lg ${color.text}`}>
        {icons[status]} {labels[status]}
      </span>
    </div>
  )
}

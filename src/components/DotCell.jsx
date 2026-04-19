const MOOD_COLORS = {
  good:       'bg-good',
  'good-light': 'bg-good-light',
  bad:        'bg-bad',
  'bad-light': 'bg-bad-light',
  off:        'bg-off',
}

export default function DotCell({ mood, day, isWorkable = true, onClick, variant = 'calendar' }) {
  const isNonWorkable = !isWorkable && mood === null
  const colorKey = mood
    ? (variant === 'heatmap' && mood === 'good' ? 'good-light'
      : variant === 'heatmap' && mood === 'bad' ? 'bad-light'
      : mood)
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={[
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans',
        colorKey ? MOOD_COLORS[colorKey] : 'bg-paper',
        isNonWorkable ? 'opacity-30' : '',
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
      ].join(' ')}
      aria-label={`Day ${day}${mood ? ` — ${mood}` : ''}`}
    >
      <span className={mood ? 'text-white' : 'text-muted'}>{day}</span>
    </button>
  )
}

export function percentGood(entries) {
  const good = entries.filter(e => e.mood === 'good').length
  const bad  = entries.filter(e => e.mood === 'bad').length
  if (good + bad === 0) return null
  return (good / (good + bad)) * 100
}

export function weekLabel(pctGood) {
  if (pctGood === null) return '—'
  if (pctGood >= 80) return 'Good week'
  if (pctGood >= 50) return 'Mixed week'
  return 'Tough week'
}

export function deltaVsPrior(current, prior) {
  if (current === null || prior === null) return null
  return current - prior
}

export function formatPctGood(value) {
  if (value === null) return '—'
  return value.toFixed(1) + '%'
}

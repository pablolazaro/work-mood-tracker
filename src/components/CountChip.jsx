export default function CountChip({ good, bad, off }) {
  return (
    <p className="font-sans text-xs text-muted">
      <span className="text-good font-medium">Good: {good}</span>
      {' · '}
      <span className="text-bad font-medium">Bad: {bad}</span>
      {' · '}
      <span className="text-off font-medium">Off: {off}</span>
    </p>
  )
}

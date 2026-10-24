export default function LoadingDots({ label = 'AI is thinking…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: 'var(--text-muted)', fontSize: 14 }}>
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}

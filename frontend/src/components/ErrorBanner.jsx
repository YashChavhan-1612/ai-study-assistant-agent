export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null
  return (
    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span>⚠️ {message}</span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {onRetry && <button className="btn btn-sm btn-secondary" onClick={onRetry}>Retry</button>}
        {onDismiss && <button className="btn btn-sm btn-secondary" onClick={onDismiss}>✕</button>}
      </div>
    </div>
  )
}

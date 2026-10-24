import { useState } from 'react'
import { api } from '../api'
import MarkdownView from '../components/MarkdownView'
import ErrorBanner from '../components/ErrorBanner'
import LoadingDots from '../components/LoadingDots'

export default function NotesGenerator() {
  const [form, setForm] = useState({ topic: '', subject: '', difficulty: 'intermediate', length: 'standard' })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const generate = async () => {
    if (!form.topic.trim() || !form.subject.trim()) { setError('Please fill in Topic and Subject.'); return }
    setError(''); setNotes(''); setLoading(true)
    try {
      const data = await api.generateNotes(form)
      setNotes(data.notes)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([notes], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${form.topic.replace(/\s+/g, '_')}_notes.md`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: notes || loading ? '380px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 20 }}>📝</span><strong>Generate Notes</strong></div>
        <div className="card-body">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
          <div className="form-group">
            <label>Topic *</label>
            <input className="form-control" placeholder="e.g. Newton's Laws of Motion" value={form.topic} onChange={set('topic')} />
          </div>
          <div className="form-group">
            <label>Subject *</label>
            <input className="form-control" placeholder="e.g. Physics" value={form.subject} onChange={set('subject')} />
          </div>
          <div className="form-group">
            <label>Difficulty Level</label>
            <select className="form-control" value={form.difficulty} onChange={set('difficulty')}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes Length</label>
            <select className="form-control" value={form.length} onChange={set('length')}>
              <option value="brief">Brief (~300 words)</option>
              <option value="standard">Standard (~600 words)</option>
              <option value="comprehensive">Comprehensive (~1200 words)</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : '✨ Generate Notes'}
          </button>
        </div>
      </div>

      {(loading || notes) && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📄</span><strong>Study Notes</strong>
              {notes && <span className="badge badge-success">Ready</span>}
            </div>
            {notes && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={copy}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button className="btn btn-sm btn-secondary" onClick={download}>⬇ Download</button>
              </div>
            )}
          </div>
          <div className="card-body">
            {loading ? <LoadingDots label="Generating your notes…" /> : <MarkdownView content={notes} />}
          </div>
        </div>
      )}

      {!loading && !notes && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>Ready to generate notes</h3>
          <p>Fill in the topic and subject on the left, then click Generate Notes</p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { api } from '../api'
import MarkdownView from '../components/MarkdownView'
import ErrorBanner from '../components/ErrorBanner'
import LoadingDots from '../components/LoadingDots'

function minDate() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState([])
  const [subInput, setSubInput] = useState('')
  const [examDate, setExamDate] = useState('')
  const [hours, setHours] = useState(4)
  const [topics, setTopics] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSubject = () => {
    const s = subInput.trim()
    if (!s || subjects.includes(s) || subjects.length >= 10) return
    setSubjects(p => [...p, s]); setSubInput('')
  }

  const removeSubject = s => setSubjects(p => p.filter(x => x !== s))

  const generate = async () => {
    if (subjects.length === 0) { setError('Add at least one subject.'); return }
    if (!examDate) { setError('Please select an exam / target date.'); return }
    if (new Date(examDate) <= new Date()) { setError('Exam date must be in the future.'); return }
    setError(''); setPlan(''); setLoading(true)
    try {
      const data = await api.generatePlan({ subjects, exam_date: examDate, hours_per_day: Number(hours), topics })
      setPlan(data.plan)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const download = () => {
    const blob = new Blob([plan], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'study_plan.md'
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: plan || loading ? '380px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 20 }}>📅</span><strong>Study Planner</strong></div>
        <div className="card-body">
          <ErrorBanner message={error} onDismiss={() => setError('')} />

          <div className="form-group">
            <label>Subjects</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="form-control"
                placeholder="Add subject, press +"
                value={subInput}
                onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubject()}
              />
              <button className="btn btn-primary" style={{ flexShrink: 0, padding: '10px 14px' }} onClick={addSubject}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {subjects.map(s => (
                <span key={s} className="tag">
                  {s}
                  <button className="tag-remove" onClick={() => removeSubject(s)}>×</button>
                </span>
              ))}
              {subjects.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>No subjects added yet</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Exam / Target Date *</label>
            <input className="form-control" type="date" min={minDate()} value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Study Hours Per Day: <strong style={{ color: 'var(--primary)' }}>{hours}h</strong></label>
            <input
              type="range" min={0.5} max={12} step={0.5} value={hours}
              onChange={e => setHours(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-light)' }}>
              <span>0.5h</span><span>12h</span>
            </div>
          </div>

          <div className="form-group">
            <label>Topics / Syllabus (optional)</label>
            <textarea
              className="form-control"
              placeholder="e.g. Algebra, Calculus, Mechanics, Thermodynamics…"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              rows={3}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Planning…</> : '📋 Generate Study Plan'}
          </button>
        </div>
      </div>

      {(loading || plan) && (
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📋</span><strong>Your Study Plan</strong>
              {plan && <span className="badge badge-success">Ready</span>}
            </div>
            {plan && <button className="btn btn-sm btn-secondary" onClick={download}>⬇ Download</button>}
          </div>
          <div className="card-body">
            {loading ? <LoadingDots label="Building your personalised plan…" /> : <MarkdownView content={plan} />}
          </div>
        </div>
      )}

      {!loading && !plan && (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <h3>Plan your success</h3>
          <p>Add subjects, set your exam date, and get a personalised daily schedule</p>
        </div>
      )}
    </div>
  )
}

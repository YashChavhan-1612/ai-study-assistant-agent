import { useState } from 'react'
import { api } from '../api'
import MarkdownView from '../components/MarkdownView'
import ErrorBanner from '../components/ErrorBanner'
import LoadingDots from '../components/LoadingDots'

export default function QuizGenerator() {
  const [form, setForm] = useState({ topic: '', subject: '', num_questions: 5 })
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const generate = async () => {
    if (!form.topic.trim() || !form.subject.trim()) { setError('Please fill in Topic and Subject.'); return }
    const n = Number(form.num_questions)
    if (n < 2 || n > 10) { setError('Number of questions must be between 2 and 10.'); return }
    setError(''); setQuiz(null); setAnswers({}); setSubmitted(false); setLoading(true)
    try {
      const data = await api.generateQuiz({ ...form, num_questions: n })
      setQuiz(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const select = (qid, key) => { if (!submitted) setAnswers(a => ({ ...a, [qid]: key })) }

  const submit = () => {
    if (!quiz) return
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting.'); return
    }
    setError(''); setSubmitted(true)
  }

  const score = quiz ? quiz.questions.filter(q => answers[q.id] === q.correct_key).length : 0

  const optClass = (q, opt) => {
    if (!submitted) return answers[q.id] === opt.key ? 'selected' : ''
    if (opt.key === q.correct_key) return 'correct disabled'
    if (answers[q.id] === opt.key) return 'incorrect disabled'
    return 'disabled'
  }

  const reset = () => { setQuiz(null); setAnswers({}); setSubmitted(false); setError('') }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span style={{ fontSize: 20 }}>❓</span><strong>Quiz Generator</strong></div>
        <div className="card-body">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
          <div className="grid-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label>Topic *</label>
              <input className="form-control" placeholder="e.g. Photosynthesis" value={form.topic} onChange={set('topic')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Subject *</label>
              <input className="form-control" placeholder="e.g. Biology" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Questions (2–10)</label>
              <input className="form-control" type="number" min={2} max={10} value={form.num_questions} onChange={set('num_questions')} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={generate} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : '🎯 Generate Quiz'}
          </button>
        </div>
      </div>

      {loading && <div className="card card-body"><LoadingDots label="Creating your quiz questions…" /></div>}

      {quiz && !loading && (
        <div>
          {submitted && (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: 28 }}>
              <div className="score-ring">{score}/{quiz.questions.length}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                {score === quiz.questions.length ? '🏆 Perfect Score!' : score >= quiz.questions.length / 2 ? '👍 Well Done!' : '📖 Keep Studying!'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                You scored {score} out of {quiz.questions.length} ({Math.round(score / quiz.questions.length * 100)}%)
              </div>
              <button className="btn btn-primary" onClick={reset}>Try Another Quiz</button>
            </div>
          )}

          {quiz.questions.map((q, idx) => (
            <div className="card" key={q.id} style={{ marginBottom: 14 }}>
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>
                  <span className="badge badge-primary" style={{ marginRight: 8 }}>Q{idx + 1}</span>
                  {q.question}
                </div>
                {q.options.map(opt => (
                  <div key={opt.key} className={`quiz-option ${optClass(q, opt)}`} onClick={() => select(q.id, opt.key)}>
                    <span style={{ fontWeight: 700, minWidth: 24, color: 'var(--primary)' }}>{opt.key}.</span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                    {submitted && opt.key === q.correct_key && <span>✅</span>}
                    {submitted && answers[q.id] === opt.key && opt.key !== q.correct_key && <span>❌</span>}
                  </div>
                ))}
                {submitted && (
                  <div className="alert alert-info" style={{ marginTop: 12, marginBottom: 0 }}>
                    <strong>💡 Explanation:</strong>
                    <MarkdownView content={q.explanation} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {!submitted && (
            <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} onClick={submit}>
              Submit Quiz ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </button>
          )}
        </div>
      )}

      {!quiz && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>Ready to test your knowledge?</h3>
          <p>Configure your quiz above and click Generate Quiz</p>
        </div>
      )}
    </div>
  )
}

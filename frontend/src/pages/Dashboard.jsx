import { useNavigate } from 'react-router-dom'

const QUICK_ACTIONS = [
  { path: '/tutor', icon: '🤖', title: 'AI Tutor', desc: 'Ask any academic question' },
  { path: '/notes', icon: '📝', title: 'Notes Generator', desc: 'Generate structured study notes' },
  { path: '/quiz', icon: '❓', title: 'Quiz Generator', desc: 'Test your knowledge with MCQs' },
  { path: '/planner', icon: '📅', title: 'Study Planner', desc: 'Build your daily schedule' },
  { path: '/documents', icon: '📄', title: 'Study Documents', desc: 'Ask questions about your PDFs' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4f46e5 100%)', border: 'none', color: '#fff', padding: '36px 32px' }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Welcome to</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>AI Study Assistant Agent</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Your intelligent academic companion powered by Google Gemini AI. Generate notes, create quizzes, plan your studies, and get answers from your documents — all in one place.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</h3>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {QUICK_ACTIONS.map(a => (
          <div key={a.path} className="qa-card" onClick={() => navigate(a.path)}>
            <div className="qa-card-icon">{a.icon}</div>
            <div className="qa-card-title">{a.title}</div>
            <div className="qa-card-desc">{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Key Features</h3>
      <div className="grid-2">
        {[
          { icon: '🧠', title: 'Context-Aware Chat', desc: 'Multi-turn conversations that remember previous questions for coherent academic discussions.' },
          { icon: '📚', title: 'Structured Notes', desc: 'Auto-generate notes with concepts, definitions, examples, and revision questions at your level.' },
          { icon: '🏆', title: 'Interactive Quizzes', desc: 'MCQ quizzes with scoring, validation, and AI-powered explanations for every question.' },
          { icon: '🔍', title: 'Document Q&A', desc: 'Upload your study PDFs and ask specific questions — answers are grounded in document content.' },
        ].map(f => (
          <div className="card" key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 5, fontSize: 15 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

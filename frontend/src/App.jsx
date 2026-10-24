import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AiTutor from './pages/AiTutor'
import NotesGenerator from './pages/NotesGenerator'
import QuizGenerator from './pages/QuizGenerator'
import StudyPlanner from './pages/StudyPlanner'
import StudyDocuments from './pages/StudyDocuments'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/tutor', label: 'AI Tutor', icon: '🤖' },
  { path: '/notes', label: 'Notes Generator', icon: '📝' },
  { path: '/quiz', label: 'Quiz Generator', icon: '❓' },
  { path: '/planner', label: 'Study Planner', icon: '📅' },
  { path: '/documents', label: 'Study Documents', icon: '📄' },
]

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tutor': 'AI Tutor',
  '/notes': 'Notes Generator',
  '/quiz': 'Quiz Generator',
  '/planner': 'Study Planner',
  '/documents': 'Study Documents',
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = PAGE_TITLES[location.pathname] || 'AI Study Assistant'

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>🎓 AI Study Assistant</h1>
          <p>Powered by Gemini AI</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false) }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          v1.0.0 · Mini Project Demo
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <h2>{title}</h2>
          </div>
          <span className="badge badge-primary">Gemini AI</span>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tutor" element={<AiTutor />} />
            <Route path="/notes" element={<NotesGenerator />} />
            <Route path="/quiz" element={<QuizGenerator />} />
            <Route path="/planner" element={<StudyPlanner />} />
            <Route path="/documents" element={<StudyDocuments />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

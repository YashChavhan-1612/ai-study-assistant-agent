import { useState, useRef, useEffect } from 'react'
import { api } from '../api'
import MarkdownView from '../components/MarkdownView'
import ErrorBanner from '../components/ErrorBanner'

const SUGGESTIONS = [
  "Explain Newton's 3rd Law with examples",
  'What is Big O notation?',
  'Summarise the causes of the French Revolution',
  'How does photosynthesis work?',
]

export default function AiTutor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setError('')
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const data = await api.chat(msg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="card chat-container">
      <div className="card-header">
        <span style={{ fontSize: 22 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>AI Tutor</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ask any academic question — conversation context is maintained</div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-sm btn-secondary" onClick={() => { setMessages([]); setError('') }}>
            🗑 Clear
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3>Start a conversation</h3>
            <p>Ask me anything — concepts, problems, theory, or exam tips!</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="btn btn-secondary btn-sm" onClick={() => sendMessage(s)} disabled={loading}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg-bubble msg-${m.role}`}>
            {m.role === 'assistant' ? <MarkdownView content={m.content} /> : m.content}
          </div>
        ))}

        {loading && (
          <div className="msg-bubble msg-assistant" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{ padding: '0 16px 8px' }}>
          <ErrorBanner message={error} onRetry={() => { setError('') }} onDismiss={() => setError('')} />
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
          disabled={loading}
          style={{ maxHeight: 120, overflowY: 'auto' }}
        />
        <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '➤ Send'}
        </button>
      </div>
    </div>
  )
}

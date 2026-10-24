const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
    clearTimeout(timeout)
    if (!res.ok) {
      let detail = `Request failed (${res.status})`
      try { const err = await res.json(); detail = err.detail || detail } catch {}
      if (res.status === 429) detail = 'AI quota exceeded. Please wait a moment and try again.'
      if (res.status === 503) detail = 'AI service is not configured. Please check backend setup.'
      if (res.status === 504) detail = 'AI request timed out. Please try again.'
      throw new Error(detail)
    }
    return res.json()
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw err
  }
}

export const api = {
  health: () => request('/api/health'),
  chat: (message, history) =>
    request('/api/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  generateNotes: (data) =>
    request('/api/notes/generate', { method: 'POST', body: JSON.stringify(data) }),
  generateQuiz: (data) =>
    request('/api/quizzes/generate', { method: 'POST', body: JSON.stringify(data) }),
  generatePlan: (data) =>
    request('/api/planner/generate', { method: 'POST', body: JSON.stringify(data) }),
  uploadDocument: async (file) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${BASE}/api/documents/upload`, {
        method: 'POST', body: form, signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        let detail = `Upload failed (${res.status})`
        try { const err = await res.json(); detail = err.detail || detail } catch {}
        throw new Error(detail)
      }
      return res.json()
    } catch (err) {
      clearTimeout(timeout)
      if (err.name === 'AbortError') throw new Error('Upload timed out.')
      throw err
    }
  },
  askDocument: (doc_id, question) =>
    request('/api/documents/ask', { method: 'POST', body: JSON.stringify({ doc_id, question }) }),
}

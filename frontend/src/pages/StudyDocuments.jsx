import { useState, useRef } from 'react'
import { api } from '../api'
import MarkdownView from '../components/MarkdownView'
import ErrorBanner from '../components/ErrorBanner'
import LoadingDots from '../components/LoadingDots'

const MAX_MB = 10

export default function StudyDocuments() {
  const [file, setFile] = useState(null)
  const [docInfo, setDocInfo] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [askLoading, setAskLoading] = useState(false)
  const [askError, setAskError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) { setUploadError('Only PDF files are accepted.'); return }
    if (f.size > MAX_MB * 1024 * 1024) { setUploadError(`File too large. Maximum size is ${MAX_MB} MB.`); return }
    setFile(f); setUploadError(''); setDocInfo(null); setAnswer(''); setQuestion('')
  }

  const upload = async () => {
    if (!file) return
    setUploadLoading(true); setUploadError(''); setDocInfo(null); setAnswer(''); setUploadProgress(30)
    try {
      const data = await api.uploadDocument(file)
      setUploadProgress(100)
      setDocInfo(data)
    } catch (e) { setUploadError(e.message); setUploadProgress(0) }
    finally { setUploadLoading(false) }
  }

  const ask = async () => {
    if (!question.trim()) return
    if (!docInfo) { setAskError('Please upload a document first.'); return }
    setAskLoading(true); setAskError(''); setAnswer('')
    try {
      const data = await api.askDocument(docInfo.doc_id, question)
      setAnswer(data.answer)
    } catch (e) { setAskError(e.message) }
    finally { setAskLoading(false) }
  }

  const reset = () => {
    setFile(null); setDocInfo(null); setAnswer(''); setQuestion(''); setUploadProgress(0)
    setUploadError(''); setAskError('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Upload Panel */}
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 20 }}>📄</span><strong>Upload PDF</strong></div>
        <div className="card-body">
          <ErrorBanner message={uploadError} onDismiss={() => setUploadError('')} />

          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => !file && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? (docInfo ? '✅' : '📋') : '📂'}</div>
            {file ? (
              <>
                <div style={{ fontWeight: 600, marginBottom: 4, wordBreak: 'break-all' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                {docInfo && <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 4 }}>{docInfo.chunks} text chunks extracted</div>}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Click or drag &amp; drop your PDF</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF files only · Max {MAX_MB} MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {uploadLoading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${uploadProgress}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>Processing PDF…</div>
            </div>
          )}

          {file && !docInfo && !uploadLoading && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={upload}>
              ⬆ Upload &amp; Process
            </button>
          )}

          {docInfo && (
            <>
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                ✅ <strong>{docInfo.filename}</strong> ready — {docInfo.chunks} chunks extracted.
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: 8, fontSize: 13 }} onClick={reset}>
                📂 Upload Different File
              </button>
            </>
          )}

          <div className="alert alert-warning" style={{ marginTop: 12, fontSize: 12 }}>
            ⚠️ Uploads are temporary — cleared when the server restarts.
          </div>
        </div>
      </div>

      {/* Q&A Panel */}
      <div className="card">
        <div className="card-header"><span style={{ fontSize: 20 }}>💬</span><strong>Ask About Your Document</strong></div>
        <div className="card-body">
          {!docInfo && (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <div className="empty-state-icon">📄</div>
              <h3>No document loaded</h3>
              <p>Upload a PDF on the left to start asking questions</p>
            </div>
          )}

          {docInfo && (
            <>
              <ErrorBanner message={askError} onDismiss={() => setAskError('')} />
              <div className="form-group">
                <label>Your Question</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. What are the main conclusions of Chapter 2?"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
                />
              </div>
              <button className="btn btn-primary" onClick={ask} disabled={askLoading || !question.trim()}>
                {askLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Searching…</> : '🔍 Ask AI'}
              </button>

              {askLoading && <div style={{ marginTop: 16 }}><LoadingDots label="Searching your document…" /></div>}

              {answer && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Answer
                  </div>
                  <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--border)' }}>
                    <MarkdownView content={answer} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

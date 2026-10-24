# AI Study Assistant Agent
## College Mini-Project Report

**Department of Computer Science and Engineering**  
**Academic Year: 2025–26**  
**Project Category: Mini-Project (Final Year)**

---

## Table of Contents

1. Abstract  
2. Introduction  
3. Problem Statement  
4. Objectives  
5. Existing Systems  
6. Proposed System  
7. System Architecture  
8. Technology Stack  
9. Implementation  
10. Testing  
11. Results and Observations  
12. Limitations  
13. Conclusion  
14. Future Work  
15. References  

---

## 1. Abstract

The AI Study Assistant Agent is a full-stack web application that provides students with an intelligent, AI-powered academic companion. Built using React (Vite) for the frontend and FastAPI (Python) for the backend, the system integrates Google Gemini AI to deliver five core learning tools: an interactive AI tutor, a structured notes generator, a multiple-choice quiz generator with scoring, a personalised study planner, and a PDF document question-answering system.

The backend implements a controlled agent architecture that routes user tasks to appropriate AI tools, validates inputs and outputs, and handles errors gracefully. The system is designed to be deployed to cloud platforms (Render) and is suitable for demonstration at the engineering college viva level.

---

## 2. Introduction

The rapid growth of large language models (LLMs) has opened new possibilities for personalised education. Traditional study tools — textbooks, static notes, flashcard apps — do not adapt to a student's level, topic, or schedule. AI-powered systems can generate customised content on demand, engage in dialogue, and ground responses in uploaded study material.

This project leverages the Google Gemini AI API and a modern web stack to build a practical, deployable study assistant that college students can use for their daily academic needs.

---

## 3. Problem Statement

Students preparing for examinations face several challenges:

- Difficulty finding clear, level-appropriate explanations for complex topics.
- Time spent creating notes and practice questions manually.
- Lack of a structured study schedule based on their specific exam dates and available time.
- Inability to quickly extract relevant information from dense PDF textbooks or notes.

No single, free, integrated tool addresses all these needs with AI assistance.

---

## 4. Objectives

1. Build an AI-powered chat tutor that maintains conversation context.
2. Generate structured, markdown-formatted study notes for any topic and difficulty level.
3. Create multiple-choice quizzes with validated structure, scoring, and explanations.
4. Generate day-by-day study plans based on subjects, available hours, and exam dates.
5. Enable grounded question-answering over uploaded PDF study materials.
6. Deploy a working, accessible system on free cloud infrastructure.

---

## 5. Existing Systems

| System | Limitation |
|---|---|
| ChatGPT (web) | General purpose; no study-specific tools; no document upload for free users |
| Quizlet | No AI note generation; limited AI features on free tier |
| Notion AI | Paid add-on; requires manual note taking; no quiz or planner |
| Google NotebookLM | Document Q&A only; no quiz/planner; limited free usage |
| Custom study apps | Usually static; no personalised AI generation |

**Gap**: No free, integrated tool combines an AI tutor, notes generator, quiz engine, planner, and PDF Q&A in a single deployable web application.

---

## 6. Proposed System

The AI Study Assistant Agent provides:

- **AI Tutor**: Multi-turn conversational academic support using Gemini.
- **Notes Generator**: Configurable structured notes with headings, examples, and revision questions.
- **Quiz Generator**: Validated MCQ generation with hidden answers during the quiz and explanations after submission.
- **Study Planner**: Practical daily schedule generation with tables and tips.
- **Document Q&A**: Secure PDF extraction, keyword-based retrieval, and grounded AI answering.

The system uses a controlled agent architecture on the backend that routes tasks to the appropriate service, validates all AI output (especially JSON), and handles errors without exposing internal details.

---

## 7. System Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend (Vite)              │
│  Dashboard | AI Tutor | Notes | Quiz | Planner | Docs│
└────────────────────┬─────────────────────────────────┘
                     │ REST API (JSON / multipart)
┌────────────────────▼─────────────────────────────────┐
│              FastAPI Backend (Python)                 │
│                                                      │
│  ┌─────────────┐   ┌──────────────────────────────┐  │
│  │ API Routes  │──▶│     Agent Controller         │  │
│  │ /api/chat   │   │  (routes tasks to services)  │  │
│  │ /api/notes  │   └──────────────┬───────────────┘  │
│  │ /api/quizzes│                  │                  │
│  │ /api/planner│   ┌──────────────▼───────────────┐  │
│  │ /api/docs   │   │     Gemini Service           │  │
│  └─────────────┘   │  (chat/notes/quiz/plan/doc)  │  │
│                    └──────────────┬───────────────┘  │
│  ┌─────────────┐                  │                  │
│  │  Document   │   ┌──────────────▼───────────────┐  │
│  │  Service    │   │   Google Gemini API           │  │
│  │  (PyMuPDF)  │   │   gemini-1.5-flash            │  │
│  └─────────────┘   └──────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Controlled routing**: The agent controller uses explicit `if/else` routing — it never executes AI-generated code.
- **JSON validation**: Quiz JSON returned by Gemini is parsed, validated, and rejected if malformed.
- **Keyword retrieval**: Document chunks are scored by keyword overlap with the question (no external vector DB required for free hosting).
- **Bounded inputs**: All API inputs are length-limited via Pydantic validators.
- **Secret isolation**: The Gemini API key lives exclusively in the backend environment and never appears in responses, logs, or VITE_ variables.

---

## 8. Technology Stack

| Component | Technology | Version |
|---|---|---|
| Frontend framework | React | 18 |
| Frontend build | Vite | 6 |
| Routing | React Router DOM | 6 |
| Markdown rendering | react-markdown + remark-gfm | — |
| Backend framework | FastAPI | 0.115 |
| ASGI server | Uvicorn | 0.32 |
| AI SDK | google-genai | 0.8 |
| AI model | Gemini 1.5 Flash | — |
| PDF extraction | PyMuPDF | 1.24 |
| Validation | Pydantic v2 | 2.10 |
| Settings | pydantic-settings | 2.6 |
| Testing | pytest + TestClient | 8.3 |
| Deployment | Render.com | Free tier |
| Version control | Git + GitHub | — |

---

## 9. Implementation

### 9.1 Backend Module Structure

```
backend/app/
├── main.py           — FastAPI app, CORS middleware, router registration
├── config.py         — pydantic-settings (env vars with defaults)
├── api/
│   ├── health.py     — GET /health, GET /api/health
│   ├── chat.py       — POST /api/chat
│   ├── notes.py      — POST /api/notes/generate
│   ├── quizzes.py    — POST /api/quizzes/generate
│   ├── planner.py    — POST /api/planner/generate
│   └── documents.py  — POST /api/documents/upload, POST /api/documents/ask
├── services/
│   ├── gemini_service.py    — Gemini client, chat/notes/quiz/plan/doc functions
│   ├── document_service.py  — PDF extraction (PyMuPDF), chunking, retrieval
│   └── agent_service.py     — StudyAgent controller
├── schemas/
│   ├── chat.py, notes.py, quiz.py, planner.py
└── core/
    └── security.py   — input sanitisation utilities
```

### 9.2 Key Implementation Details

**Quiz JSON Validation** (`gemini_service.py`): The model is prompted to return a strict JSON array. The `_parse_quiz_json` function strips markdown fences, parses JSON, checks the array length, and validates required fields and option counts. An invalid response raises a `ValueError` caught by the route handler and returned as HTTP 422.

**PDF RAG** (`document_service.py`): PyMuPDF extracts text page-by-page. Text is chunked at paragraph boundaries (~1,500 chars). On question, each chunk is scored by keyword overlap with the question words. Top chunks are passed to Gemini as context. The system prompt instructs Gemini to answer only from document content.

**CORS**: Configured with a single allowed origin from `FRONTEND_ORIGIN` environment variable, not a wildcard.

**Error handling**: A global FastAPI exception handler catches unhandled exceptions and returns a generic 500 without stack traces. Gemini errors are translated to 429/503/504/502 based on the error message.

---

## 10. Testing

### 10.1 Unit and Integration Tests (Mocked)

Tests are located in `backend/tests/`. All Gemini API calls are mocked using `unittest.mock.patch`.

| Test File | Tests |
|---|---|
| `test_health.py` | Root and API health endpoints |
| `test_chat.py` | Chat input validation, success, history, secret isolation |
| `test_notes.py` | Notes input validation, difficulty enum, success |
| `test_quiz.py` | Quiz validation, question count limits, success |
| `test_planner.py` | Date validation (past, invalid format, future), success |
| `test_documents.py` | File type rejection, size limit, valid upload, unknown doc, empty question |
| `test_security.py` | CORS header, no API key in response, missing key → 503 |

All tests pass without consuming any Gemini API quota.

### 10.2 Running Tests

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest tests/ -v
```

### 10.3 Manual Frontend Testing

Verify each page loads, forms validate, loading states show, and error messages display for network failures.

---

## 11. Results and Observations

The application successfully:
- Responds to academic questions through the AI Tutor chat interface with conversation context.
- Generates structured markdown notes with appropriate sections for any topic and difficulty level.
- Creates validated multiple-choice quizzes, hides answers before submission, scores the quiz, and displays explanations.
- Produces practical study plans formatted as markdown tables with day-by-day schedules.
- Extracts text from uploaded PDFs and answers questions grounded in document content.

All unit tests pass with mocked Gemini responses. The backend's Swagger UI at `/docs` allows interactive API testing.

> **Note**: Screenshots and deployment URLs will be populated after actual deployment to Render.

---

## 12. Limitations

1. **Scanned PDFs**: PyMuPDF cannot extract text from image-only (scanned) PDFs. OCR is not implemented.
2. **Ephemeral document storage**: Uploaded PDFs are held in server memory and lost on restart.
3. **No persistent history**: Conversation history is maintained only for the current browser session.
4. **Free tier rate limits**: Gemini free tier has request rate limits (~15 RPM). Heavy usage may trigger 429 errors.
5. **Render free tier sleep**: The backend sleeps after 15 minutes of inactivity, adding ~30 seconds to the first request.
6. **Keyword retrieval**: Document retrieval uses simple keyword overlap, not semantic vector search, which may miss relevant chunks.

---

## 13. Conclusion

The AI Study Assistant Agent demonstrates a complete, deployable AI application using modern web technologies and the Google Gemini API. The project implements a controlled agent architecture that routes educational tasks to appropriate services, validates AI outputs, and handles failures gracefully. The system meets the stated objectives and provides a practical demonstration of LLM integration in an educational context.

---

## 14. Future Work

1. **OCR support** using Tesseract or Google Vision AI for scanned PDFs.
2. **Vector search** using a lightweight embedding model for better document retrieval.
3. **User authentication** and persistent conversation history using Firebase or Supabase.
4. **Flashcard generation** from notes, with spaced-repetition scheduling.
5. **Voice interface** using Web Speech API for hands-free interaction.
6. **Progress tracking** across study sessions.
7. **Collaborative study rooms** for group learning.

---

## 15. References

1. Google Gemini API Documentation — https://ai.google.dev/gemini-api/docs
2. google-genai Python SDK — https://github.com/googleapis/python-genai
3. FastAPI Documentation — https://fastapi.tiangolo.com
4. React Documentation — https://react.dev
5. Vite Documentation — https://vitejs.dev
6. PyMuPDF Documentation — https://pymupdf.readthedocs.io
7. Pydantic v2 Documentation — https://docs.pydantic.dev
8. Render Deployment Documentation — https://render.com/docs
9. Retrieval-Augmented Generation (RAG) — Lewis et al., 2020. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." NeurIPS 2020.
10. React Router DOM — https://reactrouter.com

# Skill-Bridge — Design Documentation

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Vite Dev (5173)│     │Express (3001)│
│  (React SPA) │     │   Frontend      │────▶│  /api/ai     │──▶ Gemini API
└─────────────┘     └─────────────────┘     └──────────────┘
      │                                            │
      ▼                                       .env (API key)
  localStorage
  (user data)
```

### Frontend (React SPA)
- **React 18** with functional components and hooks
- **React Router v6** for client-side routing
- **React Context + useReducer** for global state
- **localStorage** for persistence across sessions

### Backend (Express)
- Minimal proxy server — single `/api/ai` POST endpoint
- Forwards prompts to Gemini, with an automated fallback to OpenAI, and finally a rule-based mock response.
- Keeps API keys server-side (`.env`)

## AI Integration Design

Each AI feature follows a **dual-mode pattern**:

1. **AI Mode**: Frontend sends user data → Express proxies to Gemini → structured JSON response
2. **Fallback Mode**: When AI fails or is toggled off, a rule-based algorithm provides equivalent (though less nuanced) functionality

A centralized `aiService.js` tracks availability with retry logic (2 retries before marking unavailable).

### Fallback Request Flow (Example: Resume Parsing)

```text
        User clicks "Parse Resume"
               │
               ▼
         parseResume(text) 
               │
               ├─ Is AI forced offline?  ──YES──▶  extractSkillsFallback(text)  ──▶ Returns offline mode
               │
               ├─ Is aiService.isAvailable()?  ─NO─▶  extractSkillsFallback(text)  ──▶ Returns offline mode
               │
               ▼ (YES, try AI)
         extractSkillsWithAI(text)
               │
               ├─ Calls fetch("/api/ai")
               │
               ├─ Server returns error?  ──▶  fetch throws error
               │                              aiService.retryCount++
               │                              After fails → aiService.available = false
               │                              ──▶ Falls back to extractSkillsFallback()
               │
               ▼ (Success!)
         Parse JSON response
               │
               ├─ JSON parse fails?  ──▶  extractSkillsFallback(text)
               │
               ▼ (All good!)
         Return AI result
```

## Data Model

```
userProfile: { skills[], experience[], education, projects[], targetRole, resumeText }
gapResults: { readinessScore, matchedSkills[], missingSkills[], radarData[], summary }
roadmap: { items[], completedIds[] }
interviewHistory: [{ id, date, type, difficulty, avgScore, questions }]
```

## Key Design Decisions

1. **No database** — localStorage is sufficient for single-user prototype
2. **Synthetic data baked in** — 12 roles, 60 courses, 50 questions committed as JSON
3. **Synonym-aware matching** — 50+ skill synonyms enable accurate offline gap analysis
4. **Dark-mode-first** — Glassmorphism design with CSS custom properties

## Future Enhancements

- PDF parsing for real resume upload
- User authentication and cloud sync
- Real job board API integration
- Spaced repetition for interview practice
- Mentor dashboard for guiding mentees

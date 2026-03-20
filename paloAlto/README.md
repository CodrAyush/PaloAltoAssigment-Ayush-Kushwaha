# Skill-Bridge Career Navigator

A career navigation platform that compares your skills against job descriptions, generates personalized learning roadmaps, and provides AI-powered mock interview practice.

## Problem Statement

Students and early-career professionals face a "skills gap" between academic knowledge and job requirements. This platform bridges that gap with AI-powered analysis and actionable learning paths.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Recharts, Lucide Icons |
| Backend | Express.js (Dual AI Proxy with cascading fallback) |
| AI | Google Gemini 2.0 Flash → OpenAI gpt-4o-mini |
| Styling | Vanilla CSS (dark-mode, glassmorphism) |
| Testing | Vitest |
| State | React Context + localStorage persistence |

## Features

- **Resume Parser**: Paste resume text → AI extracts skills, experience, education
- **Gap Analysis Dashboard**: Radar charts comparing your skills vs. role requirements
- **Dynamic Learning Roadmap**: Phased course recommendations with progress tracking
- **Mock Interview**: AI-generated Q&A with answer evaluation and scoring
- **AI Fallback**: Every feature works offline using keyword matching and curated data
- **Data Persistence**: All progress saved to localStorage

## Quality & Input Validation

The application meets strict basic quality requirements with defensive programming and clear error messaging:

- **Profile Input validations:**
  - Empty parse attempt → *"Please paste your resume text"*
  - Invalid file upload → *"Only .txt files are supported"*
  - No matching skills → *"Add at least one skill before continuing"*
  - Missing Target Role → *"Select a target role"*
- **Mock Interview validations:**
  - Submit button explicitly disabled if textarea is empty.
- **Global Error Handling:**
  - Any failed AI request triggers a global toast notification explaining what happened (e.g., *"Failed to evaluate answer"* or *"AI mode disabled - Falling back to local data"*).

## Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend server (terminal 1)
npm run server

# Start frontend (terminal 2)
npm run dev
```

Works without an API key in **offline/fallback mode**.

## Running Tests

```bash
npm test
```

## Synthetic Data

- `data/jobs.json` — 12 job roles with required/preferred skills
- `data/courses.json` — 60 courses and certifications
- `data/questions.json` — 50 interview questions

## AI Fallback Strategy

| Feature | AI Mode | Offline Fallback |
|---------|---------|-----------------|
| Resume Parser | Gemini extraction | Regex + keyword dictionary |
| Gap Analysis | Semantic matching | Fuzzy match + synonyms |
| Roadmap | Personalized ordering | Prerequisite sorting |
| Interview | Dynamic Q&A | Static question bank |

## Design Decisions

1. Client-side state via localStorage — sufficient for prototype
2. Express proxy for API key security (`.env`)
3. 50+ skill synonym dictionary for offline accuracy
4. Recharts for radar chart React integration
5. No auth — focused on core value proposition

## Future Enhancements

- PDF resume parsing, user accounts, real job board APIs, progress analytics, mentor dashboard

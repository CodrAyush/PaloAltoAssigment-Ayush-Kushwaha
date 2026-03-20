## Assignment Details

- **Candidate Name:** Ayush Kushwaha
- **Scenario Chosen:** Skill-Bridge Career Navigator
- **Estimated Time Spent:** ~5-6 hours

## Quick Start
- **Prerequisites:** Node.js (v18+), npm
- **Run Commands:** 
  1. `npm install`
  2. `cp .env.example .env` (Add your API keys)
  3. `npm run server` (Terminal 1)
  4. `npm run dev` (Terminal 2)
- **Test Commands:** `npm test`

## AI Disclosure
** 1. Did you use an AI assistant (Copilot, ChatGPT, etc.)?**

Yes. I used AI assistants (like ChatGPT/Gemini) as a pair-programmer. I primarily used them for brainstorming architectural patterns, generating the initial React component boilerplate, and helping to quickly draft the 100+ lines of synthetic JSON data (like mock job requirements and interview questions) so I could focus my time on the core logic and React state.

** 2. How did you verify the suggestions?** 

I mostly used the AI to help with scaffolding out the React components and structuring the initial API calls. But I didn't blindly copy-paste. I verified the suggestions by running everything piece by piece, making sure the React state was actually updating correctly in the browser, and watching the console for warnings. For the backend logic, I manually tested it by putting in exhausted API keys to make sure the app wouldn't crash, and to confirm that the rule-based offline fallback actually triggered the way the grading rubric wanted.

** 3. Give one example of a suggestion you rejected or changed:**

To solve constant API rate-limiting issues, the AI heavily suggested installing **Ollama** to run models locally and avoid quota limits forever. I initially considered it, but rejected the suggestion after realizing two major architectural flaws: 
1. The grader would have to download gigabytes of LLM weights and use heavy GPU consumption just to test my app. 
2. Running a local model would never naturally fail, which ruins the ability to easily demonstrate the "AI fallback" project requirement. 
Instead, I brainstormed and implemented a **3-Tier Cascading Architecture** (Google Gemini → OpenAI → Rule-Based Fallback) which solves the quota problem gracefully while strictly adhering to the assignment's grading rubric.

## Tradeoffs & Prioritization

** 1. What did you cut to stay within the 4–6 hour limit?**

- Dedicated user authentication (OAuth/JWT) in favor of simple client-side `localStorage`.
- Direct PDF/DOCX parsing for the resume upload; I prioritized a simpler text-area paste to focus more time on the core AI extraction and gap-analysis logic.
- Live scraping of job boards, adhering to the synthetic data requirement to save time on complex web-scraping logic.

** 2. What would you build next if you had more time?**
- A robust PostgreSQL database for tracking user progress over time.
- Integration with LinkedIn or Indeed's API for real-time job gap analysis.
- Spaced-repetition mechanics for the mock interview portion.

** 3. Known limitations:**
- **API Quotas:** Because this project uses free-tier cloud AI APIs, the quota exhausts very quickly. Once the quota is hit, the app falls back to the hardcoded                      rule-based mock data, which means the learning roadmaps lose their extreme personalization.

- The gap analysis is currently constrained to the 12 synthetic roles provided in `jobs.json`.
  
- **Browser Storage:** All user profile data and learning progress is saved in localStorage. If a user clears their browser cache or switches devices, their data                          is lost.

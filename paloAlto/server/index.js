import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Validate API keys on startup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let genAI = null;
let openai = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini API key loaded');
} else {
  console.warn('⚠️  No valid GEMINI_API_KEY found.');
}

if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log('✅ OpenAI API key loaded');
} else {
  console.warn('⚠️  No valid OPENAI_API_KEY found.');
}

if (!genAI && !openai) {
  console.warn('⚠️  Both AI keys are missing. Application will run in Rule-Based Fallback mode only.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ai: !!genAI || !!openai,
    timestamp: new Date().toISOString(),
  });
});

// AI endpoint
app.post('/api/ai', async (req, res) => {
  const { prompt, maxTokens = 2048, temperature = 0.7 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // TIER 1: Try Gemini
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      });
      const result = await model.generateContent(prompt);
      return res.json({ result: result.response.text() });
    } catch (geminiError) {
      console.error('Tier 1 (Gemini) failed:', geminiError.message);
      // Fall through to Tier 2
    }
  }

  // TIER 2: Try OpenAI
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      });
      return res.json({ result: completion.choices[0].message.content });
    } catch (openaiError) {
      console.error('Tier 2 (OpenAI) failed:', openaiError.message);
      // Fall through to Tier 3
    }
  }

  // TIER 3: Rule-Based Fallback
  console.warn('Tier 3 (Rule-Based Fallback) returning mock data.');
  
  const fallbackText = `**[Rule-Based Fallback Engaged]**
It appears our AI cloud services are currently unavailable. Based on standard industry patterns, here is a general analysis:

- **Missing Skills Highlighted**: Cloud Platforms (AWS/Azure/GCP), CI/CD pipelines (GitHub Actions/Jenkins).
- **Suggested Learning Roadmap**:
  1. Learn core cloud infrastructure (1-2 weeks).
  2. Build a dockerized application (1 week).
  3. Deploy using automated GitHub Actions (1 week).
- **Recommended Action**: Start with free resources like FreeCodeCamp or AWS Skill Builder.

*(This is a static response demonstrating the required fallback capability).*`;

  return res.json({ result: fallbackText });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 AI endpoint: POST http://localhost:${PORT}/api/ai`);
});

import aiService from './aiService';
import questionsData from '../../data/questions.json';

// === FALLBACK: Static question bank ===
export function getQuestionsFallback(skills, type = 'Technical', difficulty = 'Medium', count = 5) {
  let filtered = [...questionsData];

  // Filter by type
  if (type !== 'All') {
    filtered = filtered.filter(q => q.type === type);
  }

  // Filter by difficulty
  if (difficulty !== 'All') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // Prioritize skill-relevant questions
  const skillLower = skills.map(s => s.toLowerCase());
  const relevant = filtered.filter(q =>
    skillLower.includes(q.skill.toLowerCase()) || q.skill === 'General'
  );
  const other = filtered.filter(q =>
    !skillLower.includes(q.skill.toLowerCase()) && q.skill !== 'General'
  );

  // Mix: mostly relevant, fill with general
  const pool = [...relevant, ...other];

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count).map((q, idx) => ({
    ...q,
    index: idx + 1,
  }));
}

// === AI-POWERED: Generate questions ===
export async function getQuestionsWithAI(skills, type, difficulty, count = 5) {
  const prompt = `Generate ${count} ${type} interview questions for a candidate with these skills: ${skills.join(', ')}.
Difficulty: ${difficulty}.

Return ONLY valid JSON array (no markdown fencing):
[
  {
    "question": "Question text",
    "skill": "Related Skill",
    "difficulty": "${difficulty}",
    "type": "${type}",
    "hint": "A helpful hint for the candidate"
  }
]

Make questions specific and practical, testing real-world knowledge.`;

  const result = await aiService.call(prompt, { temperature: 0.7 });

  if (result.success) {
    try {
      const cleaned = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          ...q,
          id: `ai-${Date.now()}-${idx}`,
          index: idx + 1,
        }));
      }
    } catch (e) {
      console.warn('Failed to parse AI questions, falling back:', e);
    }
  }

  return getQuestionsFallback(skills, type, difficulty, count);
}

// === AI-POWERED: Evaluate answer ===
export async function evaluateAnswer(question, answer) {
  if (!aiService.isAvailable() || !answer.trim()) {
    return evaluateAnswerFallback(answer);
  }

  const prompt = `You are a technical interviewer. Evaluate this answer. Return ONLY valid JSON (no markdown fencing).

Question: "${question.question}"
Skill: ${question.skill}
Candidate Answer: "${answer}"

Return JSON:
{
  "score": 7,
  "maxScore": 10,
  "feedback": "2-3 sentence constructive feedback",
  "strengths": ["What they got right"],
  "improvements": ["What they could improve"]
}`;

  const result = await aiService.call(prompt, { temperature: 0.4 });

  if (result.success) {
    try {
      const cleaned = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse AI evaluation, falling back:', e);
    }
  }

  return evaluateAnswerFallback(answer);
}

function evaluateAnswerFallback(answer) {
  const words = answer.trim().split(/\s+/).length;
  let score;
  let feedback;

  if (words < 10) {
    score = 3;
    feedback = 'Your answer is too brief. Try to provide more detail with specific examples.';
  } else if (words < 30) {
    score = 5;
    feedback = 'Decent start! Consider expanding with concrete examples and technical details.';
  } else if (words < 80) {
    score = 7;
    feedback = 'Good answer with reasonable detail. Could be improved with real-world examples.';
  } else {
    score = 8;
    feedback = 'Comprehensive answer! Make sure to stay focused on the key points.';
  }

  return {
    score,
    maxScore: 10,
    feedback,
    strengths: words >= 30 ? ['Provided sufficient detail'] : [],
    improvements: words < 30 ? ['Expand your answer with more specifics'] : ['Add real-world examples'],
  };
}

// Main exports
export async function getInterviewQuestions(skills, type = 'Technical', difficulty = 'Medium', count = 5, forceOffline = false) {
  if (forceOffline || !aiService.isAvailable()) {
    return { questions: getQuestionsFallback(skills, type, difficulty, count), mode: 'offline' };
  }

  const questions = await getQuestionsWithAI(skills, type, difficulty, count);
  return { questions, mode: 'ai' };
}

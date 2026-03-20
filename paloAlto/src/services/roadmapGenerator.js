import aiService from './aiService';
import coursesData from '../../data/courses.json';
import { findMatchingSkill } from '../data/skillsSynonyms';

// === FALLBACK: Rule-based roadmap generation ===
export function generateRoadmapFallback(missingSkills, preferences = {}) {
  const { maxCost = 'all', maxDuration = 'all' } = preferences;

  // Find courses for each missing skill
  const roadmapItems = [];
  const usedCourseIds = new Set();

  // Priority: required skills first, then preferred
  const sortedSkills = [...missingSkills].sort((a, b) => {
    if (a.importance === 'required' && b.importance !== 'required') return -1;
    if (b.importance === 'required' && a.importance !== 'required') return 1;
    return 0;
  });

  for (const { skill, importance } of sortedSkills) {
    // Find matching courses
    let courses = coursesData.filter(c => {
      if (usedCourseIds.has(c.id)) return false;
      const match = findMatchingSkill(skill, [c.skill]);
      return match || c.skill.toLowerCase() === skill.toLowerCase();
    });

    // Apply cost filter
    if (maxCost === 'free') {
      courses = courses.filter(c => c.cost === 'Free');
    }

    // Sort: free first, then by difficulty (beginner → advanced)
    const diffOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
    courses.sort((a, b) => {
      if (a.cost === 'Free' && b.cost !== 'Free') return -1;
      if (b.cost === 'Free' && a.cost !== 'Free') return 1;
      return (diffOrder[a.difficulty] || 1) - (diffOrder[b.difficulty] || 1);
    });

    // Take top course for each skill
    if (courses.length > 0) {
      const course = courses[0];
      usedCourseIds.add(course.id);
      roadmapItems.push({
        ...course,
        targetSkill: skill,
        importance,
        phase: importance === 'required' ? getPhase(roadmapItems.length, 'required') : getPhase(roadmapItems.length, 'preferred'),
      });
    }
  }

  return roadmapItems;
}

function getPhase(index, importance) {
  if (importance === 'required') {
    if (index < 3) return 'Phase 1: Foundation (Month 1)';
    if (index < 6) return 'Phase 2: Core Skills (Month 2)';
    return 'Phase 3: Advanced (Month 3)';
  }
  return 'Phase 4: Optional Enhancements';
}

// === AI-POWERED: Gemini roadmap ===
export async function generateRoadmapWithAI(missingSkills, userSkills, targetRole) {
  const availableCourses = coursesData.map(c => ({
    id: c.id,
    title: c.title,
    skill: c.skill,
    duration: c.duration,
    cost: c.cost,
    difficulty: c.difficulty,
    provider: c.provider,
  }));

  const prompt = `You are a career advisor. Create a learning roadmap for the candidate. Return ONLY valid JSON (no markdown fencing).

Current Skills: ${JSON.stringify(userSkills)}
Target Role: ${targetRole}
Missing Skills: ${JSON.stringify(missingSkills.map(s => s.skill))}

Available Courses (choose from these):
${JSON.stringify(availableCourses.slice(0, 40), null, 0)}

Return JSON array, ordered by learning sequence:
[
  {
    "courseId": "c001",
    "phase": "Phase 1: Foundation (Month 1)",
    "reason": "Why this course first"
  }
]

Rules:
- Order courses logically (prerequisites first)
- Group into 3-4 phases over 3-4 months
- Prioritize required skill gaps over preferred
- Include 8-15 courses total`;

  const result = await aiService.call(prompt, { temperature: 0.5 });

  if (result.success) {
    try {
      const cleaned = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const roadmapItems = [];
      for (const item of parsed) {
        const course = coursesData.find(c => c.id === item.courseId);
        if (course) {
          const missing = missingSkills.find(m => m.skill.toLowerCase() === course.skill.toLowerCase());
          roadmapItems.push({
            ...course,
            targetSkill: course.skill,
            importance: missing?.importance || 'preferred',
            phase: item.phase || 'Unphased',
            aiReason: item.reason,
          });
        }
      }

      if (roadmapItems.length > 0) return roadmapItems;
    } catch (e) {
      console.warn('Failed to parse AI roadmap, falling back:', e);
    }
  }

  return generateRoadmapFallback(missingSkills);
}

// Main export
export async function generateRoadmap(missingSkills, userSkills = [], targetRole = '', forceOffline = false) {
  if (forceOffline || !aiService.isAvailable()) {
    return { items: generateRoadmapFallback(missingSkills), mode: 'offline' };
  }

  const items = await generateRoadmapWithAI(missingSkills, userSkills, targetRole);
  return { items, mode: 'ai' };
}

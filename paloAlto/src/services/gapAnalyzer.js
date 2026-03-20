import aiService from './aiService';
import { findMatchingSkill } from '../data/skillsSynonyms';
import jobsData from '../../data/jobs.json';

// === FALLBACK: Keyword matching + synonym-based gap analysis ===
export function analyzeGapFallback(userSkills, targetRoleId) {
  const role = jobsData.find(j => j.id === targetRoleId);
  if (!role) return null;

  const matchedSkills = [];
  const missingSkills = [];
  const partialSkills = [];

  for (const reqSkill of role.requiredSkills) {
    const match = findMatchingSkill(reqSkill, userSkills);
    if (match) {
      matchedSkills.push({ skill: reqSkill, userSkill: match, score: 100 });
    } else {
      missingSkills.push({ skill: reqSkill, importance: 'required' });
    }
  }

  for (const prefSkill of role.preferredSkills) {
    const match = findMatchingSkill(prefSkill, userSkills);
    if (match) {
      partialSkills.push({ skill: prefSkill, userSkill: match, score: 75 });
    } else {
      missingSkills.push({ skill: prefSkill, importance: 'preferred' });
    }
  }

  const totalRequired = role.requiredSkills.length;
  const matchedRequired = matchedSkills.length;
  const readinessScore = Math.round((matchedRequired / totalRequired) * 100);

  // Generate category scores for radar chart
  const categories = {};
  [...role.requiredSkills, ...role.preferredSkills].forEach(skill => {
    const cat = categorizeSkill(skill);
    if (!categories[cat]) categories[cat] = { total: 0, matched: 0 };
    categories[cat].total++;
    const isMatched = [...matchedSkills, ...partialSkills].find(m => m.skill === skill);
    if (isMatched) categories[cat].matched++;
  });

  const radarData = Object.entries(categories).map(([name, data]) => ({
    category: name,
    userScore: Math.round((data.matched / data.total) * 100),
    requiredScore: 100,
  }));

  const summary = readinessScore >= 80
    ? `Great match! You have ${matchedRequired}/${totalRequired} required skills for ${role.title}. Focus on the remaining gaps to become a strong candidate.`
    : readinessScore >= 50
    ? `Good progress! You have ${matchedRequired}/${totalRequired} required skills. Prioritize learning the missing required skills to strengthen your profile.`
    : `You're at the beginning of your journey toward ${role.title}. Start by building foundational skills in the required areas.`;

  return {
    role,
    readinessScore,
    matchedSkills,
    missingSkills,
    partialSkills,
    radarData,
    summary,
    totalRequired,
    matchedRequired,
  };
}

function categorizeSkill(skill) {
  const categories = {
    'Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'R', 'Kotlin', 'Swift', 'Bash', 'PHP'],
    'Frontend': ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'Next.js', 'Tailwind CSS', 'Responsive Design', 'Accessibility', 'Webpack', 'Storybook'],
    'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'REST APIs', 'GraphQL', 'Microservices', 'gRPC'],
    'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'Ansible', 'Linux', 'Monitoring', 'Helm', 'CloudFormation', 'IAM', 'Serverless', 'Networking'],
    'Data & ML': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP', 'Computer Vision', 'Statistics', 'Data Visualization', 'Spark', 'Hadoop', 'Kafka', 'Airflow', 'Data Modeling', 'ETL', 'Data Warehousing', 'Jupyter', 'Feature Engineering', 'MLOps', 'A/B Testing'],
    'Database': ['SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB'],
    'Security': ['Network Security', 'Penetration Testing', 'Incident Response', 'SIEM', 'Encryption', 'Compliance', 'Risk Assessment', 'Vulnerability Assessment', 'Firewalls', 'OWASP'],
    'Tools & Process': ['Git', 'Agile', 'Scrum', 'Testing', 'System Design', 'Figma', 'User Research'],
  };

  for (const [cat, skills] of Object.entries(categories)) {
    if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) return cat;
  }
  return 'Other';
}

// === AI-POWERED: Gemini-based gap analysis ===
export async function analyzeGapWithAI(userSkills, targetRoleId) {
  const role = jobsData.find(j => j.id === targetRoleId);
  if (!role) return null;

  const prompt = `You are a career advisor. Analyze the skill gap between a candidate and a job role. Return ONLY valid JSON (no markdown fencing).

Candidate Skills: ${JSON.stringify(userSkills)}

Target Role: ${role.title}
Required Skills: ${JSON.stringify(role.requiredSkills)}
Preferred Skills: ${JSON.stringify(role.preferredSkills)}

Return JSON in this exact format:
{
  "readinessScore": 65,
  "summary": "A 2-3 sentence assessment of the candidate's readiness",
  "matchedSkills": [{"skill": "React", "score": 100}],
  "missingSkills": [{"skill": "Docker", "importance": "required"}],
  "partialSkills": [{"skill": "GraphQL", "score": 50}]
}

Be realistic. Consider synonyms and related skills when matching.`;

  const result = await aiService.call(prompt, { temperature: 0.3 });

  if (result.success) {
    try {
      const cleaned = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Build radar data from results
      const allSkills = [...role.requiredSkills, ...role.preferredSkills];
      const categories = {};
      allSkills.forEach(skill => {
        const cat = categorizeSkill(skill);
        if (!categories[cat]) categories[cat] = { total: 0, matched: 0 };
        categories[cat].total++;
        const isMatched = [...(parsed.matchedSkills || []), ...(parsed.partialSkills || [])].find(m => m.skill === skill);
        if (isMatched) categories[cat].matched++;
      });

      const radarData = Object.entries(categories).map(([name, data]) => ({
        category: name,
        userScore: Math.round((data.matched / data.total) * 100),
        requiredScore: 100,
      }));

      return {
        role,
        readinessScore: parsed.readinessScore || 0,
        matchedSkills: parsed.matchedSkills || [],
        missingSkills: parsed.missingSkills || [],
        partialSkills: parsed.partialSkills || [],
        radarData,
        summary: parsed.summary || '',
        totalRequired: role.requiredSkills.length,
        matchedRequired: (parsed.matchedSkills || []).filter(m =>
          role.requiredSkills.some(r => r.toLowerCase() === m.skill.toLowerCase())
        ).length,
      };
    } catch (e) {
      console.warn('Failed to parse AI gap analysis, falling back:', e);
    }
  }

  return analyzeGapFallback(userSkills, targetRoleId);
}

// Main export
export async function analyzeGap(userSkills, targetRoleId, forceOffline = false) {
  if (forceOffline || !aiService.isAvailable()) {
    return { ...analyzeGapFallback(userSkills, targetRoleId), mode: 'offline' };
  }

  const result = await analyzeGapWithAI(userSkills, targetRoleId);
  return { ...result, mode: result ? 'ai' : 'fallback' };
}

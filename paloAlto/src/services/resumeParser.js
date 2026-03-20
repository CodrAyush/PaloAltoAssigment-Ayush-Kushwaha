import aiService from './aiService';
import { normalizeSkill } from '../data/skillsSynonyms';

// Known skills dictionary for fallback extraction
const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Sass',
  'SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'AWS', 'Azure', 'GCP', 'Firebase',
  'Git', 'Linux', 'Bash', 'CI/CD', 'REST APIs', 'GraphQL', 'gRPC',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Pandas', 'NumPy', 'Scikit-learn', 'R', 'Spark', 'Hadoop', 'Kafka', 'Airflow',
  'Statistics', 'Data Visualization', 'Jupyter',
  'Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing',
  'Agile', 'Scrum', 'Microservices', 'System Design', 'Data Structures', 'Algorithms',
  'Network Security', 'Penetration Testing', 'Incident Response', 'SIEM', 'Encryption',
  'React Native', 'Flutter', 'Responsive Design', 'Accessibility', 'Testing',
  'Webpack', 'Vite', 'Monitoring', 'Prometheus', 'Grafana',
  'Product Strategy', 'A/B Testing', 'Stakeholder Management',
  'CloudFormation', 'IAM', 'Networking', 'Helm', 'Serverless',
  'Data Modeling', 'ETL', 'Data Warehousing',
  'Compliance', 'Risk Assessment', 'Vulnerability Assessment', 'Firewalls',
  'Communication', 'Roadmap Planning', 'KPI Tracking',
];

// === FALLBACK: Regex-based skill extraction ===
export function extractSkillsFallback(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { skills: [], experience: [], education: '', projects: [] };
  }

  const normalizedText = text.toLowerCase();
  const foundSkills = [];

  for (const skill of KNOWN_SKILLS) {
    const normalizedSkill = normalizeSkill(skill);
    // Word boundary matching
    const regex = new RegExp(`\\b${normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.push(skill);
    }
  }

  // Extract experience (looking for patterns like "3 years", "5+ years")
  const experience = [];
  const expRegex = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience\s+)?(?:in\s+|with\s+)?([a-zA-Z\s.+#]+)/gi;
  let match;
  while ((match = expRegex.exec(text)) !== null) {
    experience.push({ years: parseInt(match[1]), area: match[2].trim() });
  }

  // Extract education
  const eduPatterns = [
    /(?:bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?)[\s.]*(?:in\s+)?([a-zA-Z\s]+)/gi,
    /(?:computer science|information technology|software engineering|data science|electrical engineering|mathematics)/gi,
  ];
  let education = '';
  for (const pattern of eduPatterns) {
    const eduMatch = pattern.exec(text);
    if (eduMatch) {
      education = eduMatch[0].trim();
      break;
    }
  }

  // Extract project-like sections
  const projects = [];
  const projRegex = /(?:project[s]?|built|developed|created|implemented)[\s:]*([^\n.]+)/gi;
  while ((match = projRegex.exec(text)) !== null) {
    const proj = match[1].trim();
    if (proj.length > 5 && proj.length < 200) {
      projects.push(proj);
    }
  }

  return {
    skills: [...new Set(foundSkills)],
    experience: experience.slice(0, 10),
    education,
    projects: projects.slice(0, 5),
  };
}

// === AI-POWERED: Gemini-based extraction ===
export async function extractSkillsWithAI(text) {
  const prompt = `Analyze this resume text and extract structured data. Return ONLY valid JSON (no markdown fencing).

Resume:
"""
${text}
"""

Return JSON in this exact format:
{
  "skills": ["Skill1", "Skill2"],
  "experience": [{"years": 3, "area": "Backend Development"}],
  "education": "B.Tech in Computer Science",
  "projects": ["Project description 1", "Project description 2"]
}

Rules:
- Skills should be specific technologies/tools (e.g. "React", "AWS", "Docker"), not generic terms
- Extract up to 20 most relevant skills
- Experience should list years and area of work
- Keep project descriptions concise (under 100 characters)`;

  const result = await aiService.call(prompt, { temperature: 0.3 });

  if (result.success) {
    try {
      const cleaned = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: parsed.education || '',
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      };
    } catch (e) {
      console.warn('Failed to parse AI response, falling back:', e);
      return extractSkillsFallback(text);
    }
  }

  return extractSkillsFallback(text);
}

// Main export — tries AI first, falls back
export async function parseResume(text, forceOffline = false) {
  if (forceOffline || !aiService.isAvailable()) {
    return { ...extractSkillsFallback(text), mode: 'offline' };
  }

  const result = await extractSkillsWithAI(text);
  if (result.skills.length > 0) {
    return { ...result, mode: 'ai' };
  }

  return { ...extractSkillsFallback(text), mode: 'fallback' };
}

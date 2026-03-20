import { describe, it, expect } from 'vitest';
import { extractSkillsFallback } from '../services/resumeParser';

describe('Resume Parser (Fallback Mode)', () => {
  // Happy path: valid resume with known skills
  it('should extract skills from a valid resume text', () => {
    const resumeText = `
      John Doe — Software Engineer
      
      Experience:
      - 3 years of experience in React and Node.js
      - Built RESTful APIs using Express and PostgreSQL
      - Deployed applications using Docker and AWS
      
      Education:
      B.Tech in Computer Science from IIT Delhi
      
      Skills: JavaScript, TypeScript, Python, Git, Linux, CI/CD
      
      Projects:
      - Built a real-time chat application using WebSockets
      - Developed an e-commerce platform with React and Node.js
    `;

    const result = extractSkillsFallback(resumeText);

    // Should extract multiple known skills
    expect(result.skills).toBeInstanceOf(Array);
    expect(result.skills.length).toBeGreaterThan(5);

    // Should match specific skills
    expect(result.skills).toContain('React');
    expect(result.skills).toContain('JavaScript');
    expect(result.skills).toContain('Docker');
    expect(result.skills).toContain('AWS');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('Git');

    // Should extract education
    expect(result.education).toBeTruthy();

    // Should return arrays for all fields
    expect(result.experience).toBeInstanceOf(Array);
    expect(result.projects).toBeInstanceOf(Array);
  });

  // Edge case: empty or garbage input
  it('should handle empty or invalid input gracefully', () => {
    // Empty string
    const empty = extractSkillsFallback('');
    expect(empty.skills).toEqual([]);
    expect(empty.experience).toEqual([]);
    expect(empty.education).toBe('');
    expect(empty.projects).toEqual([]);

    // Null/undefined
    const nullResult = extractSkillsFallback(null);
    expect(nullResult.skills).toEqual([]);

    // Random garbage text
    const garbage = extractSkillsFallback('asdjkfh 12345 !@#$% no real skills here xyzzy');
    expect(garbage.skills).toEqual([]);
    expect(garbage.experience).toEqual([]);
  });
});

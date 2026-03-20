import { describe, it, expect } from 'vitest';
import { normalizeSkill, findMatchingSkill } from '../data/skillsSynonyms';

describe('Skill Synonyms Utility', () => {
  
  describe('normalizeSkill', () => {
    it('should lowercase and trim strings', () => {
      // It should remove spaces and make everything lowercase
      expect(normalizeSkill('  JavaScript  ')).toBe('javascript');
      expect(normalizeSkill('React.JS')).toBe('react.js');
    });
  });

  describe('findMatchingSkill', () => {
    const targetSkills = ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS'];

    // Test 1: Happy Path - Exact Match
    it('should match exact skills regardless of case', () => {
      expect(findMatchingSkill('javascript', targetSkills)).toBe('JavaScript');
      expect(findMatchingSkill('REACT', targetSkills)).toBe('React');
    });

    // Test 2: Happy Path - Synonym Match
    it('should match known synonyms to the target skill', () => {
      expect(findMatchingSkill('js', targetSkills)).toBe('JavaScript');
      expect(findMatchingSkill('k8s', ['Kubernetes'])).toBe('Kubernetes');
      expect(findMatchingSkill('amazon web services', targetSkills)).toBe('AWS');
    });

    // Test 3: Edge Case - Partial Matches
    it('should handle partial string matches', () => {
      // If user types "ReactJS" and target is "React"
      expect(findMatchingSkill('ReactJS', targetSkills)).toBe('React');
    });

    // Test 4: Edge Case - No Match Found
    it('should return null if no match is found', () => {
      expect(findMatchingSkill('Ruby', targetSkills)).toBeNull();
      expect(findMatchingSkill('RandomTech', targetSkills)).toBeNull();
    });
  });
});

import { describe, expect, it } from 'vitest';
import { generateRound, getCorrectSum } from '../../src/lib/problemGenerator';
import { getCategoryById } from '../../src/lib/categories';

describe('generateRound', () => {
  it('returns 10 unique single-digit problems with sums up to 9', () => {
    const { problems } = generateRound('single-digit', 10);
    expect(problems).toHaveLength(10);
    const category = getCategoryById('single-digit');
    const keys = new Set<string>();
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum);
      expect(sum).toBeLessThanOrEqual(category.maxSum);
      const key = [Math.min(p.addendA, p.addendB), Math.max(p.addendA, p.addendB)].join(',');
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });

  it('returns make-10 problems with sums 6-10', () => {
    const { problems } = generateRound('make-10', 10);
    const category = getCategoryById('make-10');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum);
      expect(sum).toBeLessThanOrEqual(category.maxSum);
    }
  });

  it('returns teen-numbers problems with sums 11-20', () => {
    const { problems } = generateRound('teen-numbers', 10);
    const category = getCategoryById('teen-numbers');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum);
      expect(sum).toBeLessThanOrEqual(category.maxSum);
    }
  });
});

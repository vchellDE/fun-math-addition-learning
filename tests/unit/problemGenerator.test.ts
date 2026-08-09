import { describe, expect, it } from 'vitest';
import { generateRound, getCorrectSum } from '../../src/lib/problemGenerator';
import { getCategoryById } from '../../src/lib/categories';

function assertUniquePairs(problems: ReturnType<typeof generateRound>['problems']) {
  const keys = new Set<string>();
  for (const p of problems) {
    const key = [Math.min(p.addendA, p.addendB), Math.max(p.addendA, p.addendB)].join(',');
    expect(keys.has(key)).toBe(false);
    keys.add(key);
  }
}

describe('generateRound', () => {
  it('returns 10 unique single-digit problems with sums up to 9', () => {
    const { problems } = generateRound('single-digit', 10);
    expect(problems).toHaveLength(10);
    const category = getCategoryById('single-digit');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum!);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
    }
    assertUniquePairs(problems);
  });

  it('returns make-10 problems with sums 6-10', () => {
    const { problems } = generateRound('make-10', 10);
    const category = getCategoryById('make-10');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum!);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
    }
  });

  it('returns teen-numbers problems with sums 11-20', () => {
    const { problems } = generateRound('teen-numbers', 10);
    const category = getCategoryById('teen-numbers');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum!);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
    }
  });

  it('returns bigger-sums problems with sums 21-30 and min addend <= 15', () => {
    const { problems } = generateRound('bigger-sums', 10);
    const category = getCategoryById('bigger-sums');
    for (const p of problems) {
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum!);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
      expect(Math.min(p.addendA, p.addendB)).toBeLessThanOrEqual(category.maxSmallerAddend!);
    }
    assertUniquePairs(problems);
  });

  it('returns two-digit-plus-one problems with sums 31-50 and no ones regrouping', () => {
    const { problems } = generateRound('two-digit-plus-one', 10);
    const category = getCategoryById('two-digit-plus-one');
    for (const p of problems) {
      expect(p.addendA).toBeGreaterThanOrEqual(10);
      expect(p.addendB).toBeLessThanOrEqual(9);
      expect((p.addendA % 10) + p.addendB).toBeLessThan(10);
      const sum = getCorrectSum(p);
      expect(sum).toBeGreaterThanOrEqual(category.minSum!);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
    }
    assertUniquePairs(problems);
  });

  it('returns two-digit-friends problems with no regrouping and sum <= 99', () => {
    const { problems } = generateRound('two-digit-friends', 10);
    const category = getCategoryById('two-digit-friends');
    for (const p of problems) {
      expect(p.addendA).toBeGreaterThanOrEqual(10);
      expect(p.addendB).toBeGreaterThanOrEqual(10);
      expect(Math.floor(p.addendA / 10) + Math.floor(p.addendB / 10)).toBeLessThan(10);
      expect((p.addendA % 10) + (p.addendB % 10)).toBeLessThan(10);
      const sum = getCorrectSum(p);
      expect(sum).toBeLessThanOrEqual(category.maxSum!);
    }
    assertUniquePairs(problems);
  });
});

import type { CategoryId, Problem, ProblemCategory } from '../types';
import { getCategoryById, getCategories } from './categories';

export class InvalidCategoryError extends Error {
  constructor(categoryId: string) {
    super(`Unknown category: ${categoryId}`);
    this.name = 'InvalidCategoryError';
  }
}

export class InvalidCountError extends Error {
  constructor(count: number) {
    super(`Invalid count: ${count}`);
    this.name = 'InvalidCountError';
  }
}

/** Normalize pair so (3,4) and (4,3) dedupe to the same key */
function pairKey(a: number, b: number): string {
  return a <= b ? `${a},${b}` : `${b},${a}`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Build pool for uniform-addends profile (v1 categories + bigger-sums) */
function buildUniformAddendsPool(
  category: ProblemCategory,
): Array<{ addendA: number; addendB: number }> {
  const minAddend = category.minAddend ?? 1;
  const maxAddend = category.maxAddend ?? 9;
  const minSum = category.minSum ?? 0;
  const maxSum = category.maxSum ?? Infinity;
  const pool: Array<{ addendA: number; addendB: number }> = [];
  const seen = new Set<string>();

  for (let a = minAddend; a <= maxAddend; a++) {
    for (let b = minAddend; b <= maxAddend; b++) {
      const sum = a + b;
      if (sum < minSum || sum > maxSum) continue;
      if (category.maxSmallerAddend !== undefined && Math.min(a, b) > category.maxSmallerAddend) {
        continue;
      }
      const key = pairKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ addendA: a, addendB: b });
    }
  }

  return pool;
}

/** Build pool for two-digit + single-digit (Expert) */
function buildTwoDigitPlusOnePool(
  category: ProblemCategory,
): Array<{ addendA: number; addendB: number }> {
  const minSum = category.minSum ?? 31;
  const maxSum = category.maxSum ?? 50;
  const pool: Array<{ addendA: number; addendB: number }> = [];
  const seen = new Set<string>();

  for (let a = 10; a <= 49; a++) {
    for (let b = 1; b <= 9; b++) {
      if ((a % 10) + b >= 10) continue;
      const sum = a + b;
      if (sum < minSum || sum > maxSum) continue;
      const key = pairKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ addendA: a, addendB: b });
    }
  }

  return pool;
}

/** Build pool for two-digit + two-digit without regrouping (Champion) */
function buildTwoDigitFriendsPool(
  category: ProblemCategory,
): Array<{ addendA: number; addendB: number }> {
  const maxSum = category.maxSum ?? 99;
  const pool: Array<{ addendA: number; addendB: number }> = [];
  const seen = new Set<string>();

  for (let a = 10; a <= 99; a++) {
    for (let b = 10; b <= 99; b++) {
      if (Math.floor(a / 10) + Math.floor(b / 10) >= 10) continue;
      if ((a % 10) + (b % 10) >= 10) continue;
      const sum = a + b;
      if (sum > maxSum) continue;
      const key = pairKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ addendA: a, addendB: b });
    }
  }

  return pool;
}

function buildCandidatePool(categoryId: CategoryId): Array<{ addendA: number; addendB: number }> {
  const category = getCategoryById(categoryId);

  switch (category.generatorProfile) {
    case 'uniform-addends':
      return buildUniformAddendsPool(category);
    case 'two-digit-plus-one':
      return buildTwoDigitPlusOnePool(category);
    case 'two-digit-friends':
      return buildTwoDigitFriendsPool(category);
    default:
      throw new InvalidCategoryError(categoryId);
  }
}

export interface GenerateRoundResult {
  problems: Problem[];
  categoryId: CategoryId;
}

/**
 * Generate a round of unique addition problems for the given category.
 * Debug: logs pool size when generating (helpful for verifying category bounds).
 */
export function generateRound(categoryId: CategoryId, count = 10): GenerateRoundResult {
  const knownIds = getCategories().map((c) => c.id);
  if (!knownIds.includes(categoryId)) {
    throw new InvalidCategoryError(categoryId);
  }
  if (count < 1) {
    throw new InvalidCountError(count);
  }

  const pool = buildCandidatePool(categoryId);
  // Debug log for development — confirms valid pool per category
  console.debug(`[problemGenerator] category=${categoryId} poolSize=${pool.length} requested=${count}`);

  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));

  const problems: Problem[] = selected.map((p, index) => ({
    id: `p-${index + 1}`,
    addendA: p.addendA,
    addendB: p.addendB,
    categoryId,
  }));

  return { problems, categoryId };
}

export function getCorrectSum(problem: Problem): number {
  return problem.addendA + problem.addendB;
}

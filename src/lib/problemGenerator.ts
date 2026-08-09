import type { CategoryId, Problem } from '../types';
import { getCategoryById } from './categories';

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

/** Build all valid (a,b) pairs for a category */
function buildCandidatePool(categoryId: CategoryId): Array<{ addendA: number; addendB: number }> {
  const category = getCategoryById(categoryId);
  const pool: Array<{ addendA: number; addendB: number }> = [];
  const seen = new Set<string>();

  for (let a = category.minAddend; a <= category.maxAddend; a++) {
    for (let b = category.minAddend; b <= category.maxAddend; b++) {
      const sum = a + b;
      if (sum < category.minSum || sum > category.maxSum) continue;
      const key = pairKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ addendA: a, addendB: b });
    }
  }

  return pool;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
  if (!['single-digit', 'make-10', 'teen-numbers'].includes(categoryId)) {
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

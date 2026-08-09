import type { CategoryId, DifficultyLevel, LevelId, ProblemCategory } from '../types';

// Category config embedded from specs/002-advanced-levels-landing/contracts/category-config.json
const CONFIG = {
  categories: [
    {
      id: 'single-digit' as CategoryId,
      label: 'Single Digit (sums up to 9)',
      levelId: 'simple' as LevelId,
      generatorProfile: 'uniform-addends' as const,
      minAddend: 1,
      maxAddend: 9,
      minSum: 2,
      maxSum: 9,
    },
    {
      id: 'make-10' as CategoryId,
      label: 'Make 10 (sums up to 10)',
      levelId: 'medium' as LevelId,
      generatorProfile: 'uniform-addends' as const,
      minAddend: 1,
      maxAddend: 9,
      minSum: 6,
      maxSum: 10,
    },
    {
      id: 'teen-numbers' as CategoryId,
      label: 'Teen Numbers (sums 11–20)',
      levelId: 'intermediate' as LevelId,
      generatorProfile: 'uniform-addends' as const,
      minAddend: 1,
      maxAddend: 9,
      minSum: 11,
      maxSum: 20,
    },
    {
      id: 'bigger-sums' as CategoryId,
      label: 'Bigger Sums (sums 21–30)',
      levelId: 'advanced' as LevelId,
      generatorProfile: 'uniform-addends' as const,
      minAddend: 6,
      maxAddend: 24,
      minSum: 21,
      maxSum: 30,
      maxSmallerAddend: 15,
    },
    {
      id: 'two-digit-plus-one' as CategoryId,
      label: 'Two-Digit Plus One (sums 31–50)',
      levelId: 'expert' as LevelId,
      generatorProfile: 'two-digit-plus-one' as const,
      minSum: 31,
      maxSum: 50,
    },
    {
      id: 'two-digit-friends' as CategoryId,
      label: 'Two-Digit Friends (sums up to 99)',
      levelId: 'champion' as LevelId,
      generatorProfile: 'two-digit-friends' as const,
      maxSum: 99,
    },
  ],
  levels: [
    {
      id: 'simple' as LevelId,
      label: 'Simple',
      subtitle: 'Sums up to 9',
      defaultCategoryId: 'single-digit' as CategoryId,
    },
    {
      id: 'medium' as LevelId,
      label: 'Medium',
      subtitle: 'Make 10',
      defaultCategoryId: 'make-10' as CategoryId,
    },
    {
      id: 'intermediate' as LevelId,
      label: 'Intermediate',
      subtitle: 'Teen numbers 11–20',
      defaultCategoryId: 'teen-numbers' as CategoryId,
    },
    {
      id: 'advanced' as LevelId,
      label: 'Advanced',
      subtitle: 'Bigger sums 21–30',
      defaultCategoryId: 'bigger-sums' as CategoryId,
    },
    {
      id: 'expert' as LevelId,
      label: 'Expert',
      subtitle: 'Two-digit + one digit',
      defaultCategoryId: 'two-digit-plus-one' as CategoryId,
    },
    {
      id: 'champion' as LevelId,
      label: 'Champion',
      subtitle: 'Two-digit friends',
      defaultCategoryId: 'two-digit-friends' as CategoryId,
      hint: 'Try Intermediate first if this feels hard!',
    },
  ],
};

export function getLevels(): DifficultyLevel[] {
  return CONFIG.levels;
}

export function getCategories(): ProblemCategory[] {
  return CONFIG.categories;
}

export function getCategoryById(categoryId: CategoryId): ProblemCategory {
  const category = CONFIG.categories.find((c) => c.id === categoryId);
  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }
  return category;
}

export function getLevelById(levelId: LevelId): DifficultyLevel {
  const level = CONFIG.levels.find((l) => l.id === levelId);
  if (!level) {
    throw new Error(`Unknown level: ${levelId}`);
  }
  return level;
}

export function getCategoryForLevel(levelId: LevelId): ProblemCategory {
  const level = getLevelById(levelId);
  return getCategoryById(level.defaultCategoryId);
}

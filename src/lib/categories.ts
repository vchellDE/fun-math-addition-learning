import type { CategoryId, DifficultyLevel, LevelId, ProblemCategory } from '../types';

// Category config embedded from specs/001-mental-math-addition/contracts/category-config.json
const CONFIG = {
  categories: [
    {
      id: 'single-digit' as CategoryId,
      label: 'Single Digit (sums up to 9)',
      levelId: 'simple' as LevelId,
      minAddend: 1,
      maxAddend: 9,
      minSum: 2,
      maxSum: 9,
    },
    {
      id: 'make-10' as CategoryId,
      label: 'Make 10 (sums up to 10)',
      levelId: 'medium' as LevelId,
      minAddend: 1,
      maxAddend: 9,
      minSum: 6,
      maxSum: 10,
    },
    {
      id: 'teen-numbers' as CategoryId,
      label: 'Teen Numbers (sums 11–20)',
      levelId: 'intermediate' as LevelId,
      minAddend: 1,
      maxAddend: 9,
      minSum: 11,
      maxSum: 20,
    },
  ],
  levels: [
    { id: 'simple' as LevelId, label: 'Simple', defaultCategoryId: 'single-digit' as CategoryId },
    { id: 'medium' as LevelId, label: 'Medium', defaultCategoryId: 'make-10' as CategoryId },
    {
      id: 'intermediate' as LevelId,
      label: 'Intermediate',
      defaultCategoryId: 'teen-numbers' as CategoryId,
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

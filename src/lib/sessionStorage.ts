import type { CategoryId, LevelId } from '../types';
import { getCategoryById, getLevelById } from './categories';

const STORAGE_KEY_LEVEL = 'mathApp.lastLevelId';
const STORAGE_KEY_CATEGORY = 'mathApp.lastCategoryId';

const DEFAULT_LEVEL: LevelId = 'simple';
const DEFAULT_CATEGORY: CategoryId = 'single-digit';

const VALID_LEVEL_IDS = new Set<LevelId>([
  'simple',
  'medium',
  'intermediate',
  'advanced',
  'expert',
  'champion',
]);

const VALID_CATEGORY_IDS = new Set<CategoryId>([
  'single-digit',
  'make-10',
  'teen-numbers',
  'bigger-sums',
  'two-digit-plus-one',
  'two-digit-friends',
]);

export interface StoredPreferences {
  levelId: LevelId;
  categoryId: CategoryId;
}

/** Coerce unknown stored ids to safe defaults (VR-012) */
function normalizePreferences(
  levelId: string | null,
  categoryId: string | null,
): StoredPreferences {
  const safeLevel =
    levelId && VALID_LEVEL_IDS.has(levelId as LevelId)
      ? (levelId as LevelId)
      : DEFAULT_LEVEL;
  const safeCategory =
    categoryId && VALID_CATEGORY_IDS.has(categoryId as CategoryId)
      ? (categoryId as CategoryId)
      : getLevelById(safeLevel).defaultCategoryId;

  // Debug: log when fallback applied for easier troubleshooting
  if (levelId && levelId !== safeLevel) {
    console.debug(`[sessionStorage] unknown levelId="${levelId}" → "${safeLevel}"`);
  }
  if (categoryId && categoryId !== safeCategory) {
    console.debug(`[sessionStorage] unknown categoryId="${categoryId}" → "${safeCategory}"`);
  }

  // Ensure category still exists in config
  try {
    getCategoryById(safeCategory);
    getLevelById(safeLevel);
  } catch {
    return { levelId: DEFAULT_LEVEL, categoryId: DEFAULT_CATEGORY };
  }

  return { levelId: safeLevel, categoryId: safeCategory };
}

export function savePreferences(levelId: LevelId, categoryId: CategoryId): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_LEVEL, levelId);
    sessionStorage.setItem(STORAGE_KEY_CATEGORY, categoryId);
  } catch {
    // sessionStorage unavailable — ignore silently
    console.debug('[sessionStorage] save failed — storage unavailable');
  }
}

export function loadPreferences(): StoredPreferences | null {
  try {
    const levelId = sessionStorage.getItem(STORAGE_KEY_LEVEL);
    const categoryId = sessionStorage.getItem(STORAGE_KEY_CATEGORY);
    if (!levelId || !categoryId) return null;
    return normalizePreferences(levelId, categoryId);
  } catch {
    console.debug('[sessionStorage] load failed — storage unavailable');
    return null;
  }
}

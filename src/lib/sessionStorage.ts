import type { CategoryId, LevelId } from '../types';

const STORAGE_KEY_LEVEL = 'mathApp.lastLevelId';
const STORAGE_KEY_CATEGORY = 'mathApp.lastCategoryId';

export interface StoredPreferences {
  levelId: LevelId;
  categoryId: CategoryId;
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
    const levelId = sessionStorage.getItem(STORAGE_KEY_LEVEL) as LevelId | null;
    const categoryId = sessionStorage.getItem(STORAGE_KEY_CATEGORY) as CategoryId | null;
    if (!levelId || !categoryId) return null;
    return { levelId, categoryId };
  } catch {
    console.debug('[sessionStorage] load failed — storage unavailable');
    return null;
  }
}

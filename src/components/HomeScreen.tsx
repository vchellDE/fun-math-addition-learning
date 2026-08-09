import { useEffect, useState } from 'react';
import type { CategoryId, LevelId } from '../types';
import { getCategories, getCategoryForLevel, getLevels } from '../lib/categories';
import { loadPreferences, savePreferences } from '../lib/sessionStorage';

interface HomeScreenProps {
  onStart: (levelId: LevelId, categoryId: CategoryId) => void;
}

const DEFAULT_LEVEL: LevelId = 'simple';
const DEFAULT_CATEGORY: CategoryId = 'single-digit';

export function HomeScreen({ onStart }: HomeScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(DEFAULT_LEVEL);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(DEFAULT_CATEGORY);

  const levels = getLevels();
  const categories = getCategories();

  // Restore last-selected level from sessionStorage on mount
  useEffect(() => {
    const stored = loadPreferences();
    if (stored) {
      setSelectedLevel(stored.levelId);
      setSelectedCategory(stored.categoryId);
    }
  }, []);

  const handleLevelSelect = (levelId: LevelId) => {
    setSelectedLevel(levelId);
    const category = getCategoryForLevel(levelId);
    setSelectedCategory(category.id);
    savePreferences(levelId, category.id);
  };

  const handleStart = () => {
    savePreferences(selectedLevel, selectedCategory);
    onStart(selectedLevel, selectedCategory);
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="app-card">
      <h1>Fun Math</h1>
      <p className="category-label">Pick a level, then start!</p>
      <div className="button-group" role="group" aria-label="Difficulty level">
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`btn-level ${selectedLevel === level.id ? 'selected' : ''}`}
            onClick={() => handleLevelSelect(level.id)}
          >
            {level.label}
          </button>
        ))}
      </div>
      {currentCategory && (
        <p className="category-label">{currentCategory.label}</p>
      )}
      <div className="button-group">
        <button type="button" className="btn-primary" onClick={handleStart}>
          Start Practice
        </button>
      </div>
    </div>
  );
}

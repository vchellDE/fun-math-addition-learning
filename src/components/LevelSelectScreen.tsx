import { useEffect, useState } from 'react';
import type { CategoryId, LevelId } from '../types';
import { getCategoryForLevel, getLevels } from '../lib/categories';
import { loadPreferences, savePreferences } from '../lib/sessionStorage';

interface LevelSelectScreenProps {
  onStart: (levelId: LevelId, categoryId: CategoryId) => void;
  onGoHome: () => void;
}

const DEFAULT_LEVEL: LevelId = 'simple';
const DEFAULT_CATEGORY: CategoryId = 'single-digit';

export function LevelSelectScreen({ onStart, onGoHome }: LevelSelectScreenProps) {
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(DEFAULT_LEVEL);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(DEFAULT_CATEGORY);

  const levels = getLevels();

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

  const currentLevel = levels.find((l) => l.id === selectedLevel);

  return (
    <div className="app-card">
      <h1>Pick Your Level</h1>
      <p className="category-label">Choose a level, then start!</p>
      <div className="button-group level-grid" role="group" aria-label="Difficulty level">
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`btn-level ${selectedLevel === level.id ? 'selected' : ''}`}
            onClick={() => handleLevelSelect(level.id)}
          >
            <span className="level-btn-label">{level.label}</span>
            <span className="level-btn-subtitle">{level.subtitle}</span>
          </button>
        ))}
      </div>
      {currentLevel?.hint && selectedLevel === 'champion' && (
        <p className="level-hint">{currentLevel.hint}</p>
      )}
      <div className="button-group">
        <button type="button" className="btn-primary" onClick={handleStart}>
          Start Practice
        </button>
        <button type="button" className="btn-secondary" onClick={onGoHome}>
          Home
        </button>
      </div>
    </div>
  );
}

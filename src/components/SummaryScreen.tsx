import type { SessionSummary } from '../types';

interface SummaryScreenProps {
  summary: SessionSummary;
  onPracticeAgain: () => void;
  onChangeLevel: () => void;
}

function getEncouragement(correct: number, total: number): string {
  const ratio = correct / total;
  if (ratio === 1) return 'Perfect round! You are a math star!';
  if (ratio >= 0.7) return 'Wonderful work! Keep practicing!';
  if (ratio >= 0.4) return 'Nice effort! Try again to beat your score!';
  return 'Good try! Every problem makes you stronger!';
}

export function SummaryScreen({ summary, onPracticeAgain, onChangeLevel }: SummaryScreenProps) {
  return (
    <div className="app-card">
      <h1>All Done!</h1>
      <p className="summary-score">
        You got {summary.correctCount} out of {summary.totalProblems}!
      </p>
      <p className="summary-encouragement">
        {getEncouragement(summary.correctCount, summary.totalProblems)}
      </p>
      <p className="category-label">
        {summary.levelLabel} — {summary.categoryLabel}
      </p>
      <div className="button-group">
        <button type="button" className="btn-primary" onClick={onPracticeAgain}>
          Practice Again
        </button>
        <button type="button" className="btn-secondary" onClick={onChangeLevel}>
          Change Level
        </button>
      </div>
    </div>
  );
}

import { useState, type KeyboardEvent } from 'react';
import type { CategoryId, FeedbackType, LevelId, Problem } from '../types';
import { FeedbackBanner } from './FeedbackBanner';
import { sanitizeNumericInput, validateAnswer } from '../lib/validators';
import { getCategoryById, getLevelById } from '../lib/categories';

interface PracticeScreenProps {
  problem: Problem;
  questionNumber: number;
  totalQuestions: number;
  levelId: LevelId;
  categoryId: CategoryId;
  feedback: FeedbackType;
  correctMessageIndex: number;
  inputLocked: boolean;
  onSubmit: (value: number) => void;
  onEmptySubmit: () => void;
}

export function PracticeScreen({
  problem,
  questionNumber,
  totalQuestions,
  levelId,
  categoryId,
  feedback,
  correctMessageIndex,
  inputLocked,
  onSubmit,
  onEmptySubmit,
}: PracticeScreenProps) {
  const [answer, setAnswer] = useState('');
  const level = getLevelById(levelId);
  const category = getCategoryById(categoryId);

  const handleCheck = () => {
    if (inputLocked) return;
    const result = validateAnswer(answer);
    if (!result.ok) {
      if (result.reason === 'empty') {
        onEmptySubmit();
      }
      return;
    }
    onSubmit(result.value);
    setAnswer('');
  };

  const handleInputChange = (raw: string) => {
    if (inputLocked) return;
    setAnswer(sanitizeNumericInput(raw));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className="app-card">
      <p className="level-badge">
        {level.label} — {category.label}
      </p>
      <p className="progress-label">
        Question {questionNumber} of {totalQuestions}
      </p>
      <p className="problem-display" aria-label={`${problem.addendA} plus ${problem.addendB}`}>
        {problem.addendA} + {problem.addendB} = ?
      </p>
      <input
        className="answer-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={answer}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Your answer"
        disabled={inputLocked}
        autoFocus
      />
      <div className="button-group">
        <button
          type="button"
          className="btn-primary"
          onClick={handleCheck}
          disabled={inputLocked}
        >
          Check
        </button>
      </div>
      <FeedbackBanner
        type={feedback}
        correctAnswer={problem.addendA + problem.addendB}
        messageIndex={correctMessageIndex}
      />
    </div>
  );
}

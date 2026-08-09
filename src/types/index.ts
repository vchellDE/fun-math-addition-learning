export type LevelId = 'simple' | 'medium' | 'intermediate';
export type CategoryId = 'single-digit' | 'make-10' | 'teen-numbers';
export type SessionStatus = 'idle' | 'active' | 'completed';

export interface DifficultyLevel {
  id: LevelId;
  label: string;
  defaultCategoryId: CategoryId;
}

export interface ProblemCategory {
  id: CategoryId;
  label: string;
  levelId: LevelId;
  minAddend: number;
  maxAddend: number;
  minSum: number;
  maxSum: number;
}

export interface Problem {
  id: string;
  addendA: number;
  addendB: number;
  categoryId: CategoryId;
}

export interface AnswerAttempt {
  problemId: string;
  submittedValue: number | null;
  isCorrect: boolean;
  timestamp: number;
}

export interface PracticeSession {
  id: string;
  levelId: LevelId;
  categoryId: CategoryId;
  problems: Problem[];
  attempts: AnswerAttempt[];
  currentIndex: number;
  status: SessionStatus;
  startedAt: number;
  completedAt: number | null;
}

export interface SessionSummary {
  totalProblems: number;
  correctCount: number;
  levelLabel: string;
  categoryLabel: string;
}

export type FeedbackType = 'correct' | 'incorrect' | 'empty' | null;

export type LevelId =
  | 'simple'
  | 'medium'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'champion';

export type CategoryId =
  | 'single-digit'
  | 'make-10'
  | 'teen-numbers'
  | 'bigger-sums'
  | 'two-digit-plus-one'
  | 'two-digit-friends';

export type SessionStatus = 'landing' | 'level-select' | 'active' | 'completed';

export type GeneratorProfile =
  | 'uniform-addends'
  | 'two-digit-plus-one'
  | 'two-digit-friends';

export interface DifficultyLevel {
  id: LevelId;
  label: string;
  subtitle: string;
  defaultCategoryId: CategoryId;
  hint?: string;
}

export interface ProblemCategory {
  id: CategoryId;
  label: string;
  levelId: LevelId;
  generatorProfile: GeneratorProfile;
  minAddend?: number;
  maxAddend?: number;
  minSum?: number;
  maxSum?: number;
  maxSmallerAddend?: number;
}

export interface MathFunFact {
  id: string;
  text: string;
  emoji: string | null;
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

import { useCallback, useState } from 'react';
import type {
  AnswerAttempt,
  CategoryId,
  FeedbackType,
  LevelId,
  PracticeSession,
  SessionStatus,
  SessionSummary,
} from './types';
import { OfflineBanner } from './components/OfflineBanner';
import { HomeScreen } from './components/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { nextCorrectMessageIndex } from './components/FeedbackBanner';
import { getCategoryById, getLevelById } from './lib/categories';
import { generateRound, getCorrectSum } from './lib/problemGenerator';

const ROUND_SIZE = 10;
const FEEDBACK_DELAY_MS = 1500;

type AppScreen = SessionStatus;

function createSession(levelId: LevelId, categoryId: CategoryId): PracticeSession {
  const { problems } = generateRound(categoryId, ROUND_SIZE);
  return {
    id: `session-${Date.now()}`,
    levelId,
    categoryId,
    problems,
    attempts: [],
    currentIndex: 0,
    status: 'active',
    startedAt: Date.now(),
    completedAt: null,
  };
}

function buildSummary(session: PracticeSession): SessionSummary {
  const correctCount = session.attempts.filter((a) => a.isCorrect).length;
  return {
    totalProblems: session.problems.length,
    correctCount,
    levelLabel: getLevelById(session.levelId).label,
    categoryLabel: getCategoryById(session.categoryId).label,
  };
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('idle');
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [correctMessageIndex, setCorrectMessageIndex] = useState(0);
  const [awaitingAdvance, setAwaitingAdvance] = useState(false);
  const [lastSettings, setLastSettings] = useState<{
    levelId: LevelId;
    categoryId: CategoryId;
  }>({ levelId: 'simple', categoryId: 'single-digit' });

  const startPractice = useCallback((levelId: LevelId, categoryId: CategoryId) => {
    // Debug: log session start for state machine tracing
    console.debug(`[App] startPractice level=${levelId} category=${categoryId}`);
    setLastSettings({ levelId, categoryId });
    const newSession = createSession(levelId, categoryId);
    setSession(newSession);
    setSummary(null);
    setFeedback(null);
    setAwaitingAdvance(false);
    setScreen('active');
  }, []);

  const finishSession = useCallback((updatedSession: PracticeSession) => {
    const completed: PracticeSession = {
      ...updatedSession,
      status: 'completed',
      completedAt: Date.now(),
    };
    console.debug(`[App] session completed correct=${completed.attempts.filter((a) => a.isCorrect).length}`);
    setSession(completed);
    setSummary(buildSummary(completed));
    setScreen('completed');
  }, []);

  const advanceAfterFeedback = useCallback(
    (attempt: AnswerAttempt, currentSession: PracticeSession) => {
      const updatedAttempts = [...currentSession.attempts, attempt];
      const nextIndex = currentSession.currentIndex + 1;
      const updatedSession: PracticeSession = {
        ...currentSession,
        attempts: updatedAttempts,
        currentIndex: nextIndex,
      };

      if (nextIndex >= currentSession.problems.length) {
        setTimeout(() => {
          setFeedback(null);
          setAwaitingAdvance(false);
          finishSession(updatedSession);
        }, FEEDBACK_DELAY_MS);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setAwaitingAdvance(false);
          setSession(updatedSession);
        }, FEEDBACK_DELAY_MS);
      }
    },
    [finishSession],
  );

  const handleSubmitAnswer = useCallback(
    (value: number) => {
      if (!session || session.status !== 'active' || awaitingAdvance) return;
      const problem = session.problems[session.currentIndex];
      const isCorrect = value === getCorrectSum(problem);
      const attempt: AnswerAttempt = {
        problemId: problem.id,
        submittedValue: value,
        isCorrect,
        timestamp: Date.now(),
      };

      if (isCorrect) {
        setCorrectMessageIndex((i) => nextCorrectMessageIndex(i));
        setFeedback('correct');
      } else {
        setFeedback('incorrect');
      }

      setAwaitingAdvance(true);
      advanceAfterFeedback(attempt, session);
    },
    [session, awaitingAdvance, advanceAfterFeedback],
  );

  const handleEmptySubmit = useCallback(() => {
    setFeedback('empty');
  }, []);

  const handlePracticeAgain = useCallback(() => {
    startPractice(lastSettings.levelId, lastSettings.categoryId);
  }, [lastSettings, startPractice]);

  const handleChangeLevel = useCallback(() => {
    setSession(null);
    setSummary(null);
    setFeedback(null);
    setAwaitingAdvance(false);
    setScreen('idle');
    console.debug('[App] navigate to idle (change level)');
  }, []);

  return (
    <OfflineBanner>
      {renderScreen()}
    </OfflineBanner>
  );

  function renderScreen() {
  if (screen === 'idle') {
    return <HomeScreen onStart={startPractice} />;
  }

  if (screen === 'active' && session) {
    const problem = session.problems[session.currentIndex];
    return (
      <PracticeScreen
        problem={problem}
        questionNumber={session.currentIndex + 1}
        totalQuestions={session.problems.length}
        levelId={session.levelId}
        categoryId={session.categoryId}
        feedback={feedback}
        correctMessageIndex={correctMessageIndex}
        inputLocked={awaitingAdvance}
        onSubmit={handleSubmitAnswer}
        onEmptySubmit={handleEmptySubmit}
      />
    );
  }

  if (screen === 'completed' && summary) {
    return (
      <SummaryScreen
        summary={summary}
        onPracticeAgain={handlePracticeAgain}
        onChangeLevel={handleChangeLevel}
      />
    );
  }

  return <HomeScreen onStart={startPractice} />;
  }
}

import type { FeedbackType, InputMode } from '../types';

const CORRECT_MESSAGES = ['Great job!', 'Yes!', 'Nice!'];

interface FeedbackBannerProps {
  type: FeedbackType;
  inputMode?: InputMode;
  correctAnswer?: number;
  messageIndex?: number;
}

export function FeedbackBanner({
  type,
  inputMode = 'voice',
  correctAnswer,
  messageIndex = 0,
}: FeedbackBannerProps) {
  if (!type) return null;

  let message: string;
  let className = 'feedback-banner';

  switch (type) {
    case 'correct':
      message = CORRECT_MESSAGES[messageIndex % CORRECT_MESSAGES.length];
      className += ' correct';
      break;
    case 'incorrect':
      message = `Good try! The answer is ${correctAnswer}.`;
      className += ' incorrect';
      break;
    case 'empty':
      message =
        inputMode === 'number-pad'
          ? 'Tap the numbers, then press Check.'
          : 'Hold the button and say your answer.';
      className += ' empty';
      break;
    default:
      return null;
  }

  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  );
}

/** Rotate encouraging messages for correct answers */
export function nextCorrectMessageIndex(current: number): number {
  return (current + 1) % CORRECT_MESSAGES.length;
}

import type { FeedbackType } from '../types';

const CORRECT_MESSAGES = ['Great job!', 'Yes!', 'Nice!'];

interface FeedbackBannerProps {
  type: FeedbackType;
  correctAnswer?: number;
  messageIndex?: number;
}

export function FeedbackBanner({ type, correctAnswer, messageIndex = 0 }: FeedbackBannerProps) {
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
      message = 'Type your answer first.';
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../../src/App';
import type { CategoryId, Problem } from '../../src/types';
import {
  FEEDBACK_DELAY_CORRECT_MS,
  FEEDBACK_DELAY_INCORRECT_MS,
} from '../../src/lib/timingConfig';

const FIXED_PROBLEMS: Problem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `p-${i + 1}`,
  addendA: 1,
  addendB: 1,
  categoryId: 'single-digit' as CategoryId,
}));

vi.mock('../../src/lib/problemGenerator', () => ({
  generateRound: vi.fn(() => ({
    problems: FIXED_PROBLEMS,
    categoryId: 'single-digit',
  })),
  getCorrectSum: (problem: Problem) => problem.addendA + problem.addendB,
  InvalidCategoryError: class InvalidCategoryError extends Error {},
  InvalidCountError: class InvalidCountError extends Error {},
}));

/** Navigate from landing to level-select and start practice */
function startPracticeFromLanding() {
  fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
  fireEvent.click(screen.getByRole('button', { name: /start practice/i }));
}

/** Submit answer via number pad (jsdom has no speech recognition) */
async function submitAnswerDigit(digit: number) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^check$/i })).not.toBeDisabled();
  });
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`digit ${digit}`, 'i') }));
  fireEvent.click(screen.getByRole('button', { name: /^check$/i }));
}

async function submitAnswerTwo() {
  await submitAnswerDigit(2);
}

describe('Practice flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it(
    'completes landing → level-select → practice → summary journey via number pad',
    async () => {
      render(<App />);

      expect(screen.getByText(/welcome to fun math/i)).toBeInTheDocument();
      startPracticeFromLanding();
      expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      for (let i = 1; i <= 10; i++) {
        await submitAnswerTwo();

        if (i < 10) {
          await waitFor(
            () => {
              expect(screen.getByText(`Question ${i + 1} of 10`)).toBeInTheDocument();
            },
            { timeout: 3000 },
          );
        }
      }

      await waitFor(
        () => {
          expect(screen.getByText(/all done/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(screen.getByText(/you got 10 out of 10/i)).toBeInTheDocument();
    },
    25000,
  );

  it('shows gentle prompt when Check is tapped with empty pad', async () => {
    render(<App />);

    startPracticeFromLanding();
    fireEvent.click(screen.getByRole('button', { name: /^check$/i }));

    expect(screen.getByText(/tap the numbers, then press check/i)).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
  });

  describe('feedback advance timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it(`advances to next question after ${FEEDBACK_DELAY_CORRECT_MS}ms on correct answer`, async () => {
      render(<App />);
      startPracticeFromLanding();

      fireEvent.click(screen.getByRole('button', { name: /digit 2/i }));
      fireEvent.click(screen.getByRole('button', { name: /^check$/i }));

      expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(FEEDBACK_DELAY_CORRECT_MS);
      });

      expect(screen.getByText(/question 2 of 10/i)).toBeInTheDocument();
    });

    it(`advances to next question after ${FEEDBACK_DELAY_INCORRECT_MS}ms on incorrect answer`, async () => {
      render(<App />);
      startPracticeFromLanding();

      fireEvent.click(screen.getByRole('button', { name: /digit 3/i }));
      fireEvent.click(screen.getByRole('button', { name: /^check$/i }));

      expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(FEEDBACK_DELAY_INCORRECT_MS);
      });

      expect(screen.getByText(/question 2 of 10/i)).toBeInTheDocument();
    });
  });

  it(
    'Change Level goes to level-select not landing',
    async () => {
      render(<App />);
      startPracticeFromLanding();

      for (let i = 1; i <= 10; i++) {
        await submitAnswerTwo();

        if (i < 10) {
          await waitFor(
            () => {
              expect(screen.getByText(`Question ${i + 1} of 10`)).toBeInTheDocument();
            },
            { timeout: 3000 },
          );
        }
      }

      await waitFor(() => screen.getByText(/all done/i), { timeout: 3000 });
      fireEvent.click(screen.getByRole('button', { name: /change level/i }));

      expect(screen.getByText(/pick your level/i)).toBeInTheDocument();
      expect(screen.queryByText(/welcome to fun math/i)).not.toBeInTheDocument();
    },
    25000,
  );
});

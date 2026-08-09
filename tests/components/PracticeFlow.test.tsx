import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import type { CategoryId, Problem } from '../../src/types';

// Fixed problems so tests can predict correct answers (1+1=2)
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

describe('Practice flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it(
    'completes home → practice → summary journey',
    async () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /start practice/i }));
      expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();

      for (let i = 1; i <= 10; i++) {
        const answerInput = screen.getByLabelText(/your answer/i);
        fireEvent.change(answerInput, { target: { value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: /check/i }));

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

  it('shows gentle prompt when Check is tapped with empty answer', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(screen.getByText(/type your answer first/i)).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
  });
});

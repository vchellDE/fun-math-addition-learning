import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import type { CategoryId, Problem } from '../../src/types';

const FIXED_PROBLEMS: Problem[] = [
  {
    id: 'p-1',
    addendA: 1,
    addendB: 1,
    categoryId: 'single-digit' as CategoryId,
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `p-${i + 2}`,
    addendA: 1,
    addendB: 1,
    categoryId: 'single-digit' as CategoryId,
  })),
];

vi.mock('../../src/lib/problemGenerator', () => ({
  generateRound: vi.fn(() => ({
    problems: FIXED_PROBLEMS,
    categoryId: 'single-digit',
  })),
  getCorrectSum: (problem: Problem) => problem.addendA + problem.addendB,
  InvalidCategoryError: class InvalidCategoryError extends Error {},
  InvalidCountError: class InvalidCountError extends Error {},
}));

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 1;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null =
    null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;

  start() {
    setTimeout(() => {
      this.onresult?.({
        results: { 0: { 0: { transcript: 'two' } } },
      });
      this.onend?.();
    }, 10);
  }

  stop() {
    // start handler fires result
  }

  abort() {}
}

describe('Voice input', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('answerInputMode', 'voice');

    vi.stubGlobal(
      'SpeechRecognition',
      MockSpeechRecognition as unknown as typeof SpeechRecognition,
    );

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('switches from voice to number pad and back to voice', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));

    fireEvent.click(screen.getByRole('button', { name: /allow microphone/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hold to speak your answer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /can't use voice/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /digit 1/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /prefer to speak/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hold to speak your answer/i })).toBeInTheDocument();
    });
  });

  it('shows heard value and auto-confirms voice answer after release', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));

    fireEvent.click(screen.getByRole('button', { name: /allow microphone/i }));

    const speakBtn = await waitFor(() =>
      screen.getByRole('button', { name: /hold to speak your answer/i }),
    );
    fireEvent.pointerDown(speakBtn);
    fireEvent.pointerUp(speakBtn);

    await waitFor(() => {
      expect(screen.getByText(/i heard:/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/checking your answer/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByText(/great job|yes|nice/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});

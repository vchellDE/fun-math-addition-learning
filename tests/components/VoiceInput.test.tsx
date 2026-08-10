import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../../src/App';
import type { CategoryId, Problem } from '../../src/types';
import { AUTO_CONFIRM_DELAY_MS } from '../../src/lib/timingConfig';

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

type MockResult = { [j: number]: { transcript: string } };

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 3;
  onresult: ((event: { results: { [i: number]: MockResult } }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  private alternatives: string[] = ['two'];

  constructor(alternatives: string[] = ['two']) {
    this.alternatives = alternatives;
  }

  start() {
    setTimeout(() => {
      const result = { length: this.alternatives.length } as MockResult & { length: number };
      this.alternatives.forEach((transcript, i) => {
        result[i] = { transcript };
      });
      this.onresult?.({ results: { 0: result } });
      this.onend?.();
    }, 10);
  }

  stop() {
    // start handler fires result
  }

  abort() {}
}

function installMockSpeechRecognition(alternatives: string[] = ['two']) {
  const MockCtor = function (this: MockSpeechRecognition) {
    return new MockSpeechRecognition(alternatives);
  } as unknown as typeof SpeechRecognition;

  vi.stubGlobal('SpeechRecognition', MockCtor);
}

describe('Voice input', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('answerInputMode', 'voice');

    installMockSpeechRecognition();

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

  it('parses first successful alternative from multi-alt STT result', async () => {
    installMockSpeechRecognition(['fifty', 'fifteen', 'two']);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /allow microphone/i }));

    const speakBtn = await waitFor(() =>
      screen.getByRole('button', { name: /hold to speak your answer/i }),
    );
    fireEvent.pointerDown(speakBtn);
    fireEvent.pointerUp(speakBtn);

    // expectedMax=2 for 1+1 — fifty/fifteen filtered out, two wins
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('does not start listening via Space while mic prompt is visible', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /start practice/i }));

    expect(screen.getByRole('button', { name: /allow microphone/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });

    expect(screen.queryByText(/i heard:/i)).not.toBeInTheDocument();
  });

  describe('auto-confirm timing', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it(`auto-confirms after ${AUTO_CONFIRM_DELAY_MS}ms from heard banner`, async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
      fireEvent.click(screen.getByRole('button', { name: /start practice/i }));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /allow microphone/i }));
        await Promise.resolve();
      });

      const speakBtn = await waitFor(() =>
        screen.getByRole('button', { name: /hold to speak your answer/i }),
      );

      fireEvent.pointerDown(speakBtn);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });

      fireEvent.pointerUp(speakBtn);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });

      expect(screen.getByText(/i heard:/i)).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(AUTO_CONFIRM_DELAY_MS);
      });

      expect(screen.getByText(/great job|yes|nice/i)).toBeInTheDocument();
    });
  });
});

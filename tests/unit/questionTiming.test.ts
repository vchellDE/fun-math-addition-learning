import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getQuestionTimingHistory,
  markTiming,
  resetQuestionTiming,
  startQuestionTiming,
} from '../../src/lib/questionTiming';

describe('questionTiming', () => {
  afterEach(() => {
    resetQuestionTiming();
    vi.restoreAllMocks();
  });

  it('tracks load, response, and nextLoad for a question cycle', () => {
    let t = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => t);

    startQuestionTiming(1);
    expect(getQuestionTimingHistory()).toHaveLength(0);

    t = 1500; // user answers after 500ms
    markTiming('answerConfirmed', 7);
    t = 1510;
    markTiming('feedbackShown', 'correct');
    t = 2160; // +650ms feedback delay
    markTiming('nextQuestionVisible');

    const history = getQuestionTimingHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      questionNumber: 1,
      questionLoadMs: 0,
      responseMs: 500,
      nextQuestionLoadMs: 660,
      fullCycleMs: 1160,
    });
  });

  it('measures question load from prior feedback for Q2+', () => {
    let t = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => t);

    startQuestionTiming(1);
    t = 200;
    markTiming('answerConfirmed');
    t = 210;
    markTiming('feedbackShown', 'correct');
    t = 860;
    markTiming('nextQuestionVisible');

    // Q2 becomes visible shortly after advance
    t = 870;
    startQuestionTiming(2);
    t = 1000;
    markTiming('answerConfirmed');
    t = 1010;
    markTiming('feedbackShown', 'incorrect');
    t = 2810;
    markTiming('summaryVisible');

    const history = getQuestionTimingHistory();
    expect(history).toHaveLength(2);
    // Q2 load ≈ feedbackShown(Q1@210) → questionVisible(Q2@870)
    expect(history[1].questionLoadMs).toBe(660);
    expect(history[1].responseMs).toBe(130);
    expect(history[1].nextQuestionLoadMs).toBe(1810);
  });
});

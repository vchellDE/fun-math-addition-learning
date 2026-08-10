import { describe, it, expect } from 'vitest';
import {
  AUTO_CONFIRM_DELAY_MS,
  FEEDBACK_DELAY_CORRECT_MS,
  FEEDBACK_DELAY_INCORRECT_MS,
  FEEDBACK_DELAY_SUMMARY_MS,
  RELEASE_GRACE_MS,
} from '../../src/lib/timingConfig';

describe('timingConfig', () => {
  // VR-020: autoConfirmDelayMs ∈ [250, 500]
  it('AUTO_CONFIRM_DELAY_MS is within VR-020 bounds', () => {
    expect(AUTO_CONFIRM_DELAY_MS).toBeGreaterThanOrEqual(250);
    expect(AUTO_CONFIRM_DELAY_MS).toBeLessThanOrEqual(500);
  });

  // VR-021: feedbackDelayCorrectMs ≤ 1000
  it('FEEDBACK_DELAY_CORRECT_MS satisfies VR-021', () => {
    expect(FEEDBACK_DELAY_CORRECT_MS).toBeLessThanOrEqual(1000);
  });

  // VR-022: feedbackDelayIncorrectMs ≤ 2000
  it('FEEDBACK_DELAY_INCORRECT_MS satisfies VR-022', () => {
    expect(FEEDBACK_DELAY_INCORRECT_MS).toBeLessThanOrEqual(2000);
  });

  // VR-023: releaseGraceMs ∈ [100, 300]
  it('RELEASE_GRACE_MS is within VR-023 bounds', () => {
    expect(RELEASE_GRACE_MS).toBeGreaterThanOrEqual(100);
    expect(RELEASE_GRACE_MS).toBeLessThanOrEqual(300);
  });

  // VR-024: correct-path total fixed delay ≤ 1100 ms
  it('correct-path total delay satisfies VR-024', () => {
    const total = AUTO_CONFIRM_DELAY_MS + FEEDBACK_DELAY_CORRECT_MS;
    expect(total).toBeLessThanOrEqual(1100);
  });

  it('exports expected constant values', () => {
    expect(AUTO_CONFIRM_DELAY_MS).toBe(350);
    expect(FEEDBACK_DELAY_CORRECT_MS).toBe(650);
    expect(FEEDBACK_DELAY_INCORRECT_MS).toBe(1800);
    expect(FEEDBACK_DELAY_SUMMARY_MS).toBe(650);
    expect(RELEASE_GRACE_MS).toBe(150);
  });
});

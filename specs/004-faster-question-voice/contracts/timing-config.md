# Contract: Question Flow Timing

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

## Module: `src/lib/timingConfig.ts`

### Exported constants

```typescript
export const AUTO_CONFIRM_DELAY_MS = 350;
export const FEEDBACK_DELAY_CORRECT_MS = 650;
export const FEEDBACK_DELAY_INCORRECT_MS = 1800;
export const FEEDBACK_DELAY_SUMMARY_MS = 650;
export const RELEASE_GRACE_MS = 150;
```

### Usage

| Constant | Consumer | Trigger |
|----------|----------|---------|
| `AUTO_CONFIRM_DELAY_MS` | `PracticeScreen.tsx` | `heardValue` set → schedule `handleConfirmHeard` |
| `FEEDBACK_DELAY_CORRECT_MS` | `App.tsx` | `feedback === 'correct'` → advance session |
| `FEEDBACK_DELAY_INCORRECT_MS` | `App.tsx` | `feedback === 'incorrect'` → advance session |
| `FEEDBACK_DELAY_SUMMARY_MS` | `App.tsx` | last question answered → `finishSession` |
| `RELEASE_GRACE_MS` | `usePushToTalk.ts` | after `stop()` with no result yet → wait before `onEmpty` |

### Behavioral requirements

| ID | Requirement |
|----|-------------|
| TM-001 | Correct answer: time from `setFeedback('correct')` to `currentIndex + 1` ≤ `FEEDBACK_DELAY_CORRECT_MS` (timer only; excludes prior voice path) |
| TM-002 | Incorrect answer: same interval ≤ `FEEDBACK_DELAY_INCORRECT_MS` |
| TM-003 | Voice path: time from `heardValue` set to `onSubmit` = `AUTO_CONFIRM_DELAY_MS` ± 50 ms |
| TM-004 | Number pad path: no `AUTO_CONFIRM_DELAY_MS`; Check → feedback uses TM-001/TM-002 |
| TM-005 | `empty` feedback does not advance question (unchanged from v3) |
| TM-006 | Removing deprecated `FEEDBACK_DELAY_MS` single constant — replace all references |

### Measurement (manual quickstart)

Log checkpoints:

```text
t0 = listenEnd (Space/button up)
t1 = heardDisplayed
t2 = answerConfirmed (onSubmit)
t3 = feedbackShown
t4 = nextQuestionVisible
```

**Targets**:

- `t2 - t1` ≈ `AUTO_CONFIRM_DELAY_MS`
- `t4 - t2` ≈ `FEEDBACK_DELAY_*` for correct path
- `t4 - t0` < 2000 ms median (SC-004)

## Forbidden

- Per-user timing settings UI
- Skipping feedback entirely on correct answers
- Different auto-confirm delay for Space vs button

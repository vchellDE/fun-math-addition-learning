/**
 * Debug timing tracker for per-question practice flow.
 * Measures: question load → response → next-question load.
 * Logs via console.debug only (not persisted).
 */

export type TimingMarker =
  | 'questionVisible'
  | 'listenStart'
  | 'listenEnd'
  | 'transcriptReceived'
  | 'heardDisplayed'
  | 'answerConfirmed'
  | 'feedbackShown'
  | 'nextQuestionVisible'
  | 'summaryVisible';

export interface QuestionTimingSummary {
  questionNumber: number;
  /** ms from previous advance/feedback until this question painted */
  questionLoadMs: number;
  /** ms from question visible → answer confirmed / pad submit */
  responseMs: number | null;
  /** ms from answer confirmed → next question (or summary) visible */
  nextQuestionLoadMs: number | null;
  /** ms from question visible → next question (full cycle) */
  fullCycleMs: number | null;
}

interface QuestionTimingState {
  questionNumber: number;
  questionLoadMs: number;
  marks: Partial<Record<TimingMarker, number>>;
}

let state: QuestionTimingState | null = null;
/** Timestamp when prior question showed feedback / scheduled advance */
let pendingAdvanceAt: number | null = null;
const history: QuestionTimingSummary[] = [];

function now(): number {
  return performance.now();
}

function delta(from: number | undefined, to: number): number | null {
  if (from === undefined) return null;
  return Math.round(to - from);
}

/** Start (or restart) timing for a question when it becomes visible. */
export function startQuestionTiming(questionNumber: number): void {
  // Skip React StrictMode remount so Q2+ load times stay accurate
  if (state?.questionNumber === questionNumber && state.marks.questionVisible !== undefined) {
    console.debug(`[QuestionTiming] Q${questionNumber} already started — skip remount`);
    return;
  }

  const t = now();
  // Load = time since previous feedback scheduled advance (0 for first question)
  const questionLoadMs =
    pendingAdvanceAt !== null ? Math.round(t - pendingAdvanceAt) : 0;
  pendingAdvanceAt = null;

  state = {
    questionNumber,
    questionLoadMs,
    marks: { questionVisible: t },
  };

  // Debug: question ready — load latency from previous advance
  console.debug(
    `[QuestionTiming] Q${questionNumber} questionVisible | load=${questionLoadMs}ms`,
  );
}

/** Record a named marker and log segment deltas for the current question. */
export function markTiming(
  marker: TimingMarker,
  detail?: string | number | boolean,
): void {
  if (!state) {
    console.debug(`[QuestionTiming] ignore ${marker} — no active question`);
    return;
  }

  const t = now();
  state.marks[marker] = t;

  const q = state.questionNumber;
  const fromVisible = delta(state.marks.questionVisible, t);
  const detailSuffix = detail !== undefined ? ` ${String(detail)}` : '';

  // Debug: marker + elapsed since question became visible
  console.debug(
    `[QuestionTiming] Q${q} ${marker}${detailSuffix} | +${fromVisible ?? '?'}ms since questionVisible`,
  );

  if (marker === 'feedbackShown') {
    // Next question's "load" clock starts when feedback appears
    pendingAdvanceAt = t;
  }

  if (marker === 'nextQuestionVisible' || marker === 'summaryVisible') {
    flushSummary(marker === 'summaryVisible');
  }
}

/** Finalize and log the three headline metrics for the current question. */
function flushSummary(isSummary: boolean): void {
  if (!state) return;

  const m = state.marks;
  const confirmedAt = m.answerConfirmed;
  const endAt = isSummary ? m.summaryVisible : m.nextQuestionVisible;
  const visibleAt = m.questionVisible;

  const summary: QuestionTimingSummary = {
    questionNumber: state.questionNumber,
    questionLoadMs: state.questionLoadMs,
    responseMs:
      confirmedAt !== undefined && visibleAt !== undefined
        ? Math.round(confirmedAt - visibleAt)
        : null,
    nextQuestionLoadMs:
      confirmedAt !== undefined && endAt !== undefined
        ? Math.round(endAt - confirmedAt)
        : null,
    fullCycleMs:
      visibleAt !== undefined && endAt !== undefined
        ? Math.round(endAt - visibleAt)
        : null,
  };

  history.push(summary);

  // Debug: one-line rollup for manual quickstart validation
  console.debug(
    `[QuestionTiming] Q${summary.questionNumber} SUMMARY` +
      ` | load=${summary.questionLoadMs}ms` +
      ` | response=${summary.responseMs ?? 'n/a'}ms` +
      ` | nextLoad=${summary.nextQuestionLoadMs ?? 'n/a'}ms` +
      ` | fullCycle=${summary.fullCycleMs ?? 'n/a'}ms` +
      (isSummary ? ' (→ summary)' : ''),
  );

  console.debug('[QuestionTiming] history', [...history]);
}

/** Reset tracker (e.g. new practice session). */
export function resetQuestionTiming(): void {
  state = null;
  pendingAdvanceAt = null;
  history.length = 0;
  console.debug('[QuestionTiming] reset');
}

/** Test/debug helper — returns copies of recorded summaries. */
export function getQuestionTimingHistory(): QuestionTimingSummary[] {
  return [...history];
}

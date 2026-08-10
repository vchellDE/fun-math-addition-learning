# Research: Faster Question Flow & Voice Recognition Reliability

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

## R1: Root cause of perceived slowness

**Decision**: The ~1 second pause is caused by **stacked fixed delays**, not slow problem generation. Current constants in `App.tsx` (`FEEDBACK_DELAY_MS = 1500`) and `PracticeScreen.tsx` (`AUTO_CONFIRM_DELAY_MS = 750`) add up to **2250 ms** on the voice path before the next question, in addition to speech recognition latency.

**Rationale**: Problem generation is synchronous (`generateRound`); React state updates are immediate. Spec assumptions (line 129) correctly identify the 750 ms heard pause and 1500 ms post-feedback delay as primary contributors.

**Alternatives considered**:
- **Prefetch next problem while feedback shows** — Rejected for v4: round problems are pre-generated; no I/O to hide. Timing tuning is simpler and meets SC-002/SC-004.
- **Remove heard banner entirely** — Rejected: violates FR-003 and User Story 3 transparency.

## R2: Feedback delay strategy

**Decision**: Replace single `FEEDBACK_DELAY_MS` with **path-specific delays** in `App.tsx`:

| Path | Constant | Target | Rationale |
|------|----------|--------|-----------|
| Correct answer | `FEEDBACK_DELAY_CORRECT_MS` | **650 ms** | FR-001: next problem within 1 s of feedback start; leaves room for brief celebration |
| Incorrect answer | `FEEDBACK_DELAY_INCORRECT_MS` | **1800 ms** | FR-012: child reads correction; capped under 2 s after feedback visible |
| Final question → summary | `FEEDBACK_DELAY_SUMMARY_MS` | **650 ms** | Edge case: no blank pause before "All done!" |

**Rationale**: Constitution III (Kid-Friendly) still requires readable incorrect feedback; correct path optimizes for momentum (User Story 1).

**Alternatives considered**:
- **Same 1000 ms for both** — Rejected: fails FR-012 or FR-001 depending on choice.
- **Skip feedback animation** — Rejected: violates Learning Over Decoration principle V.

## R3: Heard-number auto-confirm timing

**Decision**: Reduce `AUTO_CONFIRM_DELAY_MS` from **750 → 350 ms**. Keep auto-scoring (no Check tap) and visible "I heard: N" banner.

**Rationale**: 350 ms is long enough for a child to notice the number (User Story 3) while contributing ~400 ms savings toward SC-004. `HeardAnswerBanner` already shows "Checking your answer…" during the pause.

**Alternatives considered**:
- **0 ms instant score** — Rejected: removes confirmation visibility; increases silent mis-score risk.
- **Keep 750 ms** — Rejected: fails SC-002/SC-004 without other compensating changes.

## R4: Speech recognition alternatives

**Decision**: Increase `maxAlternatives` from **1 → 3** in `speechRecognition.ts`. On `onresult`, iterate alternatives in confidence order and return the **first transcript** that `parseSpokenNumber` resolves successfully.

**Rationale**: Web Speech API often returns phonetically similar alternatives (e.g., "fifteen" vs "fifty") in the alternatives list. Parsing each costs microseconds; no new dependencies.

**Alternatives considered**:
- **Cloud STT** — Rejected: spec assumption forbids paid external service; violates Simplicity First.
- **Custom acoustic model** — Rejected: out of scope; browser API only.

## R5: Problem-aware number disambiguation

**Decision**: Extend `parseSpokenNumber` with an optional `ParseSpeechOptions` hint:

```typescript
{ expectedMax?: number }  // typically addendA + addendB upper bound for level, or 99
```

When multiple parse candidates exist (from alternatives or homophone map), prefer the value **≤ expectedMax** that minimizes distance to the problem's plausible answer range. When the current problem sum is known at parse time, pass `expectedMax: addendA + addendB` only for **tie-breaking** between two valid parses (e.g., 15 vs 50), not to bias toward the correct answer.

**Rationale**: Spec edge case: "fifteen" vs "fifty" — prefer the value that fits the problem when unambiguous. Implementation must not cheat scoring; only disambiguate structurally valid numbers.

**Alternatives considered**:
- **Always pick smaller number** — Rejected: wrong for "ninety" vs "nineteen" in some cases.
- **Ignore problem context** — Rejected: leaves common STT confusions unresolved.

## R6: Homophone and STT mis-hearing map

**Decision**: Add a small **transcript normalization map** before word parsing for frequent child-speech / STT confusions:

| Mis-heard token | Canonical |
|-----------------|-----------|
| `fitty`, `fiddy` | `fifty` |
| `fiveteen`, `fifty teen` | `fifteen` |
| `thirtee`, `thirty` (when teen expected) | handled via alternatives + expectedMax |
| `for` (in number context) | `four` |

Apply map during `normalizeTranscript` after lowercasing. Keep list small (< 15 entries) and test-covered.

**Rationale**: FR-005 and FR-007 require tolerance without new UI. Local map is testable and simpler than ML.

**Alternatives considered**:
- **Levenshtein fuzzy match on all words** — Rejected: risk of false positives ("for" → "four" in non-number speech).
- **Phonetic library (soundex)** — Rejected: new dependency; overkill for 0–99.

## R7: Filler and multi-word phrase tolerance

**Decision**: Enhance `normalizeTranscript` to:
1. Strip filler tokens **anywhere** in the phrase (`um`, `uh`, `like`, `it's`, `the answer is`), not only leading prefix.
2. After stripping fillers, re-run digit extraction and word parsing.

**Rationale**: Spec edge case: "the answer is seven" — partially supported today (leading only); children often say "um… seven" mid-phrase.

**Alternatives considered**:
- **NLP sentence parser** — Rejected: violates Simplicity First.

## R8: Space key reliability parity

**Decision**: Harden Space push-to-talk in `usePushToTalk.ts`:
1. Disable Space when `showMicPrompt` is true (modal open) — pass `spaceEnabled: voiceEnabled && !showMicPrompt`.
2. Add **150 ms release grace** after `keyup` before treating as empty if no `onresult` yet (handles fast release + slow STT).
3. Ensure `preventDefault` on Space during practice only when `document.activeElement` is `body` or inside `.app-card` (not when focus is on a link button during mode switch).

**Rationale**: FR-006 and User Story 2 scenario 4 — Space must match on-screen button. Intermittent failures likely from race between `stop()` and `onresult`, and Space firing during mic prompt.

**Alternatives considered**:
- **Separate Space code path** — Rejected: duplicates logic; spec requires identical behavior.
- **Always-on listener without gating** — Rejected: edge case Space during modals.

## R9: Recognition session lifecycle

**Decision**: Keep `continuous: false` push-to-talk model. Add:
- **Abort previous session** on new `pointerdown` if a stale session exists.
- **Reuse permission** — no second `getUserMedia` call (already implemented).
- Log timing milestones: `listenStart`, `listenEnd`, `result`, `autoConfirm`, `feedbackStart`, `advance` for quickstart validation.

**Rationale**: Spec FR-010 forbids new modes; lifecycle fixes address reliability without UX change.

**Alternatives considered**:
- **`continuous: true` with manual end** — Rejected: risk of capturing background noise; harder to test; spec prefers hold-to-release simplicity.

## R10: Testing and measurement

**Decision**:

| Layer | Approach |
|-------|----------|
| Unit | Extend `speechParser.test.ts` with homophones, filler-in-middle, `expectedMax` ties |
| Unit | New `timingConfig.test.ts` or inline tests for delay constants within spec bounds |
| Component | Mock `SpeechRecognition` with multiple alternatives; assert first successful parse |
| Component | `PracticeFlow.test.tsx` — assert advance uses correct delay per feedback type (fake timers) |
| Manual | quickstart FQ-001–FQ-006 with `performance.now()` checkpoints |

**Rationale**: jsdom has no real mic; timer tests prove FR-001/FR-011; manual quickstart proves SC-003 voice accuracy.

**Alternatives considered**:
- **Playwright + fake audio** — Deferred: out of scope for this incremental feature.

## Summary

All technical unknowns resolved. No new npm packages, no new UI controls, no backend. Implementation centers on **timing constants**, **parser hardening with optional problem hints**, **recognition alternatives**, and **Space/lifecycle race fixes**.

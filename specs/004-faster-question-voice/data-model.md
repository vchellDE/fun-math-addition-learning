# Data Model: Faster Question Flow & Voice Recognition Reliability

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

**Extends**: [003 data-model](../003-voice-answer-input/data-model.md) — v3 entities unchanged unless noted.

## Overview

No persistent schema changes. Adds **timing configuration**, **parser disambiguation hints**, and **recognition timing telemetry** (debug-only). Session scoring (`AnswerAttempt`, `PracticeSession`) semantics unchanged.

## New Types

### TimingConfig

Centralized delay constants (module-level in `src/lib/timingConfig.ts`).

| Field | Type | Default | Spec rule |
|-------|------|---------|-----------|
| `autoConfirmDelayMs` | number | `350` | FR-003 — heard banner visible before score |
| `feedbackDelayCorrectMs` | number | `650` | FR-001 — advance within 1 s after correct feedback |
| `feedbackDelayIncorrectMs` | number | `1800` | FR-012 — correction readable, ≤ 2 s |
| `feedbackDelaySummaryMs` | number | `650` | Last question → summary without blank pause |
| `releaseGraceMs` | number | `150` | R8 — wait for late STT result after key/button release |

**Validation**:

| Rule ID | Rule |
|---------|------|
| VR-020 | `autoConfirmDelayMs` ∈ [250, 500] |
| VR-021 | `feedbackDelayCorrectMs` ≤ 1000 |
| VR-022 | `feedbackDelayIncorrectMs` ≤ 2000 |
| VR-023 | `releaseGraceMs` ∈ [100, 300] |

### ParseSpeechOptions

Optional second argument to `parseSpokenNumber`.

| Field | Type | Rules |
|-------|------|-------|
| `expectedMax` | number \| undefined | Upper bound for tie-breaking (e.g., current problem sum or level max); never used to invent a number |

### RecognitionAlternative

Ephemeral structure inside `speechRecognition.ts` (not exported on `AnswerAttempt`).

| Field | Type | Rules |
|-------|------|-------|
| `transcript` | string | From `event.results[0][i].transcript` |
| `confidence` | number | Optional; index order used if missing |

### VoiceTimingMarkers (debug-only)

Logged via `console.debug` during manual quickstart; not stored.

| Marker | When set |
|--------|----------|
| `listenStart` | pointer/Space down |
| `listenEnd` | pointer/Space up |
| `transcriptReceived` | `onresult` fired |
| `heardDisplayed` | `heardValue` set |
| `answerConfirmed` | `onSubmit` called |
| `feedbackShown` | `feedback` set in App |
| `nextQuestionVisible` | `currentIndex` incremented |

## Extended Entities

### VoiceAnswerState (PracticeScreen-local)

| Field | Change | Notes |
|-------|--------|-------|
| `heardValue` | unchanged | Still drives confirming phase |
| `retryUsed` | unchanged | One retry per question (FR-009) |
| `autoConfirmTimerId` | implementation | Uses `TimingConfig.autoConfirmDelayMs` |

### Feedback advance (App.tsx)

| Field | Change | Notes |
|-------|--------|-------|
| `awaitingAdvance` | unchanged | Still locks input during feedback |
| advance delay | **per feedback type** | `correct` → `feedbackDelayCorrectMs`; `incorrect` → `feedbackDelayIncorrectMs`; last question uses `feedbackDelaySummaryMs` |

### ParsedSpeechResult

Unchanged shape. Parser may return `ok: true` for homophone-normalized input; `rawTranscript` preserves original STT text.

## State Transition Updates

### Voice answer flow (timing annotations)

```text
[listening]
  │ release + grace (releaseGraceMs)
  ▼
[processing] ──parse fail──► [idle] + empty/retry prompt
  │ parse ok
  ▼
[confirming] ── autoConfirmDelayMs ──► onSubmit
  ▼
[feedback correct] ── feedbackDelayCorrectMs ──► next question
[feedback incorrect] ── feedbackDelayIncorrectMs ──► next question
```

### Space key gating

```text
spaceEnabled =
  inputMode === 'voice'
  AND micReady
  AND NOT inputLocked
  AND heardValue === null
  AND NOT showMicPrompt
```

## Validation Rules (new)

| Rule ID | Entity | Rule |
|---------|--------|------|
| VR-024 | TimingConfig | Correct-path total fixed delay (`autoConfirm` + `feedbackCorrect`) ≤ 1100 ms |
| VR-025 | ParseSpeechOptions | `expectedMax` only used when ≥ 2 valid candidates |
| VR-026 | Recognition | Try up to 3 alternatives before parse failure |
| VR-027 | Space shortcut | Disabled when mic prompt visible or `inputLocked` |

## Entity Relationship Diagram (v4 addition)

```text
timingConfig ──► App.tsx (feedback delays)
              └──► PracticeScreen (auto-confirm)

Problem (addendA, addendB)
  └── expectedMax hint ──► parseSpokenNumber(transcript, { expectedMax })

speechRecognition (maxAlternatives: 3)
  └── alternatives[] ──► parseSpokenNumber (first ok wins)

VoiceTimingMarkers ──► console.debug (manual validation only)
```

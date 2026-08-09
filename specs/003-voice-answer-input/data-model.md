# Data Model: Voice Answer Input (No Keyboard Typing)

**Feature**: `003-voice-answer-input` | **Date**: 2026-08-09

**Extends**: [002 data-model](../002-advanced-levels-landing/data-model.md) — v2 entities unchanged unless noted.

## Overview

Adds answer-input mode and voice-capture state on the practice screen. Session scoring (`AnswerAttempt`, `PracticeSession`) unchanged — only the path to `submittedValue` differs. No new persistence beyond optional `sessionStorage` for input mode preference.

## New Types

### InputMode

```text
'voice' | 'number-pad'
```

| Value | When used |
|-------|-----------|
| `voice` | Default when `isSpeechRecognitionSupported()` and mic not permanently denied |
| `number-pad` | Mic denied, unsupported browser, or user chose "Use Number Pad Instead" |

**Persistence**: `sessionStorage` key `answerInputMode` — survives page refresh within same tab session; cleared when tab closes.

### VoiceCapturePhase

UI state machine for one answer attempt (not persisted).

```text
idle → listening → processing → confirming → (submit | retry → listening) → idle
```

| Phase | Meaning |
|-------|---------|
| `idle` | Waiting for hold or pad input |
| `listening` | Mic active; child speaking |
| `processing` | Recognition running after release |
| `confirming` | Showing "I heard: N"; awaiting confirm or retry |

### ParsedSpeechResult

| Field | Type | Rules |
|-------|------|-------|
| `ok` | boolean | `true` if a single integer extracted |
| `value` | number | Present when `ok`; 0–99 inclusive |
| `reason` | `'no-number' \| 'ambiguous' \| 'out-of-range'` | Present when `!ok` |
| `rawTranscript` | string | Original recognition text (debug + display) |

### PadEntryState (UI-only)

| Field | Type | Rules |
|-------|------|-------|
| `digits` | string | Sanitized 0–9 only; max length 3 (answers ≤ 99) |
| `displayValue` | string | Same as `digits` or empty |

## Extended Entities

### AnswerAttempt

No schema change. `submittedValue` may now originate from voice or pad:

| Source | How `submittedValue` is set |
|--------|----------------------------|
| Voice | Parsed number after user confirms "That's Right" |
| Pad | `parseInt(digits, 10)` on Check tap |

Optional debug field (implementation): log `inputSource: 'voice' | 'pad'` in `console.debug` only — not stored on entity.

### FeedbackType

Extended usage (type union unchanged):

| Value | Voice trigger | Pad trigger |
|-------|---------------|-------------|
| `correct` | Confirmed heard number matches sum | Check with correct pad value |
| `incorrect` | Confirmed heard number wrong | Check with wrong pad value |
| `empty` | Release without speech / no number parsed | Check with empty pad |
| `null` | Between problems | Between problems |

### PracticeSession

Unchanged fields. Voice feature does not alter `problems`, `attempts`, or `currentIndex` semantics.

## New UI State (PracticeScreen-local)

### VoiceAnswerState

| Field | Type | Rules |
|-------|------|-------|
| `phase` | VoiceCapturePhase | Drives UI visibility |
| `heardValue` | number \| null | Set in `confirming` |
| `rawTranscript` | string | Last recognition text |
| `retryUsed` | boolean | `true` after one Try Again; blocks second retry |
| `listenStartedAt` | number \| null | Timestamp for timeout (5s max hold) |

### MicPermissionState

| Field | Type | Rules |
|-------|------|-------|
| `status` | `'unknown' \| 'prompting' \| 'granted' \| 'denied'` | |
| `showPrompt` | boolean | `true` once per session before first voice capture |

## Validation Rules (new)

| Rule ID | Entity | Rule |
|---------|--------|------|
| VR-013 | Practice UI | No `<input>` or `<textarea>` for answer entry on practice screen |
| VR-014 | PadEntryState | `digits` matches `/^[0-9]{0,3}$/`; parsed value ≤ 99 |
| VR-015 | ParsedSpeechResult | Successful parse yields integer 0–99 |
| VR-016 | VoiceAnswerState | At most one `retryUsed` per problem index |
| VR-017 | InputMode | If speech unsupported, coerce to `number-pad` on session start |
| VR-018 | Voice capture | Recognition disabled when `inputLocked === true` |
| VR-019 | Space shortcut | Only active when `inputMode === 'voice'` and practice screen focused |

## State Transition Diagram

### Voice answer flow

```text
[idle]
  │ pointerdown / Space down
  ▼
[listening] ──timeout 5s──► [idle] + empty prompt
  │ pointerup / Space up
  ▼
[processing] ──parse fail──► [idle] + retry prompt (no score)
  │ parse ok
  ▼
[confirming]
  │ "That's Right" ──► onSubmit(value) ──► [idle]
  │ "Try Again" (if !retryUsed) ──► [listening]
  │ "Try Again" (if retryUsed) ──► blocked
```

### Input mode resolution (session start)

```text
isSpeechRecognitionSupported?
  ├─ no  → number-pad
  └─ yes → read sessionStorage answerInputMode
              ├─ 'number-pad' → number-pad
              └─ missing / 'voice' → voice (show mic prompt on first question)
```

## Entity Relationship Diagram (v3 addition)

```text
PracticeScreen
  ├── InputMode (session / sessionStorage)
  ├── VoiceAnswerState (per question, ephemeral)
  ├── PadEntryState (per question, ephemeral)
  └── onSubmit(number) ──► App.handleAnswer ──► AnswerAttempt

speechParser ◄── transcript ── speechRecognition
```

## sessionStorage Keys (v3)

| Key | Type | Default |
|-----|------|---------|
| `answerInputMode` | InputMode | omitted → `voice` if supported, else `number-pad` |
| `lastLevelId` | LevelId | unchanged from v2 |
| `lastCategoryId` | CategoryId | unchanged from v2 |

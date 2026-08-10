# Quickstart: Faster Question Flow & Voice Recognition Reliability

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

## Prerequisites

- Node.js 20 LTS
- Chrome, Safari, or Edge (HTTPS or `localhost`)
- Microphone for voice scenarios
- Repo root: `fun-math-addition`

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Automated checks

```bash
npm test
```

Expected: all existing tests pass; new parser and timing tests green.

## Manual validation scenarios

### FQ-001 — Correct answer feels snappy (pad path)

**Goal**: SC-002, FR-001, FR-011

1. Start practice → choose number pad if needed
2. Answer 10 problems correctly using pad + Check
3. Use browser devtools → note time from green feedback to next problem

**Pass**: Median gap ≤ 1 s; no extra tap between questions.

### FQ-002 — Voice end-to-end speed (correct path)

**Goal**: SC-004, FR-002

1. Use voice on Simple / single-digit level
2. Hold speak (or Space), say answer, release
3. Repeat 20 correct voice answers; optionally log `[VoiceTiming]` debug markers

**Pass**: Median release → next question < 2 s; child/caregiver reports "quick" (thumbs up).

### FQ-003 — Heard banner still visible (voice)

**Goal**: FR-003, User Story 3

1. Speak a clear answer
2. Watch for "I heard: **N**" before feedback

**Pass**: Number visible ~⅓ second; scoring automatic without Check tap.

### FQ-004 — Incorrect feedback readable

**Goal**: FR-012

1. Submit wrong answer (voice or pad)
2. Read correction showing correct sum

**Pass**: Correction visible ~1.5–2 s before next question; not rushed.

### FQ-005 — Voice recognition accuracy

**Goal**: SC-003, FR-005

**Test set** (quiet room, first attempt each):

| # | Say | Expected heard |
|---|-----|----------------|
| 1–10 | one … ten (words) | 1–10 |
| 11–20 | eleven … twenty | 11–20 |
| 21–25 | seven, twelve, fifteen, twenty one, 8 | matching digits |

Repeat with **Space bar** for items 1, 7, 15, 20.

**Pass**: ≥ 27/30 first-attempt success (90%).

### FQ-006 — Space parity and modal gating

**Goal**: FR-006, edge case Space during modal

1. Reset session; on mic prompt, hold Space → should **not** listen
2. Grant mic; hold Space on question → same behavior as Hold to Speak
3. Speak wrong number once → Try Again via voice

**Pass**: No listen during prompt; Space matches button after grant.

### FQ-007 — Fifteen vs fifty disambiguation

**Goal**: Edge case homophones

1. Pick problem where sum ≤ 20 (e.g., 8 + 7 = 15)
2. Say "fifteen" clearly
3. If misheard as fifty, Try Again once

**Pass**: With v4 parser + alternatives, first attempt shows 15 more often; retry always available.

### FQ-008 — No new UI complexity

**Goal**: SC-005, FR-010

1. Complete round as first-time child (caregiver observes)

**Pass**: Same controls as before — speak, heard banner, try again, pad fallback; no settings.

## Debug timing (optional)

In dev build, filter console for:

```text
[PracticeScreen]
[usePushToTalk]
[speechRecognition]
[App]
```

Compare intervals against [timing-config.md](./contracts/timing-config.md) targets.

## References

- Data model: [data-model.md](./data-model.md)
- Timing contract: [contracts/timing-config.md](./contracts/timing-config.md)
- Parser contract: [contracts/speech-parser.md](./contracts/speech-parser.md)
- Voice contract: [contracts/voice-input.md](./contracts/voice-input.md)

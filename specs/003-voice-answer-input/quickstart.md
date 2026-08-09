# Quickstart: Voice Answer Input (No Keyboard Typing)

**Feature**: `003-voice-answer-input` | **Date**: 2026-08-09

Validation guide for proving v3 works end-to-end after implementation.

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Chrome, Safari, or Edge for voice scenarios (Firefox for pad-only scenario)
- Microphone (built-in or headset) for manual voice tests
- HTTPS or `localhost` (mic requires secure context)

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run tests

```bash
npm test
```

**Expected**:

- All v1/v2 tests pass (updated for number pad)
- `speechParser.test.ts` passes 40+ parse cases
- `VoiceInput.test.tsx` passes with mocked `SpeechRecognition`

## Build for production

```bash
npm run build
npm run preview
```

**Expected**: Practice screen has no text input; pad works in preview.

## Manual validation scenarios

### VS-001: Voice correct answer (User Story 1, SC-002)

1. Open app in Chrome (incognito).
2. Navigate to practice (Let's Practice → Start Practice).
3. Allow microphone when prompted.
4. Hold **Hold to Speak**, say **"two"** for `1 + 1`, release.
5. Confirm **I heard: 2** → tap **That's Right**.

**Pass**: Correct feedback; advances to question 2.

### VS-002: Voice incorrect answer (User Story 1)

1. On a problem, hold speak, say wrong number, release, confirm heard value.

**Pass**: Gentle incorrect feedback; correct sum shown; advances without punishment.

### VS-003: Empty / no speech (User Story 1, edge case)

1. Hold speak button and release without speaking.

**Pass**: "Hold the button and say your answer" (or similar); no score change.

### VS-004: Misheard retry (User Story 2)

1. Hold speak, say **"fifteen"** deliberately unclear OR use a problem where mishear is likely.
2. If wrong number shown, tap **Try Again**, speak clearly, confirm.

**Pass**: One retry allowed; second confirm finalizes attempt.

### VS-005: Number pad fallback (User Story 3, SC-003)

1. Open Chrome settings → block microphone for localhost OR tap **Use Number Pad Instead**.
2. Start practice.
3. Tap digits on pad, tap **Check** for each of 10 questions.

**Pass**: Full round completes; summary shows score; no text keyboard appears.

### VS-006: No text input (FR-001)

1. On practice screen, tap where answer field used to be; press number keys on keyboard.

**Pass**: No text field; number keys do not enter an answer (except Space for voice hold).

### VS-007: Space shortcut (User Story 4)

1. On laptop, focus practice screen.
2. Hold **Space**, speak answer, release.
3. Confirm heard value.

**Pass**: Same behavior as Hold to Speak button.

### VS-008: Input lock during feedback (FR-011)

1. Submit an answer.
2. During feedback banner (1.5s), try speak button and pad.

**Pass**: Controls disabled until next question.

### VS-009: Firefox pad-only (edge case)

1. Open app in Firefox.
2. Start practice.

**Pass**: Number pad shown (or voice unavailable note); session completable.

### VS-010: Champion two-digit voice (FR-004)

1. Select Champion level.
2. For a two-digit sum problem, hold speak, say **"thirty four"** (or correct sum).

**Pass**: Parser accepts compound; scoring correct.

## Automated coverage map

| Spec requirement | Test location |
|------------------|---------------|
| FR-003, FR-004 | `speechParser.test.ts` |
| FR-008, FR-012 | `PracticeFlow.test.tsx` (pad path) |
| FR-002, FR-005, FR-006 | `VoiceInput.test.tsx` (mocked) |
| VR-013 | `PracticeFlow.test.tsx` — `queryByLabelText(/your answer/i)` absent |

## Success criteria checklist

| ID | Manual scenario |
|----|-----------------|
| SC-001 | VS-001, VS-010 in quiet room with child tester |
| SC-002 | VS-001 full 10-question round under 5 min |
| SC-003 | VS-005 |
| SC-004 | Observe child with VS-001 (30s to first voice answer) |
| SC-005 | Parent observation during VS-001/VS-005 |

## Troubleshooting

| Issue | Check |
|-------|-------|
| Mic never prompts | Secure context (https/localhost); browser permissions |
| Always pad mode | `isSpeechRecognitionSupported()` false — expected on Firefox |
| Recognition always empty | Browser mic input level; try headset |
| Tests fail on answer input | Tests should use pad buttons, not `getByLabelText(/your answer/)` |

# Implementation Plan: Voice Answer Input (No Keyboard Typing)

**Branch**: `003-voice-answer-input` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-voice-answer-input/spec.md`

**User confirmation**: Voice-first with on-screen number pad fallback (no free-form keyboard typing).

## Summary

Replace the practice-screen text input with **push-to-talk voice** as the primary answer method and an **on-screen number pad** as fallback when the microphone is unavailable or denied. Children hold "Hold to Speak", say the answer, and release; the app shows what it heard, allows one retry, then scores using the existing feedback loop. Optional **Space** hold mirrors the speak button on laptops. No new npm packages — use the browser Web Speech API and a local number-word parser.

**Technical approach**: Add `speechRecognition.ts` (Web Speech API wrapper), `speechParser.ts` (transcript → number 0–99), `HoldToSpeakButton.tsx`, `NumberPad.tsx`, and `HeardAnswerBanner.tsx`; refactor `PracticeScreen.tsx` to remove `<input>`; extend `App.tsx` with `inputMode` session state; mock speech in Vitest; update `PracticeFlow.test.tsx` to use number pad path.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (unchanged)

**Primary Dependencies**: Vite 6, React 19, Vitest, React Testing Library (no new packages)

**Storage**: In-memory session state; `sessionStorage` key `answerInputMode` (`voice` | `number-pad`) for preference within browser session

**Testing**: Vitest — unit tests for `speechParser.ts`; mocked `SpeechRecognition` for voice hook; RTL tests via number pad fallback (reliable in jsdom); optional manual voice validation per quickstart

**Target Platform**: Modern browsers with HTTPS (or localhost); Chrome, Safari, Edge for voice; Firefox falls back to number pad

**Project Type**: Web application (SPA, frontend-only)

**Performance Goals**: Recognition result displayed within 2s of button release in quiet conditions; number pad tap-to-check unchanged (<100ms client-side)

**Constraints**: No text `<input>` on practice screen; ≤5 colors; encouraging copy only; push-to-talk only (no always-on mic); one Space-key shortcut allowed

**Scale/Scope**: ~4 new components, 2 new lib modules, refactor 1 screen, update tests — practice screen only; landing/level-select/summary unchanged

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Research | Post-Design | Notes |
|-----------|--------------|-------------|-------|
| I. Simplicity First | ✅ PASS | ✅ PASS | Voice + pad replace typing; no backend; no new deps |
| II. Intuitive UI | ✅ PASS | ✅ PASS | One primary action (Hold to Speak); pad is secondary fallback |
| III. Kid-Friendly | ✅ PASS | ✅ PASS | "I heard: N" confirmation; gentle retry; large pad buttons |
| IV. Limited Color Palette | ✅ PASS | ✅ PASS | Reuse existing tokens; speak button uses `--color-primary` |
| V. Learning Over Decoration | ✅ PASS | ✅ PASS | Voice reinforces verbalizing numbers; no extra animations |

**Gate result**: PASS — Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/003-voice-answer-input/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── voice-input.md
│   ├── speech-parser.md
│   └── ui-screens.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (repository root — changes for v3)

```text
src/
├── App.tsx                          # inputMode state; pass to PracticeScreen
├── components/
│   ├── PracticeScreen.tsx           # REFACTOR — remove text input; compose voice + pad
│   ├── HoldToSpeakButton.tsx        # NEW — push-to-talk control
│   ├── NumberPad.tsx                # NEW — 0–9, Clear, Check
│   ├── HeardAnswerBanner.tsx        # NEW — "I heard: N" + Try Again
│   ├── MicPermissionPrompt.tsx      # NEW — first-time mic explanation
│   └── FeedbackBanner.tsx           # Minor — empty prompt copy update
├── lib/
│   ├── speechRecognition.ts         # NEW — Web Speech API wrapper + capability detect
│   ├── speechParser.ts              # NEW — transcript → number 0–99
│   ├── usePushToTalk.ts             # NEW — hook: hold/release, Space shortcut
│   └── validators.ts                # Minor — pad digit assembly helpers
├── types/
│   └── index.ts                     # Extended: InputMode, VoiceAnswerState, FeedbackType
└── styles/
    └── global.css                   # Speak button, pad grid, heard banner styles

tests/
├── unit/
│   ├── speechParser.test.ts         # NEW
│   └── validators.test.ts           # Extended if needed
└── components/
    ├── PracticeFlow.test.tsx        # UPDATE — number pad instead of text input
    └── VoiceInput.test.tsx          # NEW — mocked recognition + pad fallback
```

**Structure Decision**: Incremental extension of existing single-frontend layout. Voice logic isolated in `lib/` for unit testing; UI split into small components per existing patterns.

## Phase 0: Research — Complete

All unknowns resolved in [research.md](./research.md):

- Web Speech API with `webkit` prefix for Safari
- Push-to-talk via `continuous: false`; stop on pointer/key release
- Local `speechParser` for English number words 0–99
- Number pad as fallback when `!isSpeechRecognitionSupported()` or permission denied
- Space key hold mirrors speak button; `preventDefault` on Space during practice
- Vitest mocks for `SpeechRecognition`; RTL tests use pad path

## Phase 1: Design — Complete

| Artifact | Path | Status |
|----------|------|--------|
| Data model | [data-model.md](./data-model.md) | ✅ |
| Voice input contract | [contracts/voice-input.md](./contracts/voice-input.md) | ✅ |
| Speech parser contract | [contracts/speech-parser.md](./contracts/speech-parser.md) | ✅ |
| UI screen contract | [contracts/ui-screens.md](./contracts/ui-screens.md) | ✅ |
| Quickstart validation | [quickstart.md](./quickstart.md) | ✅ |

**Post-design constitution re-check**: PASS (see table above).

## Implementation Phases (for /speckit-tasks)

### Phase A — Types and speech parsing

- Add `InputMode`, `VoiceCapturePhase`, `ParsedSpeechResult` to `src/types/index.ts`
- Implement `speechParser.ts` per [speech-parser.md](./contracts/speech-parser.md)
- Unit tests for words ("seven", "twelve", "twenty one"), digits, and failure cases

### Phase B — Speech recognition wrapper

- Implement `speechRecognition.ts`: capability detection, permission request, start/stop
- Implement `usePushToTalk.ts`: pointer + Space hold lifecycle, timeout (5s), debug logs
- Handle unsupported browser → auto `number-pad` mode

### Phase C — UI components

- `HoldToSpeakButton.tsx` — large button, `aria-pressed` while listening, visual "listening" state
- `NumberPad.tsx` — 3×4 grid, digit display area (read-only text, not `<input>`), Clear + Check
- `HeardAnswerBanner.tsx` — shows parsed number, Try Again (once per problem)
- `MicPermissionPrompt.tsx` — plain-language copy + "Use Number Pad Instead"

### Phase D — Practice screen refactor

- Remove text `<input>` from `PracticeScreen.tsx`
- Wire voice path: hold → recognize → show heard → confirm or retry → `onSubmit`
- Wire pad path: tap digits → Check → `onSubmit`
- Disable all input while `inputLocked` (feedback delay)
- Update `FeedbackBanner` empty copy: "Hold the button and say your answer" / pad equivalent

### Phase E — App integration and tests

- `App.tsx`: track `inputMode`; persist to `sessionStorage`
- Update `PracticeFlow.test.tsx` to use number pad
- Add `VoiceInput.test.tsx` with mocked recognition
- Manual validation per [quickstart.md](./quickstart.md)

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Web Speech API accuracy varies | Show "I heard: N" + one retry; suggest quieter room or pad |
| Safari / webkit prefix drift | Feature-detect both `SpeechRecognition` and `webkitSpeechRecognition` |
| jsdom cannot test real mic | RTL tests use number pad; voice hook tested with mocks |
| Children release button too fast | Minimum hold hint copy; treat empty transcript as retry prompt |
| HTTPS required for mic in production | Document in quickstart; Render static site is HTTPS by default |

## Next Command

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`, then **`/speckit-implement`** to build the feature.

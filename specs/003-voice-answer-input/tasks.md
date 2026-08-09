---
description: "Task list for Voice Answer Input (No Keyboard Typing) feature"
---

# Tasks: Voice Answer Input (No Keyboard Typing)

**Input**: Design documents from `/specs/003-voice-answer-input/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per plan.md — `speechParser.test.ts`, `VoiceInput.test.tsx`, and updated `PracticeFlow.test.tsx` for pad fallback and SC-003 completability without mic.

**Organization**: Tasks grouped by user story (US1–US4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

Single frontend project at repository root: `src/`, `tests/` (extends v2 implementation)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm v2 baseline and design contracts before v3 changes

- [x] T001 Verify v2 baseline passes (`npm install`, `npm test`, `npm run dev`) before starting v3 work
- [x] T002 [P] Confirm design contracts are present under `specs/003-voice-answer-input/contracts/` (`voice-input.md`, `speech-parser.md`, `ui-screens.md`)

**Checkpoint**: Existing v2 app runs and tests pass on current branch

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, speech parser, and Web Speech API wrapper — MUST complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Extend `InputMode`, `VoiceCapturePhase`, and `ParseSpeechResult` types in `src/types/index.ts` per `specs/003-voice-answer-input/data-model.md`
- [x] T004 Implement `parseSpokenNumber()` in `src/lib/speechParser.ts` per `specs/003-voice-answer-input/contracts/speech-parser.md`
- [x] T005 [P] Create `tests/unit/speechParser.test.ts` with 40+ cases (words, digits, compounds, failures) per speech-parser contract
- [x] T006 Implement `isSpeechRecognitionSupported()`, `requestMicrophonePermission()`, and `createRecognitionSession()` in `src/lib/speechRecognition.ts` per `specs/003-voice-answer-input/contracts/voice-input.md`
- [x] T007 Implement `usePushToTalk` hook with pointer hold/release lifecycle and 5s timeout in `src/lib/usePushToTalk.ts` (Space key deferred to US4)
- [x] T008 [P] Add pad digit assembly helpers (`appendPadDigit`, `clearPadDigits`, `parsePadDigits`) in `src/lib/validators.ts` per VR-014

**Checkpoint**: Types compile; `speechParser` and `speechRecognition` unit-testable; hook exposes `speakButtonProps`

---

## Phase 3: User Story 1 - Answer by Voice (Push-to-Talk) (Priority: P1) 🎯 MVP

**Goal**: Child answers by holding "Hold to Speak", saying the sum, and releasing — no text input on practice screen

**Independent Test**: Start practice with mic allowed → hold speak button → say correct answer → release → correct feedback and next problem; no `<input>` visible (VS-001, FR-001)

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `src/components/HoldToSpeakButton.tsx` with label "Hold to Speak", `aria-pressed` while listening, and 48px min touch target per `contracts/ui-screens.md`
- [x] T010 [US1] Refactor `src/components/PracticeScreen.tsx` to remove text `<input>` and wire `HoldToSpeakButton` + `usePushToTalk` → `speechParser` → `onSubmit` per FR-001–FR-003
- [x] T011 [US1] Update empty-input copy in `src/components/FeedbackBanner.tsx` for voice mode ("Hold the button and say your answer") per `contracts/ui-screens.md`
- [x] T012 [P] [US1] Add hold-to-speak button and listening-state styles in `src/styles/global.css` using existing `--color-primary` token only

**Checkpoint**: Voice path scores answers; practice screen has no text field; empty release shows gentle prompt

---

## Phase 4: User Story 2 - See What Was Heard Before Checking (Priority: P1)

**Goal**: After release, show "I heard: N" with confirm and one retry before scoring

**Independent Test**: Speak answer → see heard number → tap "That's Right" to score; tap "Try Again" once to re-record (VS-002, VS-004, FR-005–FR-006)

### Implementation for User Story 2

- [x] T013 [P] [US2] Create `src/components/HeardAnswerBanner.tsx` with "I heard: **N**", "That's Right", and "Try Again" (hidden after retry used) per `contracts/voice-input.md`
- [x] T014 [US2] Add `confirming` phase and one-retry limit (`retryUsed`) to voice flow in `src/components/PracticeScreen.tsx` per `specs/003-voice-answer-input/data-model.md`
- [x] T015 [P] [US2] Add heard-answer banner styles in `src/styles/global.css`

**Checkpoint**: User sees interpreted number before score; exactly one retry per problem; parse failure shows retry prompt without scoring

---

## Phase 5: User Story 3 - Microphone Permission and Fallback Pad (Priority: P2)

**Goal**: Mic permission prompt on first use; number pad fallback when denied or unsupported; full session completable without mic

**Independent Test**: Deny mic or tap "Use Number Pad Instead" → complete 10-question round via pad only → summary shows score (VS-005, SC-003)

### Implementation for User Story 3

- [x] T016 [P] [US3] Create `src/components/NumberPad.tsx` with read-only `<div role="status">` display, digits 0–9, Clear, and Check — no `<input>` per FR-008 and VR-013
- [x] T017 [P] [US3] Create `src/components/MicPermissionPrompt.tsx` with parent-friendly copy and "Allow Microphone" / "Use Number Pad Instead" actions per `contracts/voice-input.md`
- [x] T018 [US3] Add `inputMode` state, `sessionStorage` key `answerInputMode`, and unsupported-browser coercion to `number-pad` in `src/App.tsx`
- [x] T019 [US3] Wire `NumberPad` fallback path and `MicPermissionPrompt` into `src/components/PracticeScreen.tsx`; add "Can't use voice? Tap numbers instead" link
- [x] T020 [P] [US3] Add number pad grid and permission prompt styles in `src/styles/global.css`
- [x] T021 [US3] Update `tests/components/PracticeFlow.test.tsx` to answer via `NumberPad` buttons instead of text input; assert no `getByLabelText(/your answer/i)`

**Checkpoint**: Pad-only sessions work end-to-end; mic denied does not block practice; automated flow test passes

---

## Phase 6: User Story 4 - Optional Single-Key Speak Shortcut (Priority: P3)

**Goal**: Hold Space on laptop mirrors Hold to Speak; number/letter keys do not enter answers

**Independent Test**: On laptop, hold Space → speak → confirm heard value; press digit keys → nothing entered (VS-006, VS-007, FR-009)

### Implementation for User Story 4

- [x] T022 [US4] Add Space `keydown`/`keyup` handlers with `preventDefault` to `src/lib/usePushToTalk.ts` when voice enabled per PT-004
- [x] T023 [US4] Add optional desktop hint "Or hold Spacebar to speak" in `src/components/PracticeScreen.tsx` when `inputMode === 'voice'`

**Checkpoint**: Space hold triggers same voice flow as on-screen button; no keyboard digit entry

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Voice tests, documentation, build validation, and quickstart verification

- [x] T024 [P] Create `tests/components/VoiceInput.test.tsx` with mocked `SpeechRecognition` covering listen → parse → confirm flow
- [x] T025 [P] Update `README.md` with voice-first answer entry and number pad fallback description
- [x] T026 Ensure `inputLocked` disables speak button, pad, and Space handler during feedback delay in `src/components/PracticeScreen.tsx` and `src/lib/usePushToTalk.ts` per FR-011
- [x] T027 Run `npm test` and `npm run build`; resolve TypeScript and build errors
- [x] T028 Execute manual validation scenarios VS-001 through VS-010 in `specs/003-voice-answer-input/quickstart.md` and fix gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phases 3–6)**: Depend on Phase 2 completion
  - Recommended order: US1 → US2 → US3 → US4 (P1 before P2 before P3)
  - US2 depends on US1 voice wiring in `PracticeScreen.tsx`
  - US3 depends on US1 `PracticeScreen` refactor (adds pad alongside voice)
  - US4 depends on US1 `usePushToTalk` integration
- **Polish (Phase 7)**: Depends on US1–US4 completion

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 (P1) | Foundational | MVP — voice push-to-talk; removes text input |
| US2 (P1) | US1 T010 | Adds confirmation banner and retry on existing voice flow |
| US3 (P2) | US1 T010 | Adds pad + mic prompt to refactored practice screen |
| US4 (P3) | US1 T010, T007 | Extends hook with Space shortcut |

### Within Each User Story

- Tasks marked [P] can run in parallel within the story (different files)
- `PracticeScreen.tsx` wiring tasks are sequential within each story
- `speechParser.test.ts` (T005) can run parallel with T006 after T004

### Parallel Opportunities

- **Phase 1**: T002 parallel with T001
- **Phase 2**: T005 and T008 parallel after T004; T006 parallel with T005 after T003
- **Phase 3**: T009 and T012 parallel; T010–T011 sequential
- **Phase 4**: T013 and T015 parallel; T014 after T013
- **Phase 5**: T016, T017, T020 parallel; T018–T019 sequential; T021 after T019
- **Phase 7**: T024, T025 parallel; T027–T028 sequential

---

## Parallel Example: User Story 1

```bash
# Launch components in parallel:
Task T009: "Create src/components/HoldToSpeakButton.tsx"
Task T012: "Add speak button styles in src/styles/global.css"

# Then wire sequentially:
Task T010: "Refactor src/components/PracticeScreen.tsx for voice path"
Task T011: "Update src/components/FeedbackBanner.tsx empty copy"
```

---

## Parallel Example: User Story 3

```bash
# Launch pad and prompt components in parallel:
Task T016: "Create src/components/NumberPad.tsx"
Task T017: "Create src/components/MicPermissionPrompt.tsx"
Task T020: "Add pad styles in src/styles/global.css"

# Then integrate:
Task T018: "Add inputMode in src/App.tsx"
Task T019: "Wire pad and prompt in src/components/PracticeScreen.tsx"
Task T021: "Update tests/components/PracticeFlow.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (voice push-to-talk)
4. Complete Phase 4: User Story 2 (heard confirmation + retry)
5. **STOP and VALIDATE**: Voice round with confirm flow (VS-001, VS-004)
6. Demo locally before adding pad fallback

### Incremental Delivery

1. Setup + Foundational → parser and speech API ready
2. US1 + US2 → voice-first practice with confirmation (core MVP)
3. US3 → mic permission + number pad fallback (production-ready for all environments)
4. US4 → Space shortcut for laptop users
5. Polish → automated voice mocks + quickstart validation

### Parallel Team Strategy

With multiple developers after Foundational:

- Developer A: US1 voice UI (T009–T012)
- Developer B: US2 confirmation (T013–T015) — starts after T010
- Developer C: US3 pad + permission (T016–T021) — starts after T010

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps task to spec user story for traceability
- Landing, level-select, and summary screens MUST remain unchanged per spec Assumptions
- No new npm packages — Web Speech API only
- Practice screen MUST NOT use `<input>`, `<textarea>`, or `contenteditable` for answers (VR-013)
- Commit after each phase checkpoint
- Avoid backend, cloud STT APIs, always-on listening, or multiple-choice answer buttons (out of scope)

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T002 | 2 |
| Foundational | T003–T008 | 6 |
| US1 Voice (P1) | T009–T012 | 4 |
| US2 Heard Confirm (P1) | T013–T015 | 3 |
| US3 Pad Fallback (P2) | T016–T021 | 6 |
| US4 Space Shortcut (P3) | T022–T023 | 2 |
| Polish | T024–T028 | 5 |
| **Total** | T001–T028 | **28** |

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (US1 + US2) — **15 tasks**

**Next command**: Run **`/speckit-implement`** to execute tasks, or implement manually following phase order.

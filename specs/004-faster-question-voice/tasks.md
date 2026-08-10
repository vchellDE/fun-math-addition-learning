---
description: "Task list for Faster Question Flow & Voice Recognition Reliability"
---

# Tasks: Faster Question Flow & Voice Recognition Reliability

**Input**: Design documents from `/specs/004-faster-question-voice/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per plan.md Phase D and research R10 — unit tests for parser/timing; component tests for flow and voice mocks; manual quickstart validation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline and feature scope before modifying timing or voice paths.

- [X] T001 Review current delay constants (`FEEDBACK_DELAY_MS`, `AUTO_CONFIRM_DELAY_MS`) in `src/App.tsx` and `src/components/PracticeScreen.tsx` against `specs/004-faster-question-voice/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralized timing module required by US1, US3, US4, and `RELEASE_GRACE_MS` for US2.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T002 Create `src/lib/timingConfig.ts` exporting `AUTO_CONFIRM_DELAY_MS`, `FEEDBACK_DELAY_CORRECT_MS`, `FEEDBACK_DELAY_INCORRECT_MS`, `FEEDBACK_DELAY_SUMMARY_MS`, and `RELEASE_GRACE_MS` per `specs/004-faster-question-voice/contracts/timing-config.md`
- [X] T003 [P] Add `tests/unit/timingConfig.test.ts` asserting VR-020–VR-023 bounds and VR-024 correct-path total delay ≤ 1100 ms

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Snappy Advance After a Correct Answer (Priority: P1) 🎯 MVP

**Goal**: Reduce stacked waits so correct answers advance to the next problem within 1 second of feedback starting (FR-001, FR-011).

**Independent Test**: Complete several correct answers via number pad + Check; measure time from green feedback to next problem — median ≤ 1 s with no extra tap (FQ-001, SC-002).

### Tests for User Story 1

- [X] T004 [P] [US1] Add correct-path advance timer test (650 ms `FEEDBACK_DELAY_CORRECT_MS`) in `tests/components/PracticeFlow.test.tsx` using `vi.useFakeTimers()`
- [X] T005 [P] [US1] Add incorrect-path advance timer test (1800 ms `FEEDBACK_DELAY_INCORRECT_MS`) in `tests/components/PracticeFlow.test.tsx`

### Implementation for User Story 1

- [X] T006 [US1] Replace single `FEEDBACK_DELAY_MS` with path-specific delays imported from `src/lib/timingConfig.ts` in `src/App.tsx` (correct → `FEEDBACK_DELAY_CORRECT_MS`, incorrect → `FEEDBACK_DELAY_INCORRECT_MS`)
- [X] T007 [US1] Use `FEEDBACK_DELAY_SUMMARY_MS` for last-question → summary transition in `src/App.tsx` (no blank pause before "All done!")

**Checkpoint**: Correct and incorrect pad-path advances use differentiated delays; timer tests pass.

---

## Phase 4: User Story 2 — Reliable Voice Answers on First Try (Priority: P1)

**Goal**: Improve first-attempt voice recognition via multi-alternative STT, parser hardening, release grace, and Space gating (FR-005, FR-006, FR-007, FR-008).

**Independent Test**: Speak 30-item test set (FQ-005) in quiet room — ≥ 90% first-attempt success with on-screen button and Space key (SC-003).

### Tests for User Story 2

- [X] T008 [P] [US2] Extend `tests/unit/speechParser.test.ts` with homophone cases (`fitty`→50, `fiveteen`→15), mid-phrase fillers (`seven um`, `it's seven`), and `expectedMax` tie-breaking per `specs/004-faster-question-voice/contracts/speech-parser.md`
- [X] T009 [P] [US2] Update `tests/components/VoiceInput.test.tsx` with mocked `SpeechRecognition` returning 3 alternatives and Space-during-mic-prompt gating scenarios

### Implementation for User Story 2

- [X] T010 [US2] Add `ParseSpeechOptions` interface and homophone normalization map to `src/lib/speechParser.ts` per `specs/004-faster-question-voice/contracts/speech-parser.md`
- [X] T011 [US2] Implement global filler token removal in `normalizeTranscript` in `src/lib/speechParser.ts` (`um`, `uh`, `like`, `it's`, `the`, `answer`, `is`, `equals`)
- [X] T012 [US2] Implement `expectedMax` tie-breaking (filter ≤ expectedMax; return `ambiguous` if still tied) in `src/lib/speechParser.ts`
- [X] T013 [US2] Set `maxAlternatives: 3` and return `alternatives: string[]` from `onresult` in `src/lib/speechRecognition.ts` per `specs/004-faster-question-voice/contracts/voice-input.md`
- [X] T014 [US2] Loop alternatives through `parseSpokenNumber`, add `RELEASE_GRACE_MS` release grace after `stop()`, and abort stale session on new `pointerdown` in `src/lib/usePushToTalk.ts`
- [X] T015 [US2] Pass `expectedMax: problem.addendA + problem.addendB` into parse calls and wire multi-alternative parse loop in `src/components/PracticeScreen.tsx`
- [X] T016 [US2] Set `spaceEnabled: voiceEnabled && !showMicPrompt` for push-to-talk hook in `src/components/PracticeScreen.tsx`

**Checkpoint**: Voice path uses 3 alternatives, hardened parser, release grace, and Space gating; unit and voice component tests pass.

---

## Phase 5: User Story 3 — Clear "What I Heard" Without Extra Steps (Priority: P2)

**Goal**: Keep visible "I heard: N" confirmation with shorter auto-confirm pause; scoring remains automatic without Check tap (FR-003).

**Independent Test**: Speak a clear answer; verify "I heard: N" appears ~⅓ second before feedback with no Check tap (FQ-003).

### Tests for User Story 3

- [X] T017 [P] [US3] Add auto-confirm delay assertion (`AUTO_CONFIRM_DELAY_MS` ≈ 350 ms from `heardValue` set to `onSubmit`) in `tests/components/VoiceInput.test.tsx` or `tests/components/PracticeFlow.test.tsx`

### Implementation for User Story 3

- [X] T018 [US3] Replace local `AUTO_CONFIRM_DELAY_MS` with import from `src/lib/timingConfig.ts` for auto-confirm timer in `src/components/PracticeScreen.tsx`
- [X] T019 [US3] Verify `src/components/HeardAnswerBanner.tsx` unchanged UI — "I heard: N" copy and Try Again flow preserved; only timing source changes upstream

**Checkpoint**: Heard banner visible before auto-score; confirmation pause uses centralized 350 ms constant.

---

## Phase 6: User Story 4 — Simple System, No New Complexity for Kids (Priority: P2)

**Goal**: Speed and accuracy gains without new settings, modes, or practice-screen controls (FR-010, SC-005).

**Independent Test**: Caregiver observes first-time child session — same speak button, heard banner, try again, and pad fallback only (FQ-008).

### Implementation for User Story 4

- [X] T020 [US4] Audit `src/components/PracticeScreen.tsx` and related components — confirm no new user-facing controls, settings, or calibration flows added (SC-005)
- [X] T021 [US4] Verify number-pad Check path uses same `FEEDBACK_DELAY_CORRECT_MS` / `FEEDBACK_DELAY_INCORRECT_MS` from `src/App.tsx` as voice path (FR-011 parity)

**Checkpoint**: No new UI complexity; pad and voice share improved advance timing.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full test suite, debug telemetry, and manual validation across all stories.

- [X] T022 Run `npm test` from repo root and fix any failures across `tests/unit/` and `tests/components/`
- [X] T023 [P] Add optional `console.debug` VoiceTimingMarkers (`listenStart`, `listenEnd`, `transcriptReceived`, `heardDisplayed`, `answerConfirmed`, `feedbackShown`, `nextQuestionVisible`) in `src/lib/usePushToTalk.ts`, `src/components/PracticeScreen.tsx`, and `src/App.tsx` per `specs/004-faster-question-voice/data-model.md`
- [ ] T024 [P] Execute manual validation scenarios FQ-001 through FQ-008 in `specs/004-faster-question-voice/quickstart.md` and record pass/fail

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Stories (Phases 3–6)**: All depend on Foundational (T002) completion
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

| Story | Priority | Depends on | Notes |
|-------|----------|------------|-------|
| US1 | P1 | Phase 2 | `App.tsx` only; independently testable via pad path |
| US2 | P1 | Phase 2 | Parser, recognition, hook, PracticeScreen voice wiring |
| US3 | P2 | Phase 2, US2 T015–T016 | PracticeScreen auto-confirm after voice wiring |
| US4 | P2 | US1 T006–T007 | Verification of timing parity and no new UI |

### Within Each User Story

- Tests (T004–T005, T008–T009, T017) should be written first and fail before implementation
- Parser changes (T010–T012) before recognition/hook integration (T013–T016)
- US3 PracticeScreen timing (T018) after US2 PracticeScreen voice changes (T015–T016)

### Parallel Opportunities

- **Phase 2**: T003 parallel with T002 (different files)
- **US1**: T004 ∥ T005 (same file but independent test cases); T006 ∥ T007 sequential in `App.tsx`
- **US2**: T008 ∥ T009; T010 ∥ T013 (different files); T011–T012 sequential in `speechParser.ts`
- **US3**: T017 parallel with T018 once US2 PracticeScreen work lands
- **Polish**: T023 ∥ T024 after T022 passes

---

## Parallel Example: User Story 2

```bash
# Parser unit tests and voice component mocks in parallel:
Task T008: Extend tests/unit/speechParser.test.ts
Task T009: Update tests/components/VoiceInput.test.tsx

# Core modules in parallel after tests written:
Task T010: Homophone map in src/lib/speechParser.ts
Task T013: maxAlternatives in src/lib/speechRecognition.ts
```

---

## Parallel Example: User Story 1

```bash
# Timer tests in parallel:
Task T004: Correct-path 650 ms assertion in PracticeFlow.test.tsx
Task T005: Incorrect-path 1800 ms assertion in PracticeFlow.test.tsx

# Then implement App.tsx delays:
Task T006: Path-specific feedback delays
Task T007: Summary transition delay
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T003)
3. Complete Phase 3: User Story 1 (T004–T007)
4. **STOP and VALIDATE**: Run FQ-001 — median correct-answer advance ≤ 1 s
5. Demo snappy pad-path flow before voice work

### Incremental Delivery

1. Setup + Foundational → timing module ready
2. US1 → faster correct/incorrect advance (pad path) → validate FQ-001, FQ-004
3. US2 → voice reliability → validate FQ-005, FQ-006, FQ-007
4. US3 → shorter heard confirmation → validate FQ-003
5. US4 → no-regression audit → validate FQ-008
6. Polish → full `npm test` + FQ-001–FQ-008

### Parallel Team Strategy

After Phase 2:

- **Developer A**: US1 (`App.tsx` + PracticeFlow tests)
- **Developer B**: US2 (`speechParser.ts`, `speechRecognition.ts`, `usePushToTalk.ts`)
- **Developer C**: US3 + US4 after US2 PracticeScreen tasks merge

---

## Notes

- No new npm packages (constitution I — Simplicity First)
- No new practice-screen UI controls (FR-010, SC-005)
- `expectedMax` is tie-breaker only — never force correct answer (VR-025)
- US1 and US3 both reduce delays; combined voice correct-path target: autoConfirm (350) + feedbackCorrect (650) = 1000 ms fixed delay (VR-024)
- Commit after each task or logical group; stop at any checkpoint to validate story independently

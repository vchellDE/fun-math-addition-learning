# Implementation Plan: Faster Question Flow & Voice Recognition Reliability

**Branch**: `004-faster-question-voice` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-faster-question-voice/spec.md`

## Summary

Reduce perceived wait between questions by **tuning stacked delays** (750 ms auto-confirm + 1500 ms feedback → ~350 ms + ~650 ms on correct path) and improve **first-attempt voice accuracy** by parsing up to 3 STT alternatives, hardening `speechParser` with homophone normalization and optional problem-range tie-breaking, and fixing Space/lifecycle races — all without new UI, settings, or dependencies.

**Technical approach**: Add `timingConfig.ts`; refactor `App.tsx` for differentiated feedback delays; extend `speechParser.ts` and `speechRecognition.ts`; harden `usePushToTalk.ts` release grace and Space gating; wire `expectedMax` from `PracticeScreen`; expand unit/component tests.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (unchanged)

**Primary Dependencies**: Vite 6, React 19, Vitest, React Testing Library (no new packages)

**Storage**: In-memory session state; `sessionStorage` for `answerInputMode` only (unchanged)

**Testing**: Vitest — extended `speechParser.test.ts`; timer tests for feedback advance; mocked multi-alternative `SpeechRecognition`; manual quickstart FQ-001–FQ-008

**Target Platform**: Modern browsers with HTTPS (or localhost); Chrome, Safari, Edge for voice

**Project Type**: Web application (SPA, frontend-only)

**Performance Goals**: Median correct-answer confirmation → next problem < 1 s (SC-002); median voice release → next problem < 2 s on correct path (SC-004); ≥ 90% first-attempt recognition on 30-item test set (SC-003)

**Constraints**: No new npm packages; no paid cloud STT; no new practice-screen controls (FR-010, SC-005); ≤5 colors; push-to-talk only

**Scale/Scope**: ~1 new lib module (`timingConfig.ts`), 5 modified lib/components, extended tests — practice flow and voice path only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Research | Post-Design | Notes |
|-----------|--------------|-------------|-------|
| I. Simplicity First | ✅ PASS | ✅ PASS | Timing constants + parser tweaks; no backend, no new deps, no settings UI |
| II. Intuitive UI | ✅ PASS | ✅ PASS | Same workflow; faster feedback preserves obvious speak/pad paths |
| III. Kid-Friendly | ✅ PASS | ✅ PASS | Incorrect path keeps longer pause; encouraging retry copy unchanged |
| IV. Limited Color Palette | ✅ PASS | ✅ PASS | No visual changes required |
| V. Learning Over Decoration | ✅ PASS | ✅ PASS | Brief celebration retained; shorter idle wait only |

**Gate result**: PASS — Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-faster-question-voice/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── timing-config.md
│   ├── speech-parser.md
│   └── voice-input.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (repository root — changes for v4)

```text
src/
├── App.tsx                          # Differentiated feedback delays; remove FEEDBACK_DELAY_MS
├── components/
│   └── PracticeScreen.tsx           # timingConfig import; expectedMax parse; space gating
├── lib/
│   ├── timingConfig.ts              # NEW — centralized delay constants
│   ├── speechParser.ts              # Homophones, global fillers, ParseSpeechOptions
│   ├── speechRecognition.ts         # maxAlternatives: 3; pass alternatives array
│   └── usePushToTalk.ts             # Release grace; abort stale session; multi-alt parse loop

tests/
├── unit/
│   ├── speechParser.test.ts         # Extended homophone + expectedMax cases
│   └── timingConfig.test.ts         # NEW — bounds checks (optional)
└── components/
    ├── PracticeFlow.test.tsx        # Timer-based advance assertions
    └── VoiceInput.test.tsx          # Multi-alternative mock scenarios
```

**Structure Decision**: Incremental changes within existing single-frontend layout. Timing extracted to `timingConfig.ts` for testability and spec traceability.

## Phase 0: Research — Complete

All unknowns resolved in [research.md](./research.md):

- Root cause: stacked 750 ms + 1500 ms delays, not slow generation
- Correct-path delays: 350 ms auto-confirm + 650 ms feedback
- Incorrect-path delay: 1800 ms
- `maxAlternatives: 3` with first successful parse
- Optional `expectedMax` for fifteen/fifty-style ties
- Homophone map + global filler stripping
- Space gating when mic prompt open; 150 ms release grace

## Phase 1: Design — Complete

| Artifact | Path | Status |
|----------|------|--------|
| Data model | [data-model.md](./data-model.md) | ✅ |
| Timing contract | [contracts/timing-config.md](./contracts/timing-config.md) | ✅ |
| Speech parser contract | [contracts/speech-parser.md](./contracts/speech-parser.md) | ✅ |
| Voice input contract | [contracts/voice-input.md](./contracts/voice-input.md) | ✅ |
| Quickstart validation | [quickstart.md](./quickstart.md) | ✅ |

**Post-design constitution re-check**: PASS (see table above).

## Implementation Phases (for /speckit-tasks)

### Phase A — Timing configuration

- Create `src/lib/timingConfig.ts` per [timing-config.md](./contracts/timing-config.md)
- Replace `FEEDBACK_DELAY_MS` in `App.tsx` with correct/incorrect/summary delays
- Replace `AUTO_CONFIRM_DELAY_MS` in `PracticeScreen.tsx` with import from `timingConfig`
- Add timer tests with `vi.useFakeTimers()` for correct vs incorrect advance

### Phase B — Speech parser hardening

- Add `ParseSpeechOptions` and homophone map per [speech-parser.md](./contracts/speech-parser.md)
- Global filler token removal
- `expectedMax` tie-breaking when multiple candidates
- Extend `speechParser.test.ts` (homophones, mid-phrase fillers, tie cases)

### Phase C — Recognition and push-to-talk

- Update `speechRecognition.ts`: `maxAlternatives: 3`, return alternatives array
- Update `usePushToTalk.ts`: loop alternatives through parser; release grace; abort stale session
- Pass `expectedMax` from `PracticeScreen` into parse calls
- Set `spaceEnabled: voiceEnabled && !showMicPrompt`

### Phase D — Integration and validation

- Update `VoiceInput.test.tsx` for multi-alternative mocks
- Update `PracticeFlow.test.tsx` for faster correct-path advance
- Run `npm test`
- Manual validation per [quickstart.md](./quickstart.md) FQ-001–FQ-008

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| 350 ms too fast to read heard number | Keep banner + "Checking…" copy; manual FQ-003; bound ≥ 250 ms |
| `expectedMax` biases toward correct answer unfairly | Only tie-break among valid parses; never override clear transcript |
| Shorter correct feedback feels abrupt | 650 ms still shows celebration message; caregiver survey SC-001 |
| Homophone map false positives | Small curated list; unit tests for each entry |
| Space grace delays empty detection | Cap at 150 ms; unchanged retry flow |

## Next Command

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`, then **`/speckit-implement`** to build the feature.

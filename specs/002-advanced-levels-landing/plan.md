# Implementation Plan: Advanced Levels & Kids Landing Page

**Branch**: `002-advanced-levels-landing` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-advanced-levels-landing/spec.md`

## Summary

Extend the existing Vite + React + TypeScript mental-math app with (1) a kid-friendly landing page featuring an SVG mascot and tap-through math fun facts, and (2) three new difficulty levels beyond Intermediate (Advanced, Expert, Champion) with profile-based problem generation. Navigation splits into landing → level-select → practice → summary while preserving fast repeat-practice shortcuts.

**Technical approach**: Add `LandingScreen` and refactor `HomeScreen` into `LevelSelectScreen`; extend types, `categories.ts`, and `problemGenerator.ts` with `generatorProfile` dispatch; bundle `funFacts.ts`; extend `App.tsx` state machine (`landing` | `level-select` | `active` | `completed`); add unit tests for new generator profiles.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (unchanged from v1)

**Primary Dependencies**: Vite 6, React 19, Vitest, React Testing Library (no new packages)

**Storage**: In-memory session state; `sessionStorage` for last level/category (unchanged keys)

**Testing**: Vitest — extend `problemGenerator.test.ts` for 3 new categories; add `LandingFlow.test.tsx` for landing → level-select navigation

**Target Platform**: Modern browsers; Render Static Site deploy (unchanged)

**Project Type**: Web application (SPA, frontend-only)

**Performance Goals**: Landing renders with initial bundle (no extra fetch); generator pool build for Champion acceptable at session start (<50ms client-side)

**Constraints**: ≤5 colors; bundled fun facts; no level-gating; v1 three levels unchanged; mascot uses CSS tokens only

**Scale/Scope**: 2 new screens + 1 mascot component + generator refactor; ~6 levels; 10 fun facts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Research | Post-Design | Notes |
|-----------|--------------|-------------|-------|
| I. Simplicity First | ✅ PASS | ✅ PASS | Landing + facts support practice entry; no new backend or games |
| II. Intuitive UI | ✅ PASS | ✅ PASS | One primary CTA per screen; Home/Practice Again shortcuts preserved |
| III. Kid-Friendly | ✅ PASS | ✅ PASS | Fun facts age 5–11; encouraging copy; large tap targets |
| IV. Limited Color Palette | ✅ PASS | ✅ PASS | Mascot uses existing 5 CSS tokens; no sixth color |
| V. Learning Over Decoration | ✅ PASS | ✅ PASS | Facts build curiosity; mascot static; no auto-carousel |

**Gate result**: PASS — landing page justified per spec Assumptions; Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-advanced-levels-landing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── category-config.json
│   ├── problem-generator.md
│   ├── ui-screens.md
│   └── fun-facts.json
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (repository root — changes for v2)

```text
src/
├── App.tsx                      # Extended state machine (landing | level-select | active | completed)
├── components/
│   ├── LandingScreen.tsx        # NEW — mascot, fun facts, Let's Practice CTA
│   ├── FunFactCard.tsx          # NEW — fact display + next button
│   ├── MathMascot.tsx           # NEW — inline SVG star mascot
│   ├── LevelSelectScreen.tsx    # REFACTOR from HomeScreen.tsx
│   ├── PracticeScreen.tsx       # Minor — two-digit display support
│   ├── SummaryScreen.tsx        # Unchanged behavior
│   └── FeedbackBanner.tsx       # Unchanged
├── lib/
│   ├── categories.ts            # Extended config from category-config.json
│   ├── funFacts.ts              # NEW — bundled facts from contract
│   ├── problemGenerator.ts      # Profile-based dispatch
│   ├── sessionStorage.ts        # Fallback for unknown level ids
│   └── validators.ts            # Unchanged
├── types/
│   └── index.ts                 # Extended LevelId, CategoryId, SessionStatus, GeneratorProfile
└── styles/
    ├── tokens.css               # Unchanged
    └── global.css               # Landing + 6-level grid styles

tests/
├── unit/
│   └── problemGenerator.test.ts # Extended for 3 new categories
└── components/
    ├── PracticeFlow.test.tsx    # Update navigation paths
    └── LandingFlow.test.tsx     # NEW — landing → level-select
```

**Structure Decision**: Incremental extension of v1 single-frontend layout. No new packages or backend. `HomeScreen.tsx` renamed/refactored to `LevelSelectScreen.tsx` to clarify separation from landing.

## Phase 0: Research — Complete

All unknowns resolved in [research.md](./research.md):

- Screen flow: `landing` → `level-select` → `active` → `completed`
- Generator profiles: `uniform-addends`, `two-digit-plus-one`, `two-digit-friends`
- Fun facts: static bundled array, button cycling
- Mascot: inline SVG with palette tokens
- Six-level UI: column/grid of buttons with subtitles

## Phase 1: Design — Complete

| Artifact | Path | Status |
|----------|------|--------|
| Data model | [data-model.md](./data-model.md) | ✅ |
| Category config | [contracts/category-config.json](./contracts/category-config.json) | ✅ |
| Problem generator contract | [contracts/problem-generator.md](./contracts/problem-generator.md) | ✅ |
| UI screen contract | [contracts/ui-screens.md](./contracts/ui-screens.md) | ✅ |
| Fun facts content | [contracts/fun-facts.json](./contracts/fun-facts.json) | ✅ |
| Quickstart validation | [quickstart.md](./quickstart.md) | ✅ |

**Post-design constitution re-check**: PASS (see table above).

## Implementation Phases (for /speckit-tasks)

### Phase A — Types and config

- Extend `LevelId`, `CategoryId`, `SessionStatus` in `src/types/index.ts`
- Add `GeneratorProfile` type and optional `subtitle`/`hint` on levels
- Update `src/lib/categories.ts` from v2 `category-config.json`

### Phase B — Problem generator

- Refactor `problemGenerator.ts` with profile dispatch
- Implement `two-digit-plus-one` and `two-digit-friends` pool builders
- Extend `bigger-sums` with `maxSmallerAddend` constraint
- Add/extend unit tests for all 6 categories

### Phase C — Landing experience

- Create `src/lib/funFacts.ts` from `fun-facts.json`
- Create `MathMascot.tsx`, `FunFactCard.tsx`, `LandingScreen.tsx`
- Add landing styles to `global.css`

### Phase D — Navigation and level select

- Refactor `HomeScreen` → `LevelSelectScreen` with 6 levels + Home button
- Update `App.tsx` state machine and routing between screens
- Update `SummaryScreen` handlers: Change Level → `level-select`; Practice Again unchanged
- Add `sessionStorage` fallback for unknown level ids

### Phase E — Polish and validation

- Verify two-digit problem display on `PracticeScreen`
- Run full test suite + manual checks per [quickstart.md](./quickstart.md)
- Update README difficulty table

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Champion pool build slow | Pre-build pool once per session; pool size ~few thousand — acceptable |
| Six level buttons crowded on small phones | Single column; scroll if needed; subtitles shortened |
| Fun fact about "hands" conflicts with no-finger-counting | Fact is trivia only; no counting UI on practice screen |
| v1 tests break on navigation | Update RTL tests for new default screen |

## Next Command

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`, then **`/speckit-implement`** to build the feature.

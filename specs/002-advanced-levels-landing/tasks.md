---
description: "Task list for Advanced Levels & Kids Landing Page feature"
---

# Tasks: Advanced Levels & Kids Landing Page

**Input**: Design documents from `/specs/002-advanced-levels-landing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Generator and navigation tests included — spec SC-003 requires automated conformance for new levels; plan.md specifies `LandingFlow.test.tsx` and extended `problemGenerator.test.ts`.

**Organization**: Tasks grouped by user story (US1–US4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

Single frontend project at repository root: `src/`, `tests/`, `public/` (extends v1 implementation)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm v1 baseline before v2 changes

- [x] T001 Verify v1 baseline passes (`npm install`, `npm test`, `npm run dev`) before starting v2 work
- [x] T002 [P] Confirm design contracts are present under `specs/002-advanced-levels-landing/contracts/` (category-config.json, fun-facts.json, ui-screens.md, problem-generator.md)

**Checkpoint**: Existing v1 app runs and tests pass on current branch

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extended types, category config, and app state machine — MUST complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Extend `LevelId`, `CategoryId`, `SessionStatus`, and add `GeneratorProfile` and optional `subtitle`/`hint` fields in `src/types/index.ts` per `specs/002-advanced-levels-landing/data-model.md`
- [x] T004 Update `src/lib/categories.ts` to load six levels and six categories from `specs/002-advanced-levels-landing/contracts/category-config.json`
- [x] T005 Refactor `src/App.tsx` state machine: replace `idle` with `landing` and `level-select`; default screen `landing`; add navigation handlers `goToLanding`, `goToLevelSelect`
- [x] T006 [P] Add unknown `levelId`/`categoryId` fallback to `simple`/`single-digit` in `src/lib/sessionStorage.ts` per VR-012

**Checkpoint**: Types compile; categories export 6 levels; App renders landing placeholder and can transition to level-select

---

## Phase 3: User Story 1 - Welcome Landing with Math Fun Facts (Priority: P1) 🎯 MVP

**Goal**: Child opens app to a welcoming landing page, cycles through math fun facts, and taps through to level selection

**Independent Test**: Open app → see landing (not level picker) → tap Next Fact at least once → tap Let's Practice! → reach level selection without starting a round

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `src/lib/funFacts.ts` exporting ≥8 facts from `specs/002-advanced-levels-landing/contracts/fun-facts.json`
- [x] T008 [P] [US1] Create `src/components/FunFactCard.tsx` with fact display, Next Fact button, and wrap-around index cycling per FR-003
- [x] T009 [P] [US1] Create `src/components/LandingScreen.tsx` with welcome headline, subhead, `FunFactCard`, and Let's Practice! primary CTA per `contracts/ui-screens.md` S0
- [x] T010 [US1] Wire `LandingScreen` as default view in `src/App.tsx` and connect Let's Practice! to `goToLevelSelect`
- [x] T011 [US1] Route level-select to existing `src/components/HomeScreen.tsx` temporarily until US2 refactors it (preserve Start Practice flow)

**Checkpoint**: Landing is first screen; fun facts cycle; CTA reaches level picker

---

## Phase 4: User Story 2 - Extended Difficulty Progression Beyond Intermediate (Priority: P1)

**Goal**: Six levels (Simple → Champion); new categories generate valid problems within defined bounds

**Independent Test**: Select Advanced, Expert, and Champion; start practice; verify all 10 problems per round match category constraints in `contracts/problem-generator.md`

### Implementation for User Story 2

- [x] T012 [US2] Refactor `src/lib/problemGenerator.ts` to dispatch by `generatorProfile` from category config (remove hard-coded category allowlist)
- [x] T013 [P] [US2] Implement `uniform-addends` profile for `bigger-sums` with `maxSmallerAddend: 15` constraint in `src/lib/problemGenerator.ts`
- [x] T014 [P] [US2] Implement `two-digit-plus-one` pool builder in `src/lib/problemGenerator.ts` (sums 31–50, no ones regrouping)
- [x] T015 [P] [US2] Implement `two-digit-friends` pool builder in `src/lib/problemGenerator.ts` (no tens/ones regrouping, sum ≤ 99)
- [x] T016 [US2] Rename `src/components/HomeScreen.tsx` to `src/components/LevelSelectScreen.tsx` and update all imports in `src/App.tsx`
- [x] T017 [US2] Add six level buttons with subtitles from category config to `src/components/LevelSelectScreen.tsx` in progressive order per FR-008
- [x] T018 [US2] Show optional Champion hint text when Champion selected in `src/components/LevelSelectScreen.tsx` per spec edge case
- [x] T019 [US2] Extend `tests/unit/problemGenerator.test.ts` with invariant tests for `bigger-sums`, `two-digit-plus-one`, and `two-digit-friends` per SC-003

**Checkpoint**: All six levels selectable; generator tests pass for all categories; practice works at Advanced+

---

## Phase 5: User Story 3 - Kid-Friendly Visual Identity on Landing (Priority: P2)

**Goal**: Friendly mascot visual on landing using only the 5-color palette; fact text readable for ages 5–11

**Independent Test**: Show landing to observer; mascot recognizable and friendly; count ≤5 distinct UI colors; fact text readable on 375px mobile viewport

### Implementation for User Story 3

- [x] T020 [P] [US3] Create `src/components/MathMascot.tsx` as inline SVG star character with `+` motif using only CSS variables from `src/styles/tokens.css`
- [x] T021 [US3] Integrate `MathMascot` into `src/components/LandingScreen.tsx` above welcome headline per `contracts/ui-screens.md`
- [x] T022 [P] [US3] Add landing layout styles (mascot sizing, fact card, dot indicators) in `src/styles/global.css` with responsive rules for mobile
- [x] T023 [US3] Audit `src/components/LandingScreen.tsx`, `FunFactCard.tsx`, and `MathMascot.tsx` to confirm ≤5 colors and no external image assets per FR-011

**Checkpoint**: Landing has cohesive kid-friendly visual identity within constitution palette

---

## Phase 6: User Story 4 - Seamless Flow from Landing to Practice (Priority: P2)

**Goal**: Repeat practice skips landing; change level goes to level-select; Home returns to landing

**Independent Test**: Complete one round → Practice Again starts immediately → Change Level shows level-select → Home from level-select shows landing; ≤3 taps from summary to new session

### Implementation for User Story 4

- [x] T024 [US4] Update `src/App.tsx`: Practice Again navigates directly to `active` (skip landing and level-select); Change Level navigates to `level-select` only
- [x] T025 [US4] Add Home button to `src/components/LevelSelectScreen.tsx` calling `goToLanding` per FR-013
- [x] T026 [US4] Ensure `src/components/SummaryScreen.tsx` labels display correctly for Advanced, Expert, and Champion sessions
- [x] T027 [US4] Update `src/components/PracticeScreen.tsx` to display two-digit addends cleanly (e.g. `34 + 5 = ?`) for Expert/Champion problems
- [x] T028 [P] [US4] Create `tests/components/LandingFlow.test.tsx` covering landing → level-select navigation and fun-fact cycling
- [x] T029 [US4] Update `tests/components/PracticeFlow.test.tsx` for new default landing screen and Change Level → level-select path

**Checkpoint**: Navigation matches `contracts/ui-screens.md` v2 graph; component tests pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, build validation, and quickstart verification

- [x] T030 [P] Update `README.md` with landing page description and six-level difficulty table
- [x] T031 Add debug log comments in `src/App.tsx` for `landing`/`level-select`/`active`/`completed` transitions per project conventions
- [x] T032 Run `npm test` and `npm run build`; resolve TypeScript and build errors
- [x] T033 Execute manual validation scenarios VS-001 through VS-007 in `specs/002-advanced-levels-landing/quickstart.md` and fix gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phases 3–6)**: Depend on Phase 2 completion
  - Recommended order: US1 → US2 → US3 → US4 (P1 before P2)
  - US3 can start after US1 T009 (LandingScreen exists); US4 after US1 + US2
- **Polish (Phase 7)**: Depends on US1–US4 completion

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 (P1) | Foundational | MVP — landing + fun facts; uses existing HomeScreen as level-select |
| US2 (P1) | US1 T010–T011 | Refactors HomeScreen → LevelSelectScreen; extends generator |
| US3 (P2) | US1 LandingScreen | Adds mascot and landing polish |
| US4 (P2) | US1 + US2 | Navigation shortcuts and flow tests |

### Within Each User Story

- Tasks marked [P] can run in parallel within the story
- `App.tsx` wiring tasks depend on component tasks in the same story
- Generator profile tasks T013–T015 depend on T012 refactor

### Parallel Opportunities

- **Phase 1**: T002 parallel with T001
- **Phase 2**: T006 parallel with T003–T005 after T003
- **Phase 3**: T007–T009 parallel; T010–T011 sequential
- **Phase 4**: T013–T015 parallel after T012; T016–T018 sequential
- **Phase 5**: T020 and T022 parallel; T021 after T020
- **Phase 6**: T028 parallel with T024–T027 after components exist
- **Phase 7**: T030 parallel with T031

---

## Parallel Example: User Story 1

```bash
# Launch landing components in parallel:
Task T007: "Create src/lib/funFacts.ts"
Task T008: "Create src/components/FunFactCard.tsx"
Task T009: "Create src/components/LandingScreen.tsx"

# Then wire sequentially:
Task T010: "Wire LandingScreen in src/App.tsx"
Task T011: "Route level-select to HomeScreen temporarily"
```

---

## Parallel Example: User Story 2

```bash
# After T012 generator refactor, launch pool builders in parallel:
Task T013: "Implement bigger-sums in src/lib/problemGenerator.ts"
Task T014: "Implement two-digit-plus-one in src/lib/problemGenerator.ts"
Task T015: "Implement two-digit-friends in src/lib/problemGenerator.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Landing → fun facts → level selection (VS-001)
5. Demo locally before adding Advanced+ levels

### Incremental Delivery

1. Setup + Foundational → extended types and state machine ready
2. US1 → landing page with fun facts (MVP)
3. US2 → six levels and new generator profiles
4. US3 → mascot and landing visual polish
5. US4 → navigation shortcuts and flow tests
6. Polish → quickstart validation and README

### Parallel Team Strategy

With multiple developers after Foundational:

- Developer A: US1 landing (T007–T011)
- Developer B: US2 generator (T012–T015) — starts after T004
- Developer C: US3 mascot (T020–T023) — starts after US1 LandingScreen exists

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps task to spec user story for traceability
- v1 levels (Simple/Medium/Intermediate) MUST remain unchanged per FR-006
- Generator invariants in `contracts/problem-generator.md` must hold for all six categories
- Mascot and fun facts use bundled static content only (FR-015)
- Commit after each phase checkpoint
- Avoid adding backend, auth, level-gating, or features outside spec FR-001–FR-016

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T002 | 2 |
| Foundational | T003–T006 | 4 |
| US1 Landing | T007–T011 | 5 |
| US2 Levels | T012–T019 | 8 |
| US3 Visual | T020–T023 | 4 |
| US4 Navigation | T024–T029 | 6 |
| Polish | T030–T033 | 4 |
| **Total** | T001–T033 | **33** |

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) — 11 tasks

**Next command**: Run **`/speckit-implement`** to execute tasks, or implement manually following phase order.

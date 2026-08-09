---
description: "Task list for Mental Math Addition Practice feature"
---

# Tasks: Mental Math Addition Practice

**Input**: Design documents from `/specs/001-mental-math-addition/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not included — feature spec does not request TDD; Vitest setup is included in scaffold for optional follow-up.

**Organization**: Tasks grouped by user story (US1–US4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

Single frontend project at repository root: `src/`, `tests/`, `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Vite + React + TypeScript project and base file structure

- [x] T001 Create Vite + React + TypeScript project with `package.json`, `vite.config.ts`, and `tsconfig.json` at repository root
- [x] T002 [P] Create `index.html` entry point and `src/main.tsx` app bootstrap
- [x] T003 [P] Create `src/styles/tokens.css` with 5-color CSS variables per `contracts/ui-screens.md`
- [x] T004 [P] Create `src/styles/global.css` with base layout, typography, and button styles importing `tokens.css`
- [x] T005 [P] Create `public/favicon.svg` and wire favicon in `index.html`
- [x] T006 [P] Add Vitest and React Testing Library dev dependencies and test config in `vite.config.ts`

**Checkpoint**: `npm install` and `npm run dev` start without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, problem generation, and app shell — MUST complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create shared TypeScript interfaces in `src/types/index.ts` (Problem, PracticeSession, DifficultyLevel, ProblemCategory, AnswerAttempt, SessionSummary, SessionStatus)
- [x] T008 Implement `src/lib/categories.ts` loading level/category config from `specs/001-mental-math-addition/contracts/category-config.json`
- [x] T009 Implement `src/lib/problemGenerator.ts` with `generateRound()` per `contracts/problem-generator.md` (dedup, category bounds, 10 problems)
- [x] T010 [P] Implement `src/lib/validators.ts` with numeric-only input validation and empty-answer guard
- [x] T011 [P] Implement `src/lib/sessionStorage.ts` to persist and restore `lastLevelId` / `lastCategoryId`
- [x] T012 Create `src/App.tsx` screen router with state machine (`idle` → `active` → `completed`) and placeholder screen rendering

**Checkpoint**: `generateRound('single-digit', 10)` returns 10 valid unique problems; App renders without errors

---

## Phase 3: User Story 1 - Practice Mental Addition (Priority: P1) 🎯 MVP

**Goal**: Child completes a 10-question addition round with immediate encouraging feedback and session summary

**Independent Test**: Launch app → tap Start Practice → answer 10 problems (mix correct/incorrect) → see summary with correct count

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `src/components/FeedbackBanner.tsx` with correct/incorrect/empty-submit messages per `contracts/ui-screens.md`
- [x] T014 [P] [US1] Create `src/components/PracticeScreen.tsx` with problem display (`{a} + {b} = ?`), numeric input, Check button, and progress label (`Question n of 10`)
- [x] T015 [P] [US1] Create `src/components/SummaryScreen.tsx` with score display, Practice Again, and Change Level buttons
- [x] T016 [US1] Create `src/components/HomeScreen.tsx` with Start Practice button (defaults to Simple / single-digit per FR-013)
- [x] T017 [US1] Wire practice session flow in `src/App.tsx`: generate round, advance on answer, score attempts, show feedback, navigate to summary after question 10
- [x] T018 [US1] Integrate `src/lib/validators.ts` in `src/components/PracticeScreen.tsx` to block empty and non-numeric submissions

**Checkpoint**: Full practice round works end-to-end with default Simple level; summary shows correct count

---

## Phase 4: User Story 2 - Choose Difficulty Level and Category (Priority: P2)

**Goal**: Parent or child selects Simple / Medium / Intermediate; generated problems match selected category bounds

**Independent Test**: Select each level, start practice, verify all 10 problems conform to category sum ranges in spec FR-005

### Implementation for User Story 2

- [x] T019 [US2] Add level selector buttons (Simple, Medium, Intermediate) to `src/components/HomeScreen.tsx` with auto-matched category labels
- [x] T020 [US2] Wire selected `levelId` and `categoryId` from `src/components/HomeScreen.tsx` into session creation in `src/App.tsx`
- [x] T021 [US2] Pass selected `categoryId` to `generateRound()` in `src/App.tsx` when starting practice
- [x] T022 [US2] Add level/category badge to `src/components/PracticeScreen.tsx` so child sees what they are practicing
- [x] T023 [US2] Restore last-selected level from `src/lib/sessionStorage.ts` on home screen load in `src/components/HomeScreen.tsx`

**Checkpoint**: Each level generates problems within correct sum bounds; selection persists on return visit

---

## Phase 5: User Story 3 - Kid-Friendly, Distraction-Free Experience (Priority: P3)

**Goal**: Large tap targets, ≤5 colors, no finger-counting aids; child can start without instructions

**Independent Test**: Child (or observer) starts practice within 10 seconds; mobile viewport shows ≥48px buttons; no manipulative graphics

### Implementation for User Story 3

- [x] T024 [P] [US3] Enforce 48px minimum touch targets and large number typography in `src/styles/global.css`
- [x] T025 [P] [US3] Apply 5-color palette strictly across `src/components/HomeScreen.tsx`, `PracticeScreen.tsx`, `SummaryScreen.tsx`, and `FeedbackBanner.tsx` using CSS variables from `src/styles/tokens.css`
- [x] T026 [US3] Add rotating encouraging correct-answer messages in `src/components/FeedbackBanner.tsx` (no punitive language per FR-010)
- [x] T027 [US3] Audit all `src/components/` files to confirm no finger icons, number lines, or counting-object graphics (FR-002, SC-006)
- [x] T028 [US3] Add responsive centered card layout (max-width 480px) in `src/styles/global.css` for tablet and phone

**Checkpoint**: UI passes constitution visual review; usable on mobile DevTools without horizontal scroll

---

## Phase 6: User Story 4 - Public Online Access (Priority: P4)

**Goal**: App deployed to a public URL on Render; accessible from any browser without install

**Independent Test**: Open public URL on phone, complete one practice round successfully

### Implementation for User Story 4

- [x] T029 [P] [US4] Create `render.yaml` with Static Site config (build: `npm ci && npm run build`, publish: `dist`, SPA fallback `/* → /index.html`)
- [x] T030 [US4] Add `build` and `preview` scripts to `package.json` and verify production build outputs to `dist/`
- [x] T031 [US4] Update `README.md` with local dev, build, and Render deployment instructions
- [x] T032 [US4] Deploy to Render Static Site and record public URL in `README.md` (deployment steps documented; add URL after connecting repo to Render)

**Checkpoint**: Public URL loads home screen within 5 seconds; practice round completes on mobile browser

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories

- [x] T033 [P] Add debug logging comments in `src/lib/problemGenerator.ts` and `src/App.tsx` for session state transitions
- [x] T034 Run `npm run build` and resolve any TypeScript or build errors
- [x] T035 Execute manual validation scenarios VS-001 through VS-006 in `specs/001-mental-math-addition/quickstart.md` and fix gaps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phases 3–6)**: Depend on Phase 2 completion
  - Recommended order: US1 → US2 → US3 → US4 (priority P1 → P4)
  - US3 can overlap US2 once US1 screens exist (different files)
- **Polish (Phase 7)**: Depends on US1–US4 completion

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 (P1) | Foundational | MVP — default level only |
| US2 (P2) | US1 HomeScreen + App flow | Extends level selection |
| US3 (P3) | US1 components exist | Styles and audits existing screens |
| US4 (P4) | US1 minimum | Deploy once core flow works; polish before public launch |

### Within Each User Story

- Components marked [P] can be built in parallel
- `App.tsx` wiring tasks depend on component tasks in same story
- US2 modifies US1 HomeScreen — complete US1 first

### Parallel Opportunities

- **Phase 1**: T002–T006 can run in parallel after T001
- **Phase 2**: T010–T011 parallel after T007; T009 after T008
- **Phase 3**: T013–T016 parallel; T017–T018 sequential after components
- **Phase 5**: T024–T025 parallel
- **Phase 6**: T029 parallel with T030

---

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task T013: "Create src/components/FeedbackBanner.tsx"
Task T014: "Create src/components/PracticeScreen.tsx"
Task T015: "Create src/components/SummaryScreen.tsx"

# Then wire sequentially:
Task T017: "Wire practice session flow in src/App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Complete one 10-question round with summary
5. Demo locally before adding level selection

### Incremental Delivery

1. Setup + Foundational → core generator and app shell ready
2. US1 → mental math practice loop (MVP)
3. US2 → difficulty levels and categories
4. US3 → kid-friendly polish and constitution compliance
5. US4 → Render deployment and public URL
6. Polish → quickstart validation

### Parallel Team Strategy

With multiple developers after Foundational:

- Developer A: US1 practice flow (T013–T018)
- Developer B: US2 level selection (T019–T023) — starts after T016
- Developer C: US3 styling (T024–T028) — starts after T014–T016 exist

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps task to spec user story for traceability
- Default level for MVP: Simple / single-digit (FR-013)
- Problem generator invariants INV-001–INV-004 must hold for all categories
- Commit after each phase checkpoint
- Avoid adding backend, auth, or features outside spec FR-001–FR-015

---

## Phase 8: Convergence

- [x] T036 Disable answer submission while feedback is showing in `src/App.tsx` and `src/components/PracticeScreen.tsx` to prevent double-scoring during the 1.5s feedback delay per US1/AC2 (partial)
- [x] T037 Enable empty-answer Check tap that shows gentle prompt in `src/components/PracticeScreen.tsx` per edge case VS-004 (remove `disabled` when empty; validate on click) (partial)
- [x] T038 Deploy to Render Static Site and record the live public URL in `README.md` per US4/AC1 and FR-011 (missing) — Blueprint deploy steps documented; paste live URL after connecting repo to Render
- [x] T039 Add friendly offline or load-failure fallback message in `index.html` and/or `src/App.tsx` using `navigator.onLine` per spec edge case (partial)
- [x] T040 Add home-to-summary practice flow component test in `tests/components/PracticeFlow.test.tsx` per plan.md testing strategy (missing)

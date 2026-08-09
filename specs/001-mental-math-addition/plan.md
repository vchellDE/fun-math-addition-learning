# Implementation Plan: Mental Math Addition Practice

**Branch**: `001-mental-math-addition` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-mental-math-addition/spec.md`

## Summary

Build a client-only web app where a child practices mental addition in 10-question rounds across three pedagogical levels (Simple → Medium → Intermediate). The UI is minimal, kid-friendly, and uses at most five colors. Problem generation runs entirely in the browser with validated numeric ranges. Deploy the production build as a Render Static Site for public access—no backend, accounts, or database in v1.

**Technical approach**: Vite + React + TypeScript SPA; Vitest for generator and flow tests; CSS variables for the fixed palette; `sessionStorage` for last-selected level only.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS

**Primary Dependencies**: Vite 6, React 19, Vitest, React Testing Library

**Storage**: In-memory session state; optional `sessionStorage` for UI preferences (no server persistence)

**Testing**: Vitest (unit tests for problem generator + validators); React Testing Library (home → practice → summary flow)

**Target Platform**: Modern browsers (desktop, tablet, phone); deployed as static files on Render

**Project Type**: Web application (single-page, frontend-only)

**Performance Goals**: First contentful paint under 2s on broadband; instant feedback on answer submit (<100ms client-side)

**Constraints**: ≤5 colors; no finger-counting UI; offline-capable after initial load; no child PII collection; bundle size kept small (no heavy UI frameworks)

**Scale/Scope**: Single family / low-traffic public site; 3 screens; ~10 source files for core logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Research | Post-Design | Notes |
|-----------|--------------|-------------|-------|
| I. Simplicity First | ✅ PASS | ✅ PASS | No backend, no auth, addition-only, 3 screens |
| II. Intuitive UI | ✅ PASS | ✅ PASS | One CTA per screen; level → start → answer flow |
| III. Kid-Friendly | ✅ PASS | ✅ PASS | Encouraging copy contract defined in ui-screens.md |
| IV. Limited Color Palette | ✅ PASS | ✅ PASS | 5 CSS tokens documented; no extras planned |
| V. Learning Over Decoration | ✅ PASS | ✅ PASS | Brief feedback only; no manipulatives |

**Gate result**: PASS — no violations; Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-mental-math-addition/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── category-config.json
│   ├── problem-generator.md
│   └── ui-screens.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (repository root)

```text
public/
└── favicon.svg

src/
├── main.tsx                 # App entry
├── App.tsx                  # Screen router / state orchestration
├── components/
│   ├── HomeScreen.tsx       # Level selection + start
│   ├── PracticeScreen.tsx   # Problem display + answer input
│   ├── SummaryScreen.tsx    # End-of-round results
│   └── FeedbackBanner.tsx   # Correct/incorrect messages
├── lib/
│   ├── problemGenerator.ts  # generateRound() per contract
│   ├── categories.ts        # Load category-config
│   ├── sessionStorage.ts    # Persist last level preference
│   └── validators.ts        # Numeric input validation
├── types/
│   └── index.ts             # Shared TypeScript interfaces
└── styles/
    ├── tokens.css           # 5-color palette variables
    └── global.css           # Layout, typography, touch targets

tests/
├── unit/
│   └── problemGenerator.test.ts
└── components/
    └── PracticeFlow.test.tsx

index.html
package.json
vite.config.ts
tsconfig.json
render.yaml                  # Render Static Site config (optional IaC)
```

**Structure Decision**: Single frontend project at repo root. No `backend/` directory—problem generation and session state are client-side. Matches constitution Simplicity First and spec assumption of Render static hosting.

## Phase 0: Research — Complete

All technical unknowns resolved in [research.md](./research.md):

- Framework: Vite + React + TypeScript
- Hosting: Render Static Site (`dist/`)
- State: in-memory + optional sessionStorage
- Problem generation: client-side pure functions with category constraints
- UI palette: 5 CSS custom properties
- Testing: Vitest + RTL

## Phase 1: Design — Complete

| Artifact | Path | Status |
|----------|------|--------|
| Data model | [data-model.md](./data-model.md) | ✅ |
| Problem generator contract | [contracts/problem-generator.md](./contracts/problem-generator.md) | ✅ |
| Category config | [contracts/category-config.json](./contracts/category-config.json) | ✅ |
| UI screen contract | [contracts/ui-screens.md](./contracts/ui-screens.md) | ✅ |
| Quickstart validation | [quickstart.md](./quickstart.md) | ✅ |

**Post-design constitution re-check**: PASS (see table above).

## Implementation Phases (for /speckit-tasks)

### Phase A — Scaffold

- Initialize Vite + React + TypeScript project
- Add Vitest, RTL, ESLint
- Create `tokens.css` with 5-color palette
- Add `render.yaml` or document Render dashboard settings

### Phase B — Core logic

- Implement `categories.ts` from `category-config.json`
- Implement `problemGenerator.ts` per contract (with unit tests)
- Implement `validators.ts` for numeric input

### Phase C — UI screens

- `HomeScreen`: level selector, defaults, Start Practice
- `PracticeScreen`: problem display, progress, input, feedback
- `SummaryScreen`: score, Practice Again, Change Level
- Wire `App.tsx` state machine (idle → active → completed)

### Phase D — Polish & deploy

- Responsive layout (mobile-first, 48px touch targets)
- sessionStorage for last level
- Production build + Render Static Site deploy
- Manual validation per [quickstart.md](./quickstart.md)

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Child cannot type answers | Large numeric input; future: optional number pad |
| Problem pool edge cases | Unit tests with fixed seeds; invariant checks in generator |
| Render SPA routing 404 | Configure `/* → /index.html` rewrite |
| Over-scoping v1 | Strict adherence to spec FR-001–FR-015; defer accounts/audio |

## Next Command

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`, then **`/speckit-implement`** to build the app.

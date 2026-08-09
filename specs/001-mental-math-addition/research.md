# Research: Mental Math Addition Practice

**Feature**: `001-mental-math-addition` | **Date**: 2026-08-09

## R1: Frontend framework and build tool

**Decision**: Vite 6 + React 19 + TypeScript 5

**Rationale**: The app is a small single-page experience (home, practice, summary). Vite provides fast local dev, a simple production build, and static output ideal for Render Static Sites. React keeps screen state manageable without introducing a backend. TypeScript catches errors in problem-generation logic early.

**Alternatives considered**:
- **Plain HTML/CSS/JS** — Fewest dependencies, but harder to test and structure as screens grow.
- **Next.js** — SSR/SSG unnecessary for a client-only practice app; adds deployment complexity.
- **Vue/Svelte** — Viable; React chosen for broader familiarity and testing ecosystem.

## R2: Hosting on Render

**Decision**: Deploy as a **Render Static Site** from the Vite `dist/` output.

**Rationale**: Spec requires a public URL with no install. Render Static Sites support custom domains, HTTPS, and Git-based auto-deploy. No server runtime needed for v1 (no API, no database).

**Alternatives considered**:
- **Render Web Service** — Requires a Node server; unnecessary for static SPA.
- **Netlify / Vercel / GitHub Pages** — Equally valid; Render chosen per user preference in spec assumptions.
- **Self-hosted** — More ops burden for a family learning app.

**Render configuration (planned)**:
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/* → /index.html` (SPA fallback)

## R3: State and persistence

**Decision**: In-memory React state for active session; optional `sessionStorage` for last-selected level/category only.

**Rationale**: Spec excludes user accounts and cloud sync. Session summary is ephemeral per round. Persisting only UI preferences avoids data-privacy concerns for children.

**Alternatives considered**:
- **localStorage history** — Deferred; not required for v1.
- **Backend + database** — Violates Simplicity First for current scope.

## R4: Problem generation algorithm

**Decision**: Client-side pure function `generateRound(category, count)` that:
1. Enumerates valid `(a, b)` pairs for the category constraints.
2. Randomly samples without replacement until `count` (10) unique problems.
3. Falls back to resampling with dedup if the valid pool is smaller than 10 (not expected for defined categories).

**Rationale**: Guarantees SC-003 (100% conformance to ranges) and FR-014 (no duplicates in a round). Testable in isolation with Vitest.

**Category constraints** (from spec):

| Category | Addends | Sum range | Level |
|----------|---------|-----------|-------|
| `single-digit` | 1–9 | 2–9 | Simple |
| `make-10` | 1–9 | 6–10 | Medium |
| `teen-numbers` | 1–9 | 11–20 | Intermediate |

**Pedagogy note**: Ordering follows number-bonds progression (sums within 10 before teen sums), aligned with Singapore Math / Common Core K–2 mental-math staging.

## R5: UI and accessibility

**Decision**: CSS custom properties for a fixed 5-color palette; minimum 48px touch targets; system font stack with large base size (20px+); feedback uses text + icon, not color alone.

**Palette (proposed)**:
- Background: `#FFF8F0` (warm off-white)
- Text: `#2D3436` (dark gray)
- Primary action: `#4A90D9` (calm blue)
- Success: `#5CB85C` (green)
- Neutral border/disabled: `#BDC3C7` (light gray)

**Rationale**: Satisfies constitution Principle IV (≤5 colors) and accessibility constraint (contrast, non-color-only feedback).

## R6: Testing strategy

**Decision**: Vitest for unit tests (problem generator, validators, category config); React Testing Library for key user flows (start practice, submit answer, see summary).

**Rationale**: No backend to integration-test. Generator correctness is critical for pedagogical integrity.

**Alternatives considered**:
- **Playwright E2E** — Valuable later; unit + component tests sufficient for v1 MVP.
- **No tests** — Rejected; problem ranges must be verified automatically.

## R7: Input method for answers

**Decision**: Large numeric text input with `inputMode="numeric"` and on-screen "Check" button; block non-digit input.

**Rationale**: Supports tablet and desktop keyboards; simpler than building a custom number pad. Meets FR-002 (mental entry, no manipulatives).

**Alternatives considered**:
- **Multiple-choice answers** — Easier for youngest users but allows guessing without mental calculation; deferred as optional enhancement.

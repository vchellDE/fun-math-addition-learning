# Research: Advanced Levels & Kids Landing Page

**Feature**: `002-advanced-levels-landing` | **Date**: 2026-08-09

## R1: Screen flow — landing vs level selection

**Decision**: Split the current `HomeScreen` into two screens: `LandingScreen` (default entry) and `LevelSelectScreen` (level picker + Start Practice). Extend `SessionStatus` with `landing` and `level-select` replacing the single `idle` state.

**Rationale**: Spec FR-001 requires a dedicated landing page as first view; FR-013 requires navigation back from level selection. A two-step entry (`landing` → `level-select` → `active`) matches the spec without overloading one screen.

**Alternatives considered**:
- **Keep one HomeScreen with landing section above level buttons** — Rejected: mixes "discover" and "configure" on one scroll; harder to satisfy FR-001 "dedicated landing screen."
- **Modal overlay for fun facts** — Rejected: adds interaction complexity; violates Simplicity First.

## R2: Navigation state machine

**Decision**: Update app state machine:

```text
landing ──Let's Practice──► level-select ──Start──► active ──10 answers──► completed
   ▲                            ▲                         │                    │
   │                            │                         │                    │
   └── Home (from level-select)─┘                         │                    │
                                                           │                    │
                              Practice Again (same level)──┘                    │
                              Change Level ─────────────────────────────────────┘
                              (goes to level-select, not landing)
```

**Rationale**: Spec User Story 4 — repeat practice skips landing; change level skips landing; Home affordance on level-select returns to fun facts.

**Alternatives considered**:
- **Always show landing on return** — Rejected: blocks repeat users (violates SC-006).
- **URL routing with React Router** — Rejected: unnecessary for 4 screens; in-memory state in `App.tsx` matches v1 pattern.

## R3: Problem generator for new categories

**Decision**: Extend `category-config.json` with a `generatorProfile` field per category. Keep v1 categories on `uniform-addends` (existing loop). New profiles:

| Profile | Categories | Pool construction |
|---------|------------|-------------------|
| `uniform-addends` | single-digit, make-10, teen-numbers, bigger-sums | Loop `a,b` in `[minAddend,maxAddend]`; filter by sum bounds; bigger-sums adds `min(a,b) <= 15` |
| `two-digit-plus-one` | two-digit-plus-one | Loop two-digit `ab` (10–49), single `c` (1–9); require `(ab%10)+c < 10` and `31 <= ab+c <= 50` |
| `two-digit-friends` | two-digit-friends | Loop two-digit `ab`, `cd` (10–99); require no regrouping in ones/tens and `ab+cd <= 99` |

Refactor `problemGenerator.ts` to dispatch by `generatorProfile` instead of hard-coded category id list.

**Rationale**: v1 generator assumes addends 1–9; Expert/Champion need structurally different pools. Profile dispatch keeps one `generateRound()` entry point and testable invariants per profile.

**Alternatives considered**:
- **Separate generator files per level** — Rejected: duplicates shuffle/dedup logic.
- **Only min/max sum fields** — Rejected: cannot express "no regrouping" or two-digit structure.

## R4: Advanced ("Bigger Sums") addend bounds

**Decision**: `bigger-sums` uses `minAddend: 6`, `maxAddend: 24` with `minSum: 21`, `maxSum: 30`, plus invariant **at least one addend ≤ 15** (spec FR-007).

**Rationale**: Sums 21–30 with both addends ≤9 is impossible (max sum 18). Extending addend range while capping one addend at 15 keeps mental math feasible for ages 8–11.

**Alternatives considered**:
- **Allow both addends up to 24** — Rejected: e.g. `22+8` is too hard for target mental-math audience.
- **Single addend fixed at teen** — Rejected: too repetitive; pool too small.

## R5: Landing fun facts — content and interaction

**Decision**: Static `funFacts.ts` array of 10 facts; tap **Next Fact** button cycles index modulo length; optional dot indicators show position. No swipe library (touch handler optional later; button satisfies FR-003).

**Rationale**: Bundled static content (FR-015); button is simplest accessible interaction for ages 5–11; no external API.

**Alternatives considered**:
- **Auto-rotate carousel timer** — Rejected: distracting per constitution V (Learning Over Decoration).
- **Fetch facts from API** — Rejected: violates offline/bundled requirement.

## R6: Kid-friendly mascot visual

**Decision**: Inline SVG component `MathMascot.tsx` — friendly star character with a `+` on its chest, built from circles/paths using only CSS palette tokens (`--color-primary`, `--color-success`, `--color-text`). No image assets or third-party illustrations.

**Rationale**: Spec assumes simple SVG; palette compliance; scales on mobile; no license issues.

**Alternatives considered**:
- **Emoji-only mascot (⭐)** — Rejected: less distinctive; harder to feel "designed for kids."
- **Raster PNG illustration** — Rejected: extra asset weight; harder to recolor within 5-token palette.

## R7: Six-level UI layout

**Decision**: Level-select shows 6 buttons in a single column (mobile) or 2×3 grid (tablet+). Each button shows level name + one-line subtitle from category label. Optional hint on Champion: "Try Intermediate first if this feels hard!" (non-blocking).

**Rationale**: Fits existing `button-group` pattern; progressive order matches spec FR-008.

**Alternatives considered**:
- **Horizontal scroll carousel of levels** — Rejected: hides levels off-screen; worse for young users.
- **Unlock progression** — Rejected: spec assumes no gating in v2.

## R8: Backward compatibility

**Decision**: Extend `LevelId` and `CategoryId` unions; `sessionStorage` keys unchanged. Unknown stored level ids fall back to `simple` / `single-digit`.

**Rationale**: Existing users with v1 preferences should not break after deploy.

**Alternatives considered**:
- **Migration script for storage** — Rejected: overkill for optional preference key.

## R9: Testing strategy

**Decision**: Add unit tests for each new `generatorProfile` (pool invariants, 100 random rounds per category). Add RTL test: landing → level-select → start practice. Extend existing generator tests; do not remove v1 cases.

**Rationale**: SC-003 requires 100% conformance for new levels in automated tests.

**Alternatives considered**:
- **Manual-only validation for new levels** — Rejected: insufficient for regrouping constraints.

## Summary

All technical unknowns resolved. No NEEDS CLARIFICATION items remain. Implementation extends existing Vite + React + TypeScript stack without new dependencies.

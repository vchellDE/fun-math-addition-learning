# Data Model: Advanced Levels & Kids Landing Page

**Feature**: `002-advanced-levels-landing` | **Date**: 2026-08-09

**Extends**: [001 data-model](../001-mental-math-addition/data-model.md) — v1 entities unchanged unless noted.

## Overview

Adds landing-page entities and extends difficulty/category enums. All state remains client-side (in-memory + optional `sessionStorage`). No new persistence layer.

## New Entities

### MathFunFact

Static content shown on the landing page.

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Unique, e.g. `"fact-01"` |
| `text` | string | 1–2 short sentences; reading level ~grades 1–4 |
| `emoji` | string \| null | Optional single emoji accent (not a sixth UI color) |

**Collection**: `FunFact[]` length ≥ 8, bundled in `src/lib/funFacts.ts`.

### LandingPageState (UI-only, not persisted)

| Field | Type | Rules |
|-------|------|-------|
| `currentFactIndex` | number | `0 <= index < facts.length`; wraps on next |
| `mascotVisible` | boolean | Always `true` in v2 |

## Extended Entities

### DifficultyLevel

| Field | Change |
|-------|--------|
| `id` | Extended: `"simple" \| "medium" \| "intermediate" \| "advanced" \| "expert" \| "champion"` |
| `label` | Display: Simple, Medium, Intermediate, Advanced, Expert, Champion |
| `defaultCategoryId` | Maps 1:1 to extended CategoryId |
| `subtitle` | **New optional** — one-line hint, e.g. `"Sums 21–30"` |

**Level → category mapping (v2)**:

| levelId | defaultCategoryId | label |
|---------|-------------------|-------|
| simple | single-digit | Simple |
| medium | make-10 | Medium |
| intermediate | teen-numbers | Intermediate |
| advanced | bigger-sums | Advanced |
| expert | two-digit-plus-one | Expert |
| champion | two-digit-friends | Champion |

### ProblemCategory

| Field | Change |
|-------|--------|
| `id` | Extended with `bigger-sums`, `two-digit-plus-one`, `two-digit-friends` |
| `generatorProfile` | **New required** — see below |
| `minAddend` / `maxAddend` | Still used for `uniform-addends`; ignored for structured profiles |
| `minSum` / `maxSum` | Sum bounds; used by all profiles where applicable |

**generatorProfile values**:

| Profile | Used by | Extra rules |
|---------|---------|-------------|
| `uniform-addends` | v1 categories + bigger-sums | Pair loop; bigger-sums: `min(a,b) <= 15` |
| `two-digit-plus-one` | two-digit-plus-one | `addendA` two-digit, `addendB` single-digit; no ones regrouping |
| `two-digit-friends` | two-digit-friends | Both two-digit; no tens/ones regrouping; sum ≤ 99 |

### Problem

| Field | Change |
|-------|--------|
| `addendA` | Range depends on category (up to 99 for Champion) |
| `addendB` | Range depends on category (up to 99 for Champion) |

**Display**: Still `"{addendA} + {addendB} = ?"` — works for two-digit addends.

### SessionStatus

| v1 | v2 |
|----|-----|
| `idle` | Split into `landing` and `level-select` |
| `active` | unchanged |
| `completed` | unchanged |

```text
landing → level-select → active → completed
   ↑          ↑            ↑          │
   │          │            └──────────┘ Practice Again (→ active)
   │          └──────────────────────── Change Level (from completed)
   └──────────────────────────────────── Home (from level-select)
```

## Category Constraint Reference

### bigger-sums (Advanced)

| Constraint | Value |
|------------|-------|
| minSum | 21 |
| maxSum | 30 |
| minAddend | 6 |
| maxAddend | 24 |
| Extra | `min(addendA, addendB) <= 15` |

### two-digit-plus-one (Expert)

| Constraint | Value |
|------------|-------|
| addendA | 10–49 (two-digit) |
| addendB | 1–9 |
| sum | 31–50 |
| No regrouping | `(addendA % 10) + addendB < 10` |

### two-digit-friends (Champion)

| Constraint | Value |
|------------|-------|
| addendA, addendB | 10–99 |
| sum | ≤ 99 |
| No tens regrouping | `floor(a/10) + floor(b/10) < 10` |
| No ones regrouping | `(a % 10) + (b % 10) < 10` |

## Validation Rules (new)

| Rule ID | Entity | Rule |
|---------|--------|------|
| VR-007 | bigger-sums Problem | `21 <= sum <= 30` and `min(a,b) <= 15` |
| VR-008 | two-digit-plus-one | `addendA >= 10`, `addendB <= 9`, ones no carry, `31 <= sum <= 50` |
| VR-009 | two-digit-friends | Both addends ≥ 10, no regrouping, `sum <= 99` |
| VR-010 | FunFact collection | `length >= 8` |
| VR-011 | Landing flow | Default route renders landing, not level-select |
| VR-012 | sessionStorage | Unknown `levelId` → fallback `simple` |

## Entity Relationship Diagram (v2)

```text
LandingPageState ──indexes──► MathFunFact[]

DifficultyLevel 1──1 ProblemCategory
       │
       ▼
level-select ──starts──► PracticeSession 1──* Problem
                              │
                              ▼
                         AnswerAttempt[]

SessionSummary ──derived from── PracticeSession
```

## UI Preferences (sessionStorage) — unchanged keys

| Key | Type | Default |
|-----|------|---------|
| `lastLevelId` | LevelId | `simple` |
| `lastCategoryId` | CategoryId | `single-digit` |

Invalid stored ids coerce to defaults (VR-012).

# Data Model: Mental Math Addition Practice

**Feature**: `001-mental-math-addition` | **Date**: 2026-08-09

## Overview

All entities live in browser memory for v1. No server-side persistence. Types below are conceptual; implementation uses TypeScript interfaces in `src/types/`.

## Entities

### DifficultyLevel

Represents the coarse difficulty tier shown on the home screen.

| Field | Type | Rules |
|-------|------|-------|
| `id` | `"simple" \| "medium" \| "intermediate"` | Required; immutable enum |
| `label` | string | Display name, e.g. `"Simple"` |
| `defaultCategoryId` | CategoryId | Category pre-selected when level changes |

**Relationships**: One level maps to one primary category in v1 (1:1 for simplicity).

### ProblemCategory

Defines numeric constraints for problem generation.

| Field | Type | Rules |
|-------|------|-------|
| `id` | CategoryId | `"single-digit" \| "make-10" \| "teen-numbers"` |
| `label` | string | Kid-friendly display name |
| `levelId` | DifficultyLevel id | Must match level shown in UI |
| `minAddend` | number | `1` for all v1 categories |
| `maxAddend` | number | `9` for all v1 categories |
| `minSum` | number | `2`, `6`, or `11` per category |
| `maxSum` | number | `9`, `10`, or `20` per category |

**Validation**: `minAddend <= maxAddend`; generated sum must satisfy `minSum <= a + b <= maxSum`.

### Problem

A single addition exercise within a session.

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Unique within session, e.g. `"p-3"` |
| `addendA` | number | Integer 1–9 |
| `addendB` | number | Integer 1–9 |
| `correctSum` | number | `addendA + addendB` (derived, not stored separately in logic) |
| `categoryId` | CategoryId | Copied from session settings |
| `displayText` | string | e.g. `"4 + 5"` (derived) |

**Identity**: Two problems are duplicates if `(addendA, addendB)` or `(addendB, addendA)` match — treat as same for dedup purposes.

### AnswerAttempt

Records one user submission for a problem.

| Field | Type | Rules |
|-------|------|-------|
| `problemId` | string | References Problem.id |
| `submittedValue` | number \| null | Null if empty submission (not scored) |
| `isCorrect` | boolean | `submittedValue === correctSum` when submitted |
| `timestamp` | number | `Date.now()` at submission |

### PracticeSession

A 10-question round from start to summary.

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | UUID or timestamp-based |
| `levelId` | DifficultyLevel id | Set at session start |
| `categoryId` | CategoryId | Set at session start |
| `problems` | Problem[] | Length = 10 after generation |
| `attempts` | AnswerAttempt[] | Grows as child answers |
| `currentIndex` | number | 0–9; advances after each scored answer |
| `status` | SessionStatus | See state machine below |
| `startedAt` | number | Epoch ms |
| `completedAt` | number \| null | Set when status → `completed` |

### SessionSummary

Derived view at end of round (not persisted independently).

| Field | Type | Rules |
|-------|------|-------|
| `totalProblems` | number | Always `10` in v1 |
| `correctCount` | number | Count of `isCorrect === true` attempts |
| `levelLabel` | string | From DifficultyLevel |
| `categoryLabel` | string | From ProblemCategory |

## State Machine: PracticeSession.status

```text
idle → active → completed
         ↑         |
         └─────────┘  (practice again: new session, same or new settings)
```

| Status | Meaning | Allowed transitions |
|--------|---------|---------------------|
| `idle` | Home screen; no active round | → `active` on Start Practice |
| `active` | Showing problem `currentIndex` | → `completed` after 10th answer scored |
| `completed` | Summary visible | → `active` via Practice Again (new session) |

## UI Preferences (optional sessionStorage)

| Key | Type | Purpose |
|-----|------|---------|
| `lastLevelId` | DifficultyLevel id | Restore last selection on return visit |
| `lastCategoryId` | CategoryId | Restore last selection on return visit |

**Default when missing**: `simple` + `single-digit` (FR-013).

## Validation Rules Summary

| Rule ID | Entity | Rule |
|---------|--------|------|
| VR-001 | Problem | `addendA` and `addendB` ∈ [1, 9] |
| VR-002 | Problem | `addendA + addendB` within category sum bounds |
| VR-003 | PracticeSession | Exactly 10 unique problems per round |
| VR-004 | AnswerAttempt | Empty input does not create scored attempt |
| VR-005 | AnswerAttempt | Only numeric input accepted |
| VR-006 | SessionSummary | `correctCount <= totalProblems` |

## Entity Relationship Diagram

```text
DifficultyLevel 1──1 ProblemCategory
       │
       │ selected at start
       ▼
PracticeSession 1──* Problem
       │
       │ collects
       ▼
              AnswerAttempt *──1 Problem

SessionSummary ──derived from── PracticeSession + AnswerAttempt[]
```

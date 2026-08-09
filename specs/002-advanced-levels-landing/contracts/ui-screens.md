# Contract: UI Screens and Navigation (v2)

**Feature**: `002-advanced-levels-landing` | **Extends**: [001 ui-screens](../../001-mental-math-addition/contracts/ui-screens.md)

## Screens

### S0: Landing (NEW — default entry)

**Purpose**: Welcome child; build math curiosity before practice.

| Element | Behavior |
|---------|----------|
| Mascot | `MathMascot` SVG — friendly star with `+`; palette tokens only |
| Welcome headline | e.g. `"Welcome to Fun Math!"` |
| Subhead | e.g. `"Train your brain with addition!"` |
| Fun fact card | Shows one fact at a time from bundled list |
| Next Fact button | Cycles to next fact; wraps at end |
| Fact indicators | Optional dots showing position in set |
| Let's Practice! | Primary CTA → navigates to S1 (level-select) |

**Forbidden**: external images, auto-playing animation, more than 5 UI colors.

### S1: Level Select (was Home)

**Purpose**: Choose difficulty and start practice.

| Element | Behavior |
|---------|----------|
| Home / Back | Secondary control → returns to S0 |
| Level selector | 6 large buttons in progressive order: Simple → Champion |
| Level subtitle | One line per level from config `subtitle` |
| Champion hint | Optional non-blocking hint text when Champion selected |
| Category label | Read-only label for selected level's category |
| Start Practice | Primary CTA → S2 with new session |
| Defaults | Simple / Single Digit on first visit (FR-013 preserved) |

### S2: Practice (unchanged structure)

| Change | Detail |
|--------|--------|
| Problem display | Supports two-digit addends (e.g. `34 + 5 = ?`) |
| Level badge | Shows any of 6 levels |

All v1 forbidden elements still apply (no manipulatives).

### S3: Summary (unchanged structure)

| Element | Behavior |
|---------|----------|
| Practice Again | Same level → S2 (skips S0 and S1) |
| Change Level | → S1 only (skips S0) |

## Navigation graph (v2)

```text
S0 (Landing) ──Let's Practice──► S1 (Level Select) ──Start──► S2 (Practice) ──► S3 (Summary)
   ▲                                  ▲                            │                │
   │                                  │                            │                │
   └── Home───────────────────────────┘                            │                │
                                                                     │                │
                                        Practice Again (same level)──┘                │
                                        Change Level ───────────────────────────────────┘
```

## Fun facts content contract

**File**: `src/lib/funFacts.ts` (mirrors [fun-facts.json](./fun-facts.json))

| Rule | Requirement |
|------|-------------|
| Count | ≥ 8 facts |
| Length | ≤ 2 sentences each |
| Tone | Encouraging, curious, age 5–11 |
| Topics | Patterns, zero, doubles, shapes, everyday math |

## Color tokens

Unchanged from v1 — see [001 ui-screens](../../001-mental-math-addition/contracts/ui-screens.md). Mascot SVG fills/strokes MUST reference CSS variables only.

## Responsive breakpoints

| Viewport | Landing | Level select |
|----------|---------|--------------|
| Mobile (<768px) | Mascot above fact card; full-width CTA | Single-column level buttons ≥48px |
| Tablet+ | Centered card max-width 480px | 2×3 grid if space allows |

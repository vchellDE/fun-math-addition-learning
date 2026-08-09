# Contract: UI Screens and Navigation

**Feature**: `001-mental-math-addition` | **Type**: UI flow contract

## Screens

### S1: Home

**Purpose**: Select difficulty and start practice.

| Element | Behavior |
|---------|----------|
| Level selector | 3 large buttons: Simple, Medium, Intermediate |
| Category label | Auto-updates to match selected level (read-only in v1) |
| Start Practice | Primary CTA → navigates to S2 with new session |
| Defaults | Simple / Single Digit on first visit |

### S2: Practice

**Purpose**: Present one problem at a time; collect mental-math answer.

| Element | Behavior |
|---------|----------|
| Progress | `"Question {n} of 10"` |
| Problem display | `"{a} + {b} = ?"` large typography |
| Answer input | Numeric only; large field |
| Check button | Submits answer; disabled when empty |
| Feedback overlay | Brief correct/incorrect message; auto-advance ~1.5s |
| Level badge | Small label showing current level/category |

**Forbidden elements**: finger icons, counters, number lines, manipulatives.

### S3: Summary

**Purpose**: End-of-round results.

| Element | Behavior |
|---------|----------|
| Score | `"You got {correct} out of {total}!"` |
| Encouragement | Age-appropriate message based on score band |
| Practice Again | Same level → new session (S2) |
| Change Level | Return to S1 |

## Navigation graph

```text
S1 (Home) ──Start──► S2 (Practice) ──10 answers──► S3 (Summary)
  ▲                      │                              │
  │                      │                              │
  └──Change Level────────┴────Practice Again────────────┘
```

## Feedback copy contract

| Event | Message pattern |
|-------|-----------------|
| Correct | `"Great job!"` / `"Yes!"` / `"Nice!"` (rotate) |
| Incorrect | `"Good try! The answer is {sum}."` |
| Empty submit | `"Type your answer first."` |

Tone MUST be encouraging; no punitive language (FR-010).

## Responsive breakpoints

| Viewport | Layout rule |
|----------|-------------|
| Mobile (<768px) | Single column; full-width buttons ≥48px height |
| Tablet/Desktop | Centered card max-width 480px |

## Color tokens (CSS variables)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FFF8F0` | Page background |
| `--color-text` | `#2D3436` | Body text, numbers |
| `--color-primary` | `#4A90D9` | Buttons, links |
| `--color-success` | `#5CB85C` | Correct feedback |
| `--color-neutral` | `#BDC3C7` | Borders, disabled |

No additional colors without constitution amendment.

# Contract: UI Screens and Navigation (v3)

**Feature**: `003-voice-answer-input` | **Extends**: [002 ui-screens](../../002-advanced-levels-landing/contracts/ui-screens.md)

## Screens changed

Only **S2: Practice** changes. S0 (Landing), S1 (Level Select), S3 (Summary) unchanged.

### S2: Practice (v3)

**Purpose**: Mental addition with voice-first answer entry and number pad fallback.

#### Removed elements

| Element | v2 behavior | v3 |
|---------|-------------|-----|
| Text answer `<input>` | Numeric keyboard entry | **Removed** |
| Enter key submit | Submitted answer | **Removed** |

#### New / changed elements

| Element | Behavior |
|---------|----------|
| Hold to Speak button | Primary when `inputMode === 'voice'`; large; hold to record |
| Listening indicator | Button shows "Listening…" + `aria-pressed` while active |
| Heard answer banner | After release: "I heard: **N**" with confirm / try again |
| Mic permission prompt | First question only; Allow or Use Number Pad |
| Number pad | Visible when `inputMode === 'number-pad'` OR as fallback link from voice mode |
| Pad display | Read-only `<div role="status" aria-live="polite">` — not an input |
| Pad keys | 0–9, Clear, Check — minimum 48px tap targets |
| Switch to pad link | Small text under speak button: "Can't use voice? Tap numbers instead" |
| Space hint (desktop) | Optional subtle text: "Or hold Spacebar to speak" |

#### Unchanged elements

| Element | Behavior |
|---------|----------|
| Level badge | Same |
| Progress label | `Question n of 10` |
| Problem display | `{a} + {b} = ?` |
| Feedback banner | Correct / incorrect / empty — copy updated for voice |
| Input lock | Disabled during 1.5s feedback between questions |

#### Feedback copy updates

| Type | v2 message | v3 message |
|------|------------|------------|
| `empty` (voice) | "Type your answer first." | "Hold the button and say your answer." |
| `empty` (pad) | "Type your answer first." | "Tap the numbers, then press Check." |
| `correct` | Rotating encouraging messages | Unchanged |
| `incorrect` | "Good try! The answer is {n}." | Unchanged |

## Navigation graph (unchanged)

```text
S0 → S1 → S2 (v3 voice/pad) → S3
```

No new routes or session states.

## Layout (practice screen)

```text
┌─────────────────────────────────┐
│  Level badge                    │
│  Question 3 of 10               │
│       7 + 5 = ?                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Hold to Speak        │    │  ← voice mode
│  └─────────────────────────┘    │
│  Can't use voice? Tap numbers   │
│                                 │
│  ─── OR (number-pad mode) ───   │
│  ┌─────────────────────────┐    │
│  │         12              │    │  ← read-only display
│  └─────────────────────────┘    │
│  [1] [2] [3]                    │
│  [4] [5] [6]                    │
│  [7] [8] [9]                    │
│  [Clear] [0] [Check]            │
│                                 │
│  I heard: 12  [That's Right]    │  ← confirming phase only
│               [Try Again]       │
│                                 │
│  Feedback banner                │
└─────────────────────────────────┘
```

## Color tokens

Unchanged from v1/v2. Speak button uses `--color-primary`. Listening state may use subtle opacity pulse — no sixth color.

## Responsive breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column; full-width speak button; 3×4 pad grid |
| Tablet+ | Same; max-width card unchanged |

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| No keyboard-only trap | Pad fully operable by touch; Space optional for voice |
| Screen reader | `aria-live` on heard display and pad display |
| Focus | No autofocus on hidden inputs; speak button focusable |
| Color | Correct/incorrect still use text + banner, not color alone |

## Forbidden (v3 additions)

- `<input>`, `<textarea>`, `contenteditable` for answers
- `inputMode="numeric"` fields
- OS software keyboard invocation
- Always-on microphone indicator without user hold

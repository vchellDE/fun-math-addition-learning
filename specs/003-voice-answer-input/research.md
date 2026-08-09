# Research: Voice Answer Input (No Keyboard Typing)

**Feature**: `003-voice-answer-input` | **Date**: 2026-08-09

## R1: Speech recognition technology

**Decision**: Use the browser **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) with no additional npm packages.

**Rationale**: Spec requires client-side voice with no backend; Web Speech API is built into Chrome, Edge, and Safari (with prefix). Keeps Simplicity First — zero new dependencies, matches existing Vite + React stack.

**Alternatives considered**:
- **Cloud STT (Google Cloud Speech, Whisper API)** — Rejected: needs API keys, network latency, privacy concerns for children's voice.
- **npm package wrapper only** — Rejected: still wraps same browser API; adds dependency without benefit.
- **Record audio + upload** — Rejected: complexity; violates offline/simple goals.

## R2: Push-to-talk interaction model

**Decision**: Start recognition on **pointer down** (or Space key down) on "Hold to Speak"; call `recognition.stop()` on **pointer up** (or Space key up). Use `continuous: false`, `interimResults: false`, `lang: 'en-US'`, `maxAlternatives: 1`.

**Rationale**: Matches user story (press, speak, release); avoids always-on listening (spec rejected); minimizes accidental captures in noisy rooms.

**Alternatives considered**:
- **Tap once to start, tap again to stop** — Rejected: less intuitive for children; spec describes hold-to-release.
- **Auto-stop after silence** — Rejected: unreliable for quiet children; harder to test.

## R3: Microphone permission flow

**Decision**: On first practice question in `voice` mode, show `MicPermissionPrompt` with parent-friendly copy. Call `navigator.mediaDevices.getUserMedia({ audio: true })` once to trigger browser permission, then release the stream immediately before starting `SpeechRecognition`. If denied or `NotAllowedError`, switch `inputMode` to `number-pad` for the session (persist in `sessionStorage`).

**Rationale**: FR-007 requires plain-language permission; FR-008 requires pad fallback without leaving practice. Pre-requesting via `getUserMedia` gives consistent UX across browsers before recognition starts.

**Alternatives considered**:
- **Permission only inside recognition** — Rejected: opaque errors; harder to explain to parents.
- **Block practice until mic granted** — Rejected: violates SC-003 (100% completable without mic).

## R4: Transcript → number parsing

**Decision**: Implement `speechParser.ts` locally with:
1. Normalize transcript (lowercase, strip punctuation, collapse whitespace)
2. Try digit extraction (`/\d+/`) if spoken as numerals
3. Match whole-string against English word map for 0–99 ("zero"…"ninety nine", including "twenty one" / "twenty-one")
4. Return `{ ok: true, value }` or `{ ok: false, reason: 'no-number' | 'ambiguous' }`

**Rationale**: Web Speech API returns text, not numbers; children say "seven" or "twelve" per spec FR-004. Local parser is testable without mic and handles 0–99 for Champion level.

**Alternatives considered**:
- **Regex digits only** — Rejected: misses word forms ("fifteen").
- **Third-party NLP library** — Rejected: overkill; bundle size; violates simplicity.

## R5: Confirmation and retry UX

**Decision**: After recognition, enter `confirming` phase: show `HeardAnswerBanner` with "I heard: **N**" and buttons **That's Right** (submits) and **Try Again** (re-listen once). If parser fails, show encouraging retry without scoring. Maximum **one** retry per problem (FR-006); second submission finalizes attempt even if wrong.

**Rationale**: Spec User Story 2 — children must see what was heard; misrecognition is common. Explicit confirm step reduces accidental wrong scores.

**Alternatives considered**:
- **Auto-submit immediately** — Rejected: frustrates users when misheard; fails User Story 2.
- **Unlimited retries** — Rejected: delays session; spec limits to one retry.

## R6: Number pad fallback design

**Decision**: `NumberPad` component with read-only display (`<div role="status">`) showing assembled digits, buttons 0–9 in phone layout, **Clear**, and **Check**. Tapping digits appends; Clear resets. No `<input type="text">` — prevents OS keyboard (FR-001).

**Rationale**: Spec FR-008; works in all browsers and jsdom tests. Read-only display satisfies "no keyboard typing" while showing current entry.

**Alternatives considered**:
- **`<input inputMode="none" readonly>`** — Rejected: some mobile browsers still show keyboard on focus.
- **Contenteditable div** — Rejected: can still invoke IME/keyboard.

## R7: Space key shortcut

**Decision**: On `PracticeScreen` mount, add `keydown`/`keyup` listeners for `Space` when `inputMode === 'voice'` and not `inputLocked`. `preventDefault()` on Space down to avoid page scroll. Reuse same `usePushToTalk` handlers as the on-screen button.

**Rationale**: Spec FR-009; supports laptop users without digit typing. Only one non-numeric key allowed.

**Alternatives considered**:
- **Any key hold** — Rejected: conflicts with browser shortcuts; spec names Space only.
- **Enter to submit voice** — Rejected: not in spec; adds confusion with removed text field.

## R8: Browser support matrix

**Decision**:

| Browser | Voice | Fallback |
|---------|-------|----------|
| Chrome / Edge (desktop & Android) | ✅ Web Speech API | Pad if denied |
| Safari (macOS, iOS) | ✅ `webkitSpeechRecognition` | Pad if denied |
| Firefox | ❌ No stable Web Speech API | Pad only + one-line parent note |

Detect via `typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)`.

**Rationale**: Spec assumption: Chrome, Safari, Edge primary; Firefox documented fallback per edge case.

## R9: Testing strategy

**Decision**:
- **Unit**: `speechParser.test.ts` — 30+ cases for words, digits, hyphenated teens, noise words stripped
- **Component**: Mock `window.SpeechRecognition` class; fire `onresult` with synthetic transcript
- **Integration**: `PracticeFlow.test.tsx` uses number pad (stable in jsdom); voice path tested in `VoiceInput.test.tsx`
- **Manual**: quickstart scenarios VS-001–VS-005 with real microphone

**Rationale**: jsdom has no real mic; pad path proves full session scoring unchanged (FR-012). Parser unit tests protect recognition accuracy contract (SC-001).

**Alternatives considered**:
- **E2E Playwright with fake audio** — Rejected: out of scope for v3; manual quickstart sufficient.

## R10: Feedback and input lock

**Decision**: Reuse existing `inputLocked` / `awaitingAdvance` in `App.tsx`. While locked, disable Hold to Speak, Number Pad, and Space handler. Empty voice release shows `FeedbackType: 'empty'` with updated copy.

**Rationale**: FR-011 matches v1 behavior; prevents double-scoring during 1.5s feedback delay.

## Summary

All technical unknowns resolved. User confirmed **voice first + number pad fallback**. No NEEDS CLARIFICATION items remain. Implementation uses Web Speech API + local parser with no new dependencies.

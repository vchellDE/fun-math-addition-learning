# Contract: Voice Input (v4 — Reliability Extensions)

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

**Supersedes**: [003 voice-input.md](../003-voice-answer-input/contracts/voice-input.md) for recognition config and Space gating. Component contracts unchanged unless noted.

## Module: `src/lib/speechRecognition.ts`

### Configuration change

| Property | v3 | v4 |
|----------|----|----|
| `maxAlternatives` | `1` | `3` |
| `continuous` | `false` | `false` (unchanged) |
| `interimResults` | `false` | `false` (unchanged) |

### onresult behavior

```typescript
recognition.onresult = (event) => {
  const alternatives: string[] = [];
  for (let i = 0; i < event.results[0].length; i++) {
    alternatives.push(event.results[0][i].transcript);
  }
  options.onResult(alternatives); // signature change: string → string[]
};
```

Caller (`usePushToTalk`) tries each alternative with `parseSpokenNumber` until one succeeds.

## Module: `src/lib/usePushToTalk.ts`

### Release grace

After `stop()`:

1. If `onresult` already fired → no grace needed
2. Else start `RELEASE_GRACE_MS` timer; if result arrives, cancel timer
3. If timer fires with no result → `onEmpty()`

### Space gating (PT-006 new)

| Condition | Space active |
|-----------|--------------|
| `enabled && spaceEnabled` | yes |
| `showMicPrompt === true` | **no** (parent passes `spaceEnabled: false`) |
| `inputLocked` | no |
| `document.activeElement` is `BUTTON.link-button` | no (mode-switch links) |

### Session cleanup

On `startListening`, call `sessionRef.current?.abort()` if a previous session exists.

## Component: `HeardAnswerBanner`

**Unchanged UI** — still shows "I heard: N" and optional Try Again. Auto-confirm delay now from `timingConfig` (350 ms).

## Component: `PracticeScreen`

### spaceEnabled prop wiring

```typescript
spaceEnabled: voiceEnabled && !showMicPrompt,
```

### parse call

```typescript
parseSpokenNumber(transcript, { expectedMax: problem.addendA + problem.addendB });
```

For multiple alternatives from hook, loop until first `ok`.

## Forbidden

- `continuous: true` always-on listening
- Different recognition settings for Space vs button
- New buttons or settings for "slow mode" / "fast mode"

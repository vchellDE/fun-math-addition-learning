# Contract: Voice Input (Push-to-Talk)

**Feature**: `003-voice-answer-input` | **Date**: 2026-08-09

## Module: `src/lib/speechRecognition.ts`

### Capability detection

```typescript
isSpeechRecognitionSupported(): boolean
```

Returns `true` when `SpeechRecognition` or `webkitSpeechRecognition` exists on `window`.

### Permission

```typescript
requestMicrophonePermission(): Promise<'granted' | 'denied'>
```

Uses `navigator.mediaDevices.getUserMedia({ audio: true })`, immediately stops all tracks on success, returns status.

### Recognition session

```typescript
createRecognitionSession(options: {
  lang?: string;           // default 'en-US'
  onResult: (transcript: string) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}): {
  start: () => void;
  stop: () => void;
  abort: () => void;
}
```

**Configuration** (fixed):

| Property | Value |
|----------|-------|
| `continuous` | `false` |
| `interimResults` | `false` |
| `maxAlternatives` | `1` |
| `lang` | `en-US` |

**Lifecycle**:

1. `start()` — called on pointer/key down
2. Child speaks while holding
3. `stop()` — called on pointer/key up; waits for `onresult` or `onerror` then `onEnd`
4. `abort()` — on unmount or `inputLocked`

### Error handling

| Error | User-facing behavior |
|-------|---------------------|
| `not-allowed` | Switch to number pad; show parent note |
| `no-speech` | Gentle "I didn't catch that — try again" |
| `network` | Suggest number pad; log debug |
| `aborted` | Silent (user released early) |

## Module: `src/lib/usePushToTalk.ts`

### Hook signature

```typescript
usePushToTalk(options: {
  enabled: boolean;
  onTranscript: (text: string) => void;
  onEmpty: () => void;
  onError: (code: string) => void;
}): {
  phase: VoiceCapturePhase;
  isListening: boolean;
  speakButtonProps: {
    onPointerDown: () => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    'aria-pressed': boolean;
  };
}
```

### Rules

| Rule | Requirement |
|------|-------------|
| PT-001 | `enabled` false when `inputLocked` or `inputMode !== 'voice'` |
| PT-002 | `onPointerLeave` while listening calls `stop()` (cancel if finger slides off) |
| PT-003 | Hold longer than 5s auto-stops with `onEmpty` |
| PT-004 | Space key down/up wired when practice screen mounted and voice enabled |
| PT-005 | `preventDefault` on Space keydown when enabled |

## Component: `HoldToSpeakButton`

| Prop | Type | Notes |
|------|------|-------|
| `disabled` | boolean | When locked or processing |
| `isListening` | boolean | Visual pulse using existing primary color |
| `...speakButtonProps` | from hook | Pointer handlers |

**Accessibility**:

- `aria-label`: "Hold to Speak your answer"
- `aria-pressed` while listening
- Minimum touch target 48×48px (constitution)

**Copy**: Label **"Hold to Speak"**; sublabel while listening: **"Listening…"**

## Component: `MicPermissionPrompt`

Shown once per session when `inputMode === 'voice'` and permission not yet granted.

| Element | Copy (example) |
|---------|----------------|
| Headline | "We need your microphone" |
| Body | "Hold the button and say your answer out loud. A grown-up may need to tap Allow." |
| Primary | "Allow Microphone" |
| Secondary | "Use Number Pad Instead" |

## Component: `HeardAnswerBanner`

| Element | Behavior |
|---------|----------|
| Display | "I heard: **{N}**" (large number) |
| Primary | "That's Right" → calls `onConfirm(N)` |
| Secondary | "Try Again" → visible only if `!retryUsed`; re-enters listening |

## Input mode switching

| Action | Result |
|--------|--------|
| User taps "Use Number Pad Instead" | `inputMode = 'number-pad'`; save sessionStorage |
| User grants mic after pad mode | Next session can use voice (optional link "Try voice again" on pad — P3, optional) |
| Unsupported browser | Skip prompt; start in pad mode with banner for parent |

## Forbidden

- Text `<input>` for answer entry
- Always-on microphone (`continuous: true`)
- Digit keys populating any answer field
- More than one retry per problem
- Technical error strings shown to child ("DOMException", etc.)

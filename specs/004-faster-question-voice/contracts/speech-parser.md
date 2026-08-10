# Contract: Speech Parser (v4 — Reliability Extensions)

**Feature**: `004-faster-question-voice` | **Date**: 2026-08-10

**Supersedes**: [003 speech-parser.md](../003-voice-answer-input/contracts/speech-parser.md) for new options and homophone rules. Base API unchanged.

## Module: `src/lib/speechParser.ts`

### Public API (extended)

```typescript
export interface ParseSpeechOptions {
  /** Tie-breaker when multiple valid numbers parsed; typically problem sum or level max */
  expectedMax?: number;
}

export function parseSpokenNumber(
  transcript: string,
  options?: ParseSpeechOptions,
): ParseSpeechResult;
```

### New normalization: homophone map

Applied after lowercase, before word parsing:

| Input token | Maps to |
|-------------|---------|
| `fitty`, `fiddy` | `fifty` |
| `fiveteen` | `fifteen` |
| `forteen` | `fourteen` |
| `thirtee` | `thirteen` |

(Token-level replacement on whitespace-split words.)

### New normalization: global filler removal

Remove tokens anywhere in phrase (not only prefix):

`um`, `uh`, `like`, `it's`, `its`, `the`, `answer`, `is`, `equals`

**Note**: Multi-word filler `the answer is` still stripped as a phrase first (v3 behavior), then per-token cleanup.

### Alternative transcript selection (caller responsibility)

`speechRecognition.ts` passes each alternative to `parseSpokenNumber` in order; **first `ok: true` wins**.

If multiple alternatives parse to different values and all `ok`, apply `expectedMax` tie-break:

1. Filter candidates where `value <= expectedMax` (when `expectedMax` provided)
2. If exactly one remains → use it
3. If still tied → return `ambiguous`

Without `expectedMax`, first successful parse wins (index order).

### PracticeScreen integration

```typescript
const expectedMax = problem.addendA + problem.addendB;
parseSpokenNumber(transcript, { expectedMax });
```

`expectedMax` is the **current problem's correct sum** — used only to disambiguate STT confusions (15 vs 50), not to force the correct answer when transcript clearly says another number.

### New unit test cases (minimum)

| Category | Examples |
|----------|----------|
| Homophones | `fitty` → 50, `fiveteen` → 15 |
| Mid-phrase filler | `seven um` → 7, `it's seven` → 7 |
| expectedMax tie | transcripts producing 15 and 50 with `expectedMax: 17` → 15 |
| Alternatives (integration) | mock STT returns `fifty` alt1 + `fifteen` alt2 → parse alt2 first if alt1 fails expectedMax |

### Unchanged from v3

- Output range 0–99
- Reasons: `no-number`, `ambiguous`, `out-of-range`
- Digit and word parsing order for single-transcript path

## Forbidden

- Passing correct answer as a hint to force a match
- External NLP libraries
- Returning a number when no token matches

# Contract: Speech Parser (Transcript → Number)

**Feature**: `003-voice-answer-input` | **Date**: 2026-08-09

## Module: `src/lib/speechParser.ts`

### Public API

```typescript
export type ParseSpeechResult =
  | { ok: true; value: number; rawTranscript: string }
  | { ok: false; reason: 'no-number' | 'ambiguous' | 'out-of-range'; rawTranscript: string };

export function parseSpokenNumber(transcript: string): ParseSpeechResult;
```

### Normalization pipeline

1. Trim whitespace
2. Lowercase
3. Remove punctuation except hyphen between words (`twenty-one` → `twenty one`)
4. Collapse multiple spaces
5. Strip leading filler: `um`, `uh`, `it's`, `the answer is`, `equals`

### Parsing strategy (order matters)

| Step | Method | Example |
|------|--------|---------|
| 1 | If normalized string matches `/^\d+$/`, parse integer | `"12"` → 12 |
| 2 | If contains isolated digit sequence, use first match | `"the answer is 7"` → 7 |
| 3 | Whole-string lookup in WORD_MAP (0–19, tens 20–90) | `"seven"` → 7 |
| 4 | Compound tens + ones: `"(twenty|thirty|...|ninety) (one|two|...|nine)"` | `"twenty one"` → 21 |
| 5 | If multiple distinct numbers detected | → `ambiguous` |
| 6 | If value > 99 | → `out-of-range` |
| 7 | No match | → `no-number` |

### WORD_MAP coverage (required)

**0–19**: zero, one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen

**Tens**: twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety

### Accepted variants

| Spoken | Parsed |
|--------|--------|
| `seven` | 7 |
| `twelve` | 12 |
| `twenty one` | 21 |
| `twenty-one` | 21 |
| `thirty four` | 34 |
| `oh seven` | 7 (treat `oh` as zero prefix for single digit) |
| `7` | 7 |

### Rejected examples

| Spoken | Result |
|--------|--------|
| `one two three` | `ambiguous` (multiple numbers) |
| `one hundred` | `out-of-range` |
| `hello` | `no-number` |
| `` (empty) | `no-number` |

## Unit test matrix (minimum)

File: `tests/unit/speechParser.test.ts`

| Category | Count | Examples |
|----------|-------|----------|
| Single digits words | 10 | one…nine |
| Teens | 10 | ten…nineteen |
| Tens alone | 8 | twenty…ninety |
| Compounds | 10 | twenty one, thirty four, ninety nine |
| Digit strings | 5 | "7", "12", "34" |
| Filler phrases | 5 | "um seven", "the answer is twelve" |
| Failures | 8 | empty, hello, one two, hundred |

**Pass criteria**: All cases match expected `value` or `reason`.

## Integration with scoring

Parser output is **not** auto-scored. Flow:

1. `parseSpokenNumber(transcript)` → result
2. If `ok`, show `HeardAnswerBanner` with `value`
3. User confirms → `onSubmit(value)` → existing `getCorrectSum` comparison in `App.tsx`

Parser does not know the correct answer — separation of concerns.

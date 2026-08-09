# Contract: Problem Generator (v2 extension)

**Feature**: `002-advanced-levels-landing` | **Extends**: [001 problem-generator](../../001-mental-math-addition/contracts/problem-generator.md)

## Purpose

Extends `generateRound()` to support three new categories while preserving v1 behavior for existing categories.

## Input

```typescript
interface GenerateRoundInput {
  categoryId:
    | 'single-digit'
    | 'make-10'
    | 'teen-numbers'
    | 'bigger-sums'
    | 'two-digit-plus-one'
    | 'two-digit-friends';
  count: number; // default 10
}
```

## Output

Unchanged from v1: `{ problems: Problem[]; categoryId: CategoryId }`.

## Generator profiles

Dispatch on `category.generatorProfile` from `category-config.json`.

### Profile: `uniform-addends`

**Categories**: single-digit, make-10, teen-numbers, bigger-sums

1. Loop `a` from `minAddend` to `maxAddend`, `b` same range.
2. Keep pair if `minSum <= a + b <= maxSum`.
3. For `bigger-sums` only: also require `min(a, b) <= maxSmallerAddend` (15).
4. Dedup unordered pairs; shuffle; sample `count`.

### Profile: `two-digit-plus-one`

**Category**: two-digit-plus-one

1. Loop `a` from 10 to 49 (two-digit).
2. Loop `b` from 1 to 9.
3. Keep if `(a % 10) + b < 10` and `31 <= a + b <= 50`.
4. Dedup, shuffle, sample.

### Profile: `two-digit-friends`

**Category**: two-digit-friends

1. Loop `a` from 10 to 99, `b` from 10 to 99.
2. Keep if `floor(a/10) + floor(b/10) < 10` and `(a%10)+(b%10) < 10` and `a + b <= 99`.
3. Dedup, shuffle, sample.

## Invariants (all categories)

| ID | Invariant |
|----|-----------|
| INV-001 | `problems.length === min(count, poolSize)` |
| INV-002 | No duplicate unordered pairs in one round |
| INV-003 | Every problem satisfies category-specific rules |
| INV-004 | All addends are positive integers |

## Category-specific invariants

| categoryId | INV |
|------------|-----|
| bigger-sums | `21 <= sum <= 30`, `min(a,b) <= 15` |
| two-digit-plus-one | `a >= 10`, `b <= 9`, `(a%10)+b < 10`, `31 <= sum <= 50` |
| two-digit-friends | `a,b >= 10`, no regrouping, `sum <= 99` |

## Test vectors

| categoryId | Valid example | Invalid (must never generate) |
|------------|---------------|-------------------------------|
| bigger-sums | `15 + 8 = 23` | `20 + 12 = 32` (min addend > 15) |
| bigger-sums | `9 + 22 = 31` | `4 + 5 = 9` (sum too low) |
| two-digit-plus-one | `34 + 5 = 39` | `38 + 7 = 45` (ones regroup) |
| two-digit-plus-one | `42 + 3 = 45` | `25 + 4 = 29` (sum < 31) |
| two-digit-friends | `23 + 45 = 68` | `28 + 37 = 65` (ones regroup) |
| two-digit-friends | `31 + 52 = 83` | `55 + 48 = 103` (sum > 99) |

## Errors

Same as v1: `InvalidCategoryError`, `InvalidCountError`.

## Implementation note

Remove hard-coded category allowlist in `generateRound()`; validate against loaded config instead.

# Contract: Problem Generator

**Feature**: `001-mental-math-addition` | **Type**: Internal module contract

## Purpose

Defines the public interface for generating addition problems. All practice rounds MUST use this module so numeric ranges stay aligned with the spec and data model.

## Input

```typescript
interface GenerateRoundInput {
  categoryId: 'single-digit' | 'make-10' | 'teen-numbers';
  count: number; // default 10
}
```

## Output

```typescript
interface Problem {
  id: string;
  addendA: number;
  addendB: number;
  categoryId: CategoryId;
}

interface GenerateRoundResult {
  problems: Problem[];
  category: ProblemCategoryConfig;
}
```

## Behavior

1. **Load category config** for `categoryId` (see `category-config.json`).
2. **Build candidate pool**: all pairs `(a, b)` where `a, b ∈ [1, 9]` and `minSum ≤ a + b ≤ maxSum`.
3. **Sample** `count` unique problems; treat `(a,b)` and `(b,a)` as the same for dedup.
4. **Return** problems in random order.

## Invariants (MUST hold for every call)

| ID | Invariant |
|----|-----------|
| INV-001 | `problems.length === count` |
| INV-002 | No two problems share the same unordered pair of addends |
| INV-003 | Every problem satisfies its category sum bounds |
| INV-004 | Every addend is an integer from 1 to 9 |

## Errors

| Condition | Result |
|-----------|--------|
| Unknown `categoryId` | Throw `InvalidCategoryError` |
| `count < 1` | Throw `InvalidCountError` |
| `count` > pool size | Return all unique problems in pool (pool sizes are 36+ for each category; not expected for count=10) |

## Test vectors

| categoryId | Valid example | Invalid example (must never generate) |
|------------|---------------|--------------------------------------|
| `single-digit` | `3 + 4 = 7` | `5 + 6 = 11` |
| `make-10` | `7 + 3 = 10` | `2 + 3 = 5` |
| `teen-numbers` | `8 + 5 = 13` | `3 + 4 = 7` |

# Quickstart: Advanced Levels & Kids Landing Page

**Feature**: `002-advanced-levels-landing` | **Date**: 2026-08-09

Validation guide for proving v2 works end-to-end after implementation.

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Modern browser (Chrome, Safari, Firefox)
- v1 app already implemented at repo root

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run tests

```bash
npm test
```

**Expected**: All v1 tests still pass; new tests cover `bigger-sums`, `two-digit-plus-one`, `two-digit-friends` invariants and landing navigation.

## Build for production

```bash
npm run build
npm run preview
```

**Expected**: Landing page is the first screen in preview build.

## Manual validation scenarios

### VS-001: Landing page first impression (SC-001, SC-002)

1. Open app in incognito.
2. Confirm landing screen appears (not level picker).
3. Tap **Next Fact** at least 3 times; facts change and wrap.
4. Tap **Let's Practice!** within 60 seconds.

**Pass**: Reach level-select without adult help.

### VS-002: Navigation shortcuts (SC-006, User Story 4)

1. From level-select, tap **Home** → landing appears.
2. Go to level-select, start Simple round, finish summary.
3. Tap **Practice Again** → practice starts immediately (no landing).
4. Tap **Change Level** → level-select (not landing).

**Pass**: Repeat practice is one tap; change level skips landing.

### VS-003: Six-level progression (SC-004)

1. On level-select, confirm 6 levels visible in order: Simple → Champion.
2. Select **Advanced**, start practice.
3. Verify each sum is 21–30.
4. Repeat for **Expert** (sums 31–50, e.g. `34 + 5`) and **Champion** (two-digit + two-digit, no obvious carry).

**Pass**: Advanced+ levels visible and problems match bounds.

### VS-004: New category automated conformance (SC-003)

```bash
npm test -- problemGenerator
```

**Pass**: Generator tests assert invariants for all 6 categories; 100 random rounds per new category pass property checks.

### VS-005: Kid-friendly visuals (constitution IV, V)

1. View landing on mobile DevTools (375px width).
2. Count distinct UI colors across landing + practice.

**Pass**: ≤5 colors; mascot visible; fact text readable without horizontal scroll.

### VS-006: v1 regression

1. Run full test suite.
2. Complete Simple and Intermediate rounds as in [001 quickstart](../001-mental-math-addition/quickstart.md).

**Pass**: v1 behavior unchanged for original three levels.

### VS-007: Fun facts bundled (SC-005)

1. Open DevTools → Network tab.
2. Load landing and cycle facts.

**Pass**: No network requests for fact content.

## Related artifacts

- Data model: [data-model.md](./data-model.md)
- Category config: [contracts/category-config.json](./contracts/category-config.json)
- Problem generator: [contracts/problem-generator.md](./contracts/problem-generator.md)
- UI screens: [contracts/ui-screens.md](./contracts/ui-screens.md)
- Fun facts: [contracts/fun-facts.json](./contracts/fun-facts.json)

## Next command

Run **`/speckit-tasks`** to generate `tasks.md`, then **`/speckit-implement`** to build.

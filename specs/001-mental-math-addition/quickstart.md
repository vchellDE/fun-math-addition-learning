# Quickstart: Mental Math Addition Practice

**Feature**: `001-mental-math-addition` | **Date**: 2026-08-09

Validation guide for proving the feature works end-to-end after implementation.

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Modern browser (Chrome, Safari, Firefox)

## Local setup

```bash
# From repository root (after implementation creates package.json)
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Run tests

```bash
npm test              # unit + component tests
npm run test:coverage # optional coverage report
```

**Expected**: All tests pass; problem-generator tests cover all three categories.

## Build for production

```bash
npm run build
npm run preview       # serves dist/ locally
```

**Expected**: `dist/` contains static assets; preview URL loads home screen.

## Manual validation scenarios

### VS-001: First-time child flow (SC-001)

1. Open app in browser (incognito).
2. Without instructions, tap **Start Practice** within 10 seconds.
3. Answer 10 problems (mix correct/incorrect).
4. View summary screen.

**Pass**: Round completes in under 5 minutes; summary shows correct count.

### VS-002: Category conformance (SC-003)

1. Select **Simple** → start practice.
2. For each problem, mentally verify sum ≤ 9.
3. Repeat for **Medium** (sums 6–10) and **Intermediate** (sums 11–20).

**Pass**: No problem violates category bounds.

### VS-003: No duplicates in round (FR-014)

1. Start any practice round.
2. Record all `(a, b)` pairs shown.

**Pass**: No duplicate unordered pairs in the same round.

### VS-004: Empty and invalid input (edge cases)

1. On a problem, tap **Check** without typing.

**Pass**: Gentle prompt; problem not marked wrong; stays on same question.

2. Attempt to type letters.

**Pass**: Input blocked or stripped; only digits accepted.

### VS-005: Kid-friendly UI (SC-006, constitution)

1. Walk through all screens.

**Pass**: ≤5 colors; no finger/manipulative graphics; buttons large on mobile viewport (DevTools device mode).

### VS-006: Render deployment (SC-004)

1. Push to GitHub connected to Render Static Site.
2. Wait for deploy; open public URL on phone.

**Pass**: Home screen loads within 5 seconds; complete one practice round.

## Render deploy checklist

| Setting | Value |
|---------|-------|
| Service type | Static Site |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| SPA fallback | `/*` → `/index.html` |

## Related artifacts

- Data model: [data-model.md](./data-model.md)
- Problem generator contract: [contracts/problem-generator.md](./contracts/problem-generator.md)
- UI screen contract: [contracts/ui-screens.md](./contracts/ui-screens.md)
- Category config: [contracts/category-config.json](./contracts/category-config.json)

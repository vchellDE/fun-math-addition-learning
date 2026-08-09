# Fun Math Addition Learning

A kid-friendly web app for mental math addition practice. Children complete 10-question rounds across three levels (Simple, Medium, Intermediate) without finger-counting aids.

## Quick start

### Prerequisites

- Node.js 20 LTS
- npm 10+

### Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build and preview

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test
```

## How to use

1. Pick a level: **Simple**, **Medium**, or **Intermediate**
2. Tap **Start Practice**
3. Solve each addition problem in your head and type the answer
4. Get encouraging feedback after each question
5. See your score at the end and practice again or change level

## Difficulty levels

| Level | Category | Sum range |
|-------|----------|-----------|
| Simple | Single Digit | 2–9 |
| Medium | Make 10 | 6–10 |
| Intermediate | Teen Numbers | 11–20 |

## Deploy to Render

This app is a static site. Use the included `render.yaml` or configure manually:

1. Push this repo to GitHub
2. In [Render](https://render.com), create a **Static Site**
3. Connect your GitHub repository
4. Settings:
   - **Build command**: `npm ci && npm run build`
   - **Publish directory**: `dist`
   - **Rewrite rule**: `/*` → `/index.html` (SPA fallback)
5. Deploy and copy your public URL

**Public URL**: _Deploy via Render Blueprint (`render.yaml`) or Static Site settings, then paste your URL here._

Example: `https://fun-math-addition.onrender.com`

### One-click via Render Blueprint

1. Push this repo to GitHub
2. In Render Dashboard → **New** → **Blueprint**
3. Connect the repository (Render reads `render.yaml` automatically)
4. Approve and deploy
5. Copy the generated `.onrender.com` URL into the line above

## Spec-driven development

This repo uses [GitHub Spec Kit](https://github.com/github/spec-kit) (CLI `specify` v0.15.0) with the **Cursor** agent integration.

| Step | Skill | Purpose |
|------|-------|---------|
| 1 | `/speckit-constitution` | Establish project principles |
| 2 | `/speckit-specify` | Create a feature specification |
| 3 | `/speckit-plan` | Create an implementation plan |
| 4 | `/speckit-tasks` | Generate actionable tasks |
| 5 | `/speckit-implement` | Execute the implementation |

Feature spec: `specs/001-mental-math-addition/`

## Project layout

```
src/
  components/     # Home, Practice, Summary screens
  lib/            # Problem generator, validators, categories
  styles/         # 5-color palette and global CSS
specs/            # Feature specs and design artifacts
```

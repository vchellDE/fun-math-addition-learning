<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: Initial adoption — template placeholders replaced with 5 product principles
- Added sections: Design & UX Constraints, Development Workflow, Governance
- Removed sections: Template placeholder comments and generic examples
- Follow-up TODOs: None
-->

# Fun Math Addition Learning Constitution

## Core Principles

### I. Simplicity First

Every screen, interaction, and codebase change MUST favor the simplest solution that meets the learning goal. Features that do not directly support addition practice MUST NOT be added. Rationale: young learners and caregivers need a focused tool, not a feature-heavy app.

### II. Intuitive UI

The interface MUST be usable without written instructions by a child (roughly ages 4–8) on first visit. Primary actions MUST be obvious, labels MUST use plain words, and navigation MUST have at most one clear path per task. Rationale: if a child needs help reading menus, the UI has failed.

### III. Kid-Friendly Experience

All copy, feedback, and interactions MUST be age-appropriate: encouraging tone, short sentences, large tap targets, and immediate visual feedback for correct and incorrect answers. Scary, punitive, or adult-oriented language MUST NOT be used. Rationale: learning math should feel safe and fun.

### IV. Limited Color Palette

The product MUST use a small, fixed palette (at most 4–5 colors including background and text). New colors MUST NOT be introduced without a constitution amendment. High contrast and color-blind-safe pairings MUST be preferred over decorative variety. Rationale: fewer colors reduce visual noise and keep focus on numbers.

### V. Learning Over Decoration

Visual and audio embellishments MUST support addition learning (e.g., celebrating a correct sum) and MUST NOT distract from the math task. Animation and sound MUST be optional or subtle by default. Rationale: delight should reinforce mastery, not compete with it.

## Design & UX Constraints

- **Colors**: Define and document a single shared palette (background, primary action, success, neutral text); reuse only those tokens.
- **Typography**: Large, readable fonts; avoid dense layouts.
- **Touch targets**: Minimum comfortable size for small fingers on tablets and phones.
- **Content**: Addition problems only in initial scope; difficulty ramps gradually.
- **Accessibility**: Sufficient contrast; do not rely on color alone to convey correctness.

## Development Workflow

- Follow Spec Kit workflow: constitution → spec → plan → tasks → implement → converge.
- Specs and plans MUST verify compliance with Core Principles before implementation.
- Complexity beyond these principles MUST be justified in the feature spec and rejected if it violates Simplicity or Limited Color Palette.
- Prefer incremental, reviewable changes aligned with `.specify/` artifacts.

## Governance

This constitution is the highest authority for product and engineering decisions in this repository. Amendments require updating `.specify/memory/constitution.md`, bumping `CONSTITUTION_VERSION` per semantic versioning, and recording rationale in the Sync Impact Report comment. All feature specs, plans, and PRs MUST be checked against Core Principles. Material UX or palette changes require explicit principle or constraint updates.

**Version**: 1.0.0 | **Ratified**: 2026-08-09 | **Last Amended**: 2026-08-09

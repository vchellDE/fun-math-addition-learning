# Feature Specification: Mental Math Addition Practice

**Feature Branch**: `001-mental-math-addition`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "Build a web app which help my daughter to build mathematical skill. Instead of using her hands I want her to practice using mind to do all the math. Starting from simple addition. Pick a category/level based on complexity — simple, medium, intermediate — and categories like single digit, results with two digits. Follow guidelines from children's math specialists and authorized teaching methods. Publish this app online."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Mental Addition (Priority: P1)

A child opens the app and completes a short round of addition problems in their head. Each problem shows two numbers to add; the child types or selects the answer without using fingers or physical counters. After each answer, the app gives immediate, encouraging feedback and moves to the next problem.

**Why this priority**: This is the core learning loop. Without it, the app delivers no value.

**Independent Test**: Can be fully tested by launching the app, answering 5 addition problems mentally, and receiving correct/incorrect feedback for each — delivering a complete practice session.

**Acceptance Scenarios**:

1. **Given** the app is open on the home screen, **When** the child taps "Start Practice", **Then** the first addition problem appears with two numbers and a clear way to enter an answer.
2. **Given** a problem is displayed, **When** the child submits the correct answer, **Then** the app shows brief positive feedback and presents the next problem.
3. **Given** a problem is displayed, **When** the child submits an incorrect answer, **Then** the app responds with gentle encouragement, shows the correct answer briefly, and moves to the next problem without punishment or harsh language.
4. **Given** a practice round of 10 problems, **When** the child completes the last problem, **Then** the app shows a simple session summary (problems attempted, correct count) and an option to practice again.

---

### User Story 2 - Choose Difficulty Level and Category (Priority: P2)

A parent or child selects a difficulty level (Simple, Medium, Intermediate) and a problem category before starting practice. Problems generated during the session match the selected level and category so practice stays appropriately challenging.

**Why this priority**: Progressive difficulty aligned with how children learn addition is essential for building mental math skill without frustration.

**Independent Test**: Can be tested by selecting each level/category combination, starting practice, and verifying that all generated problems fall within the defined number ranges for that selection.

**Acceptance Scenarios**:

1. **Given** the home screen, **When** the user selects "Simple" and category "Single Digit (sums up to 9)", **Then** all problems use single-digit addends and answers from 2 through 9.
2. **Given** the home screen, **When** the user selects "Medium" and category "Make 10 (sums up to 10)", **Then** all problems use single-digit addends with answers from 6 through 10, emphasizing number bonds to 10.
3. **Given** the home screen, **When** the user selects "Intermediate" and category "Teen Numbers (sums 11–20)", **Then** all problems use single-digit addends with two-digit answers from 11 through 20.
4. **Given** a level and category are selected, **When** practice begins, **Then** the chosen settings remain visible or easily identifiable so the child knows what they are practicing.

---

### User Story 3 - Kid-Friendly, Distraction-Free Experience (Priority: P3)

A child uses the app on a tablet or laptop without adult help. The interface uses large text, a limited color palette, obvious buttons, and no reading-heavy instructions. The experience supports mental math by showing only the problem — no finger-counting aids, number lines, or manipulative graphics that encourage counting on hands.

**Why this priority**: Aligns with project constitution principles (simplicity, intuitive UI, limited colors) and the parent's goal of mind-based practice.

**Independent Test**: Can be tested by observing a child (ages 5–8) complete one practice round without verbal instructions beyond "try this app."

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** they land on the home screen, **Then** they can identify how to start practice within 10 seconds without reading a manual.
2. **Given** any screen in the app, **When** viewed on a tablet or phone, **Then** all interactive elements are large enough for a child to tap comfortably.
3. **Given** a problem screen, **When** the problem is shown, **Then** no finger icons, counting objects, or hand-based counting prompts appear.
4. **Given** the full app, **When** colors are counted, **Then** at most 5 distinct colors are used across backgrounds, text, actions, and feedback states.

---

### User Story 4 - Public Online Access (Priority: P4)

A parent deploys the app so it is reachable at a public web address. Anyone with the link can open the app in a standard browser without installing software.

**Why this priority**: The parent wants to publish the app online for convenient access from home, school, or mobile devices.

**Independent Test**: Can be tested by opening the public URL in a browser on a different device and completing one practice round successfully.

**Acceptance Scenarios**:

1. **Given** the app is deployed, **When** a user visits the public URL, **Then** the home screen loads and is usable.
2. **Given** a user on a phone or tablet browser, **When** they open the public URL, **Then** the practice flow works without requiring a native app install.
3. **Given** the deployed app, **When** multiple family members use it concurrently from different devices, **Then** each can complete an independent practice session.

---

### Edge Cases

- What happens when the child submits an empty answer? The app prompts them gently to enter a number before continuing; it does not advance or mark the problem wrong.
- What happens when the child enters non-numeric input? The app ignores or blocks invalid characters and keeps focus on answer entry.
- What happens when the child closes the browser mid-session? No data loss requirement for v1; returning users start fresh or see only in-session progress.
- What happens when the same problem could repeat in one round? The app avoids showing the exact same problem twice in a single 10-question round.
- What happens on slow or offline network? The app shows a friendly message if it cannot load; core practice SHOULD work without network once the page has loaded (single-page experience).
- What happens when sums at Intermediate level involve "bridging through 10"? Problems are drawn from curated ranges that match the selected category; the app does not require the child to show their work — only the final sum.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present addition-only practice problems in a web browser.
- **FR-002**: System MUST require the child to enter or select a numeric answer for each problem without providing finger-counting or physical manipulative aids.
- **FR-003**: System MUST provide immediate feedback after each answer (correct: encouraging confirmation; incorrect: gentle correction with the right answer shown briefly).
- **FR-004**: System MUST offer three difficulty levels: **Simple**, **Medium**, and **Intermediate**.
- **FR-005**: System MUST offer problem categories aligned with research-based early math progression:
  - **Single Digit (sums up to 9)**: both addends 1–9, sum ≤ 9 (Simple)
  - **Make 10 (sums up to 10)**: both addends 1–9, sum 6–10, emphasizing pairs that build number bonds to 10 (Medium)
  - **Teen Numbers (sums 11–20)**: both addends 1–9, sum 11–20, supporting mental bridging strategies (Intermediate)
- **FR-006**: System MUST generate problems randomly within the selected level and category constraints for each practice round.
- **FR-007**: System MUST run practice in rounds of 10 problems by default, with a visible progress indicator (e.g., "Question 3 of 10").
- **FR-008**: System MUST show a session summary at the end of each round: total problems, correct count, and option to practice again or change level.
- **FR-009**: System MUST use a fixed palette of at most 5 colors, large readable typography, and tap-friendly controls per project constitution.
- **FR-010**: System MUST use encouraging, age-appropriate language throughout; punitive or frightening messaging is not permitted.
- **FR-011**: System MUST be deployable to a public URL so users can access it online without installation.
- **FR-012**: System MUST follow a pedagogical sequence inspired by established early childhood math approaches (number sense, number bonds to 10, then teen sums) — problems MUST NOT jump to advanced topics outside the selected category.
- **FR-013**: System MUST default new users to **Simple / Single Digit** so the first experience is approachable.
- **FR-014**: System MUST avoid duplicate identical problems within the same 10-question round.
- **FR-015**: System MUST validate that submitted answers are numeric before scoring.

### Key Entities

- **Practice Session**: A single round of problems; attributes include selected level, selected category, list of problems presented, child answers, correct count, start/end state.
- **Problem**: One addition exercise; attributes include first addend, second addend, correct sum, category, and difficulty level.
- **Difficulty Level**: Simple, Medium, or Intermediate — defines which categories are recommended and default problem constraints.
- **Problem Category**: A named range of addends and sums (e.g., Make 10) used to filter problem generation.
- **Session Summary**: End-of-round results showing attempts and successes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 5–8 can start and finish a 10-question practice round without written instructions in under 5 minutes.
- **SC-002**: At least 90% of test observers (parents or educators) rate the app as "easy for a child to use alone" after one supervised session.
- **SC-003**: 100% of problems generated in a session conform to the number ranges defined for the selected level and category.
- **SC-004**: The public URL loads the usable home screen within 5 seconds on a typical home broadband connection.
- **SC-005**: After 5 practice sessions at Simple level, the child (or parent) can advance to Medium without changing apps — level selection is always available.
- **SC-006**: Zero instances of finger-counting prompts or manipulative counting graphics appear during user acceptance testing.

## Assumptions

- Primary learner is a young child (approximately ages 5–8); a parent may help select difficulty the first few times.
- Addition is the only operation in scope for this feature; subtraction, multiplication, and division are out of scope.
- User accounts and cloud-synced progress are out of scope for v1; progress is per-session or stored locally in the browser only.
- The parent intends to host the app on **Render** (or equivalent static/web hosting); deployment mechanics are decided in the implementation plan, not this spec.
- One practice round is 10 questions; round length may be adjusted in a future feature if needed.
- Authorized teaching alignment is interpreted as following widely accepted early math progressions (number bonds, sums within 10 before teens, mental strategies before written algorithms) as used in curricula such as Singapore Math number bonds stage and Common Core K–2 operations milestones — without claiming formal certification.
- Audio feedback is optional for v1; visual feedback is required.
- English-language UI is sufficient for v1; localization is out of scope.
- No login, payment, or child-data collection is required for v1, simplifying privacy compliance.

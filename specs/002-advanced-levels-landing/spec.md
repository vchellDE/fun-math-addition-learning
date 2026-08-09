# Feature Specification: Advanced Levels & Kids Landing Page

**Feature Branch**: `002-advanced-levels-landing`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "Okay, initial version looks good as a next version. I want to increase the complexity. The current intermediate goes back to simple then increase the complexity level from there. I would like to have a proper landing page for this app. In the landing page if you could get some fun facts about math for kids to interact with this app or increase the math interest. Please pick a visual which is more appropriate to kids aged below twelve years"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Welcome Landing with Math Fun Facts (Priority: P1)

A child or parent opens the app and lands on a welcoming home page before practice. The page shows a friendly, age-appropriate visual theme, a short welcome message, and one or more interactive math fun facts (e.g., tap to reveal the next fact, or swipe through a small set). A clear call-to-action leads them to choose a practice level and start adding.

**Why this priority**: The landing page is the first impression and sets the tone for engagement. Fun facts build curiosity about math before the child starts drills.

**Independent Test**: Can be fully tested by opening the app URL, viewing the landing page, interacting with at least one fun fact, and tapping through to level selection — without starting a practice round.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the app, **When** the page loads, **Then** they see a dedicated landing screen (not the level picker alone) with a welcome message and kid-friendly visual treatment suitable for children under 12.
2. **Given** the landing page is visible, **When** the child taps or swipes the fun-facts area, **Then** a new age-appropriate math fun fact is shown with encouraging, easy-to-read text.
3. **Given** the landing page is visible, **When** the child taps the primary action (e.g., "Let's Practice!"), **Then** they are taken to the level-selection screen to choose difficulty and start practice.
4. **Given** the landing page, **When** a parent views it on a phone or tablet, **Then** all interactive elements are large enough for a child to tap without precision.

---

### User Story 2 - Extended Difficulty Progression Beyond Intermediate (Priority: P1)

A child who has mastered teen-number sums (Intermediate) can continue to harder addition levels without the app feeling like it "resets" to Simple. New levels build on prior skills with clearly labeled steps: larger sums, then two-digit mental addition, progressing in small pedagogical steps.

**Why this priority**: The user explicitly wants complexity to increase from Intermediate rather than cycling back to Simple as the only upward path.

**Independent Test**: Can be tested by selecting each new level (Advanced, Expert, and Champion), starting practice, and verifying all generated problems match the defined ranges for that level.

**Acceptance Scenarios**:

1. **Given** the level-selection screen, **When** the user views all levels, **Then** they see a linear progression: Simple → Medium → Intermediate → Advanced → Expert → Champion (six levels total).
2. **Given** the user selects **Advanced** ("Bigger Sums"), **When** practice begins, **Then** all problems have sums from 21 through 30 using addends that keep mental calculation reasonable (at least one addend ≤ 15).
3. **Given** the user selects **Expert** ("Two-Digit Plus One"), **When** practice begins, **Then** all problems are of the form two-digit number + single-digit number with sums from 31 through 50 and no regrouping across tens (e.g., 34 + 5, not 38 + 7).
4. **Given** the user selects **Champion** ("Two-Digit Friends"), **When** practice begins, **Then** all problems use two two-digit addends without regrouping (tens digits sum to less than 10; ones digits sum to less than 10) with sums up to 99.
5. **Given** a child completes a round at Intermediate, **When** they choose "Change Level" from the summary screen, **Then** they return to level selection with Advanced and higher levels visible and selectable — not forced back to Simple.

---

### User Story 3 - Kid-Friendly Visual Identity on Landing (Priority: P2)

The landing page uses a cohesive visual identity aimed at children below 12: playful but not infantile, with a simple mascot or character motif (e.g., friendly number characters or a cheerful math explorer) that appears on the landing screen and optionally as a small accent elsewhere. The design stays within the project's limited color palette and does not overwhelm the math content.

**Why this priority**: The user asked for visuals appropriate for kids under 12; a consistent, welcoming look increases trust and enjoyment for both younger learners (5–7) and older ones (8–11).

**Independent Test**: Can be tested by showing the landing page to observers (parents or children ages 5–11) and confirming they describe it as "fun," "for kids," and "not scary or boring" within a 30-second first impression.

**Acceptance Scenarios**:

1. **Given** the landing page, **When** viewed by a child aged 5–11, **Then** the main visual (mascot or illustration) is immediately recognizable and friendly — no abstract or adult-oriented stock imagery.
2. **Given** the full app including the new landing page, **When** distinct colors are counted, **Then** at most 5 colors are used across backgrounds, text, actions, feedback, and illustration accents (per project constitution).
3. **Given** the landing page fun-facts section, **When** displayed, **Then** text uses short sentences readable by a child with beginning reading skills (or readable aloud by a parent in under 15 seconds per fact).

---

### User Story 4 - Seamless Flow from Landing to Practice (Priority: P2)

Returning users can reach practice quickly while still seeing the landing page when appropriate. The flow separates "discover and get excited" (landing) from "choose level and drill" (level selection) without extra confusing steps.

**Why this priority**: A proper landing page must not block repeat users from practicing efficiently.

**Independent Test**: Can be tested by completing one full round, returning to the landing flow, and reaching a new practice session in at most three taps from the summary screen.

**Acceptance Scenarios**:

1. **Given** a user on the session summary screen, **When** they tap "Change Level", **Then** they go to level selection (not required to re-read all fun facts unless they navigate back to landing).
2. **Given** a user on the session summary screen, **When** they tap "Practice Again", **Then** they start another round at the same level without visiting the landing page.
3. **Given** a user on level selection, **When** they want to see fun facts again, **Then** they can navigate back to the landing page via a clearly labeled control (e.g., "Home" or back affordance).

---

### Edge Cases

- What happens when the child taps through all fun facts? The app cycles back to the first fact or shuffles the set; it never shows an empty state.
- What happens when a child selects Champion before mastering lower levels? Selection is allowed (no gating in v2); parents may guide choice. Optional gentle hint text on harder levels may suggest trying Intermediate first — not blocking.
- What happens when problem generation cannot satisfy Champion constraints within retry limits? The generator retries with bounded attempts and falls back to a valid problem; the session never shows an invalid problem.
- What happens on a very small phone screen? Landing illustration scales down; fun-fact text remains readable without horizontal scrolling.
- What happens when the user has slow network? Landing content (facts, mascot) is bundled with the app — no external fetch required for core landing experience.
- What happens after session complete at Expert/Champion? Summary screen shows the new level labels correctly and offers the same Practice Again / Change Level actions as existing levels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a dedicated landing page as the default entry screen when the app loads (replacing the current combined home/level screen as the first view).
- **FR-002**: Landing page MUST display at least 8 curated, age-appropriate math fun facts suitable for children under 12 (e.g., patterns, zero, symmetry, famous shapes, "adding doubles").
- **FR-003**: Landing page MUST allow the child to interact with fun facts (tap "next" or swipe) to cycle through the set without leaving the page.
- **FR-004**: Landing page MUST include a primary call-to-action that navigates to the level-selection screen.
- **FR-005**: Landing page MUST feature a kid-friendly visual identity (mascot or simple illustration) appropriate for ages 5–11, not generic adult imagery.
- **FR-006**: System MUST retain existing levels Simple, Medium, and Intermediate with unchanged problem constraints from v1.
- **FR-007**: System MUST add three new difficulty levels after Intermediate:
  - **Advanced** ("Bigger Sums"): sums 21–30; addends chosen so at least one addend is ≤ 15 and both are positive integers.
  - **Expert** ("Two-Digit Plus One"): form AB + C where A,B,C are digits, sum 31–50, no regrouping (ones digit of AB + C < 10).
  - **Champion** ("Two-Digit Friends"): form AB + CD where no regrouping in ones or tens; sum ≤ 99.
- **FR-008**: Level-selection screen MUST show all six levels in progressive order with short labels describing what each level practices.
- **FR-009**: System MUST NOT reset or hide Advanced+ levels after Intermediate; progression continues upward on the same level-selection screen.
- **FR-010**: System MUST generate problems randomly within each new level's constraints for 10-question rounds, with no duplicate identical problems in a round (same as v1).
- **FR-011**: System MUST use at most 5 distinct colors across the entire app including landing visuals (constitution compliance).
- **FR-012**: System MUST use encouraging, age-appropriate language on landing facts and all new level labels.
- **FR-013**: System MUST allow navigation from level selection back to the landing page.
- **FR-014**: Session summary and practice-again flows MUST support all six levels with correct level and category labels.
- **FR-015**: Fun facts MUST be static content bundled with the app (no external API or user-generated content).
- **FR-016**: Landing page MUST remain usable without login, accounts, or network after initial load (consistent with v1).

### Key Entities

- **Landing Page**: Entry experience; attributes include welcome copy, mascot/visual theme, fun-facts collection, primary CTA to level selection.
- **Math Fun Fact**: A short, kid-friendly statement about math; attributes include id, display text (1–2 sentences), optional emoji or icon hint (within palette).
- **Difficulty Level**: Extended enum — Simple, Medium, Intermediate, Advanced, Expert, Champion; each maps to one default problem category.
- **Problem Category**: Named generator profile; three new categories: `bigger-sums`, `two-digit-plus-one`, `two-digit-friends`.
- **Practice Session / Problem / Session Summary**: Same concepts as v1; extended to support new level and category ids.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of parent testers report the landing page looks "appealing to kids under 12" in a brief survey after first view.
- **SC-002**: A child aged 7–11 can tap through at least 3 fun facts and reach level selection in under 60 seconds without adult help.
- **SC-003**: 100% of problems generated at Advanced, Expert, and Champion conform to the defined numeric constraints in automated tests.
- **SC-004**: Users who complete Intermediate can select Advanced (or higher) on the next visit without any forced return to Simple.
- **SC-005**: Landing page loads as part of the initial app bundle with no additional round-trip required for fun-fact content.
- **SC-006**: Repeat practice ("Practice Again") from summary reaches the next question in one tap, unchanged from v1 behavior.
- **SC-007**: At least 6 fun facts are available on the landing page; cycling through the full set takes under 2 minutes at a child's pace.

## Assumptions

- Target age range expands slightly to 5–11 (under 12 as requested); copy and visuals should work for both early readers and upper elementary.
- Addition remains the only operation; new levels are still addition-only mental math.
- No level-gating or unlock mechanics in v2 — all six levels are selectable from the start; optional hint text may suggest progression order.
- Mascot/visual is a simple SVG or CSS-based illustration (e.g., friendly stacked numbers or a star character) — not licensed third-party characters.
- Fun facts are hand-authored, factual, and non-controversial (no trivia requiring advanced math knowledge).
- Landing page justifies constitution "Simplicity First" as it directly supports math interest and practice entry; it is not a separate game or social feature.
- English-only UI for v2; localization out of scope.
- Level selection is a separate screen from landing (two-step entry: land → choose level → practice), matching "proper landing page" intent.
- Existing v1 levels and categories are preserved for backward compatibility; stored preferences for `simple`/`medium`/`intermediate` continue to work.
- Constitution palette (5 colors) applies to mascot accents — illustration uses palette tokens only, not a sixth color.

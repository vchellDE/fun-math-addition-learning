# Feature Specification: Faster Question Flow & Voice Recognition Reliability

**Feature Branch**: `004-faster-question-voice`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "The app works as expected, but there are two areas to improve. First, after clicking Check or answering correctly, it takes about a second before the next question loads — how can we make it faster? Second, when using the Space bar for voice input, recognition works most of the time but sometimes fails — how can we improve voice recognition while keeping the system simpler?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Snappy Advance After a Correct Answer (Priority: P1)

A child answers a problem correctly (by voice or number pad) and wants to keep their momentum. After brief positive feedback, the next problem appears quickly so practice feels continuous rather than waiting on the screen.

**Why this priority**: Perceived slowness between questions breaks focus and makes practice feel sluggish, especially during a streak of correct answers.

**Independent Test**: Can be fully tested by completing several correct answers in a row and measuring time from answer confirmation to the next problem appearing, without changing voice or pad input behavior.

**Acceptance Scenarios**:

1. **Given** a child submits a correct answer, **When** positive feedback is shown, **Then** the next problem appears within 1 second of confirmation (excluding the final question of a round).
2. **Given** a child submits a correct answer via voice, **When** the app auto-confirms the heard number, **Then** the total wait from releasing the speak button to seeing the next problem is noticeably shorter than today's experience (target: under 2 seconds end-to-end in normal use).
3. **Given** a child submits a correct answer via the number pad and taps Check, **When** feedback completes, **Then** the next problem loads without an extra tap or visible loading pause.
4. **Given** a child submits an incorrect answer, **When** gentle feedback and the correct sum are shown, **Then** the app still advances to the next problem within a reasonable pause that allows the child to read the correction (may be slightly longer than the correct-answer path, but must not exceed 2 seconds after feedback is visible).

---

### User Story 2 - Reliable Voice Answers on First Try (Priority: P1)

A child holds the speak button (on screen or Space key), says a single number answer clearly, and releases. The app understands the intended number on the first attempt in most cases, especially for common answers in the 0–20 range used in early levels.

**Why this priority**: Intermittent misrecognition frustrates learners and undermines trust in voice input — the primary answer method for this app.

**Independent Test**: Can be tested by speaking a standard set of answers (digits and word forms like "seven", "twelve", "fifteen") in a quiet room and recording first-attempt recognition success rate.

**Acceptance Scenarios**:

1. **Given** a child speaks a single clear number (0–99) while holding Space or the on-screen speak button, **When** they release in a quiet environment, **Then** the app shows the correct interpreted number at least 90% of the time on the first attempt.
2. **Given** the speech engine returns a transcript that sounds like the intended number (e.g., homophones or minor mis-hearings common in children's speech), **When** the app processes the result, **Then** it maps to the most likely numeric answer for addition practice without requiring the child to learn special phrasing.
3. **Given** the app cannot confidently determine a number, **When** processing completes, **Then** the child sees a short, encouraging prompt to try again — not a technical error — and may re-speak without leaving the question.
4. **Given** the child uses the Space key shortcut, **When** they hold and release Space the same way as the on-screen button, **Then** recognition behavior and reliability match the on-screen speak control.

---

### User Story 3 - Clear "What I Heard" Without Extra Steps (Priority: P2)

After speaking, the child briefly sees what the app understood before the answer is scored. This confirmation step stays simple: no extra taps for a confident match, but enough visibility to catch obvious mistakes before scoring.

**Why this priority**: Faster flow (Story 1) must not remove the transparency that prevents silent mis-scoring — especially important when improving recognition (Story 2).

**Independent Test**: Can be tested by speaking an answer, verifying the heard number appears, and confirming scoring happens automatically without a second button press when recognition is confident.

**Acceptance Scenarios**:

1. **Given** the child releases the speak button after speaking, **When** a number is recognized, **Then** "I heard: [number]" (or equivalent plain wording) appears in large, readable text before feedback.
2. **Given** the heard number is clearly wrong, **When** the child has not used their one retry, **Then** they can tap "Try Again" to re-speak without the attempt being scored yet.
3. **Given** recognition is confident and the heard number is shown, **When** the brief confirmation pause elapses, **Then** the answer is scored automatically — the child does not need to tap Check for voice answers.

---

### User Story 4 - Simple System, No New Complexity for Kids (Priority: P2)

Improvements to speed and voice accuracy do not add new modes, settings screens, or steps that a child must learn. The practice screen keeps one obvious speak control, one optional Space shortcut, and the existing number pad fallback.

**Why this priority**: Constitution principle I (Simplicity First) — reliability gains must not trade away ease of use.

**Independent Test**: Can be verified by a caregiver observing a first-time child session: no new buttons, toggles, or instructions beyond what exists today.

**Acceptance Scenarios**:

1. **Given** a returning user who already knows push-to-talk, **When** this feature ships, **Then** they do not need to learn a new input workflow.
2. **Given** voice improvements are applied, **When** the child practices, **Then** no new settings, calibration wizard, or "training" step is required before answering.
3. **Given** the number pad fallback, **When** used instead of voice, **Then** question advance timing improvements apply equally to pad submissions.

---

### Edge Cases

- What happens when the child speaks very quickly right at button release? The app should still capture the answer or invite a retry — not score silence as wrong.
- What happens when background noise causes a wrong transcript? The child can use "Try Again" once; persistent failure should suggest speaking louder or switching to the number pad — not blame the child.
- What happens on the last question of a round? Advance timing applies to the results/summary screen transition; the child should not stare at a blank pause before "All done!"
- What happens when Space is held but focus is not on the practice area? Space should not trigger listening when the child is not actively practicing (e.g., during modals or when input is locked).
- What happens for answers that sound alike (e.g., "fifteen" vs "fifty", "thirteen" vs "thirty")? The app should prefer the answer that fits the problem's expected range when unambiguous; otherwise show what was heard and allow retry.
- What happens when the child gives a multi-word answer ("the answer is seven")? The app should extract the number and ignore filler words, consistent with today's behavior but more tolerant of natural child phrasing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST advance to the next problem within 1 second after correct-answer feedback begins (for all questions except the final one in a round).
- **FR-002**: The system MUST reduce total perceived wait from voice answer release to next problem display compared to the current experience, targeting under 2 seconds end-to-end for correct voice answers in normal conditions.
- **FR-003**: The system MUST keep automatic scoring for voice answers (no mandatory Check tap after speaking) while preserving a brief, visible "heard number" confirmation.
- **FR-004**: The system MUST shorten or eliminate unnecessary waiting periods between answer confirmation, feedback display, and question advance without removing encouraging feedback entirely.
- **FR-005**: The system MUST improve first-attempt voice recognition accuracy for spoken numbers 0–99, with measurable improvement over the current intermittent failure rate.
- **FR-006**: The system MUST treat Space-key push-to-talk identically to the on-screen Hold to Speak button for listening, parsing, confirmation, and scoring behavior.
- **FR-007**: The system MUST continue accepting both word forms ("seven", "twelve") and digit speech ("7", "12") without requiring a specific format from the child.
- **FR-008**: The system MUST handle common child speech patterns (fillers like "um", "it's", trailing silence, quiet speech) by prompting a friendly retry rather than scoring an incorrect silent submission when no number was detected.
- **FR-009**: The system MUST retain the one free "Try Again" per question when the heard number is wrong, before the attempt is finalized.
- **FR-010**: The system MUST NOT introduce new user-facing configuration, calibration flows, or additional input modes to achieve speed or accuracy gains.
- **FR-011**: The system MUST apply question-advance timing improvements to both voice and number-pad answer paths.
- **FR-012**: The system MUST keep incorrect-answer feedback readable: show the correct sum long enough for a child to notice (up to 2 seconds) before advancing.

### Key Entities

- **Answer confirmation**: The moment an answer value is accepted for scoring (voice auto-confirm after heard display, or Check tap on number pad).
- **Feedback interval**: The period between scoring and showing the next problem, during which encouraging or corrective messages are visible.
- **Voice capture session**: A single hold-to-speak cycle from press/hold through release, transcript processing, and heard-number display.
- **Recognition outcome**: The interpreted number, a no-number result, or an ambiguous result that triggers retry messaging.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In moderated testing with 10 children (or adult proxies simulating child speech), at least 9 of 10 report that "the next question comes quickly" after correct answers (simple thumbs-up/down or smiley survey after a 5-question round).
- **SC-002**: Median time from correct-answer confirmation to next problem visible is under 1 second, measured across 20 consecutive correct answers in a test session.
- **SC-003**: First-attempt voice recognition success rate is at least 90% for a defined test set of 30 spoken answers (0–20 word and digit forms) in a quiet room, using both on-screen button and Space key.
- **SC-004**: End-to-end time from releasing speak button to next problem visible (correct answer path) is under 2 seconds at median, measured across 20 voice answers.
- **SC-005**: No new UI controls or settings are added to the practice screen beyond what exists today (speak button, heard banner, try again, number pad fallback).
- **SC-006**: Caregiver observation: a child can complete a full practice round without asking "why is it waiting?" or "why didn't it hear me?" more than once per 10 questions.

## Assumptions

- Target users remain children roughly ages 4–8 practicing addition; caregivers may assist with microphone permission only.
- Voice input continues to use the device/browser speech capability already in the app — no switch to a paid external speech service in this feature (keeps Simplicity First).
- "Quiet environment" for the 90% recognition target means typical home practice (not classroom noise); noisy environments may still rely on retry or number pad fallback.
- Brief positive feedback on correct answers remains valuable; the goal is to shorten delays, not remove all celebration.
- The current 750 ms heard-number pause and 1500 ms post-feedback delay are the primary contributors to perceived slowness; tuning these (and any stacked waits) is in scope conceptually without prescribing implementation.
- Space bar remains the sole keyboard shortcut during practice; number keys do not enter answers.
- Improvements focus on parsing tolerance, timing, and capture behavior — not adding always-on listening or multiple-choice answers.
- Number pad Check flow remains one tap to submit; speed improvements apply after submission, not by removing Check on pad.

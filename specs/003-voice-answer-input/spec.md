# Feature Specification: Voice Answer Input (No Keyboard Typing)

**Feature Branch**: `003-voice-answer-input`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "I would like to remove keyboard. I don't want kids to use a keyboard when they practice Fun math. So I would like to do some brainstorm on how can we make use of voice? Something like press a button speak out the answer then release the button so the system takes the voice as input and then compares it against the actual answer. The ultimate aim is I don't want to give keyboard access — instead of typing numbers on the number pad, maybe they can press one button on the keyboard."

## Input Alternatives Considered

The parent wants children to answer mentally and submit without typing digits on a keyboard. The following options were evaluated; the spec adopts a **primary + fallback** strategy aligned with Simplicity First and Kid-Friendly Experience.

| Approach | How it works | Pros | Cons | Decision |
| -------- | ------------ | ---- | ---- | -------- |
| **Push-to-talk voice** (recommended primary) | Child holds a large on-screen "Hold to Speak" button, says the answer (e.g., "seven"), releases the button; the app converts speech to a number and checks it | Hands-free mental math; no digit typing; natural for young children | Needs microphone permission; may mishear in noise; some children speak quietly | **Primary input method** |
| **Single-key voice trigger** | Same as push-to-talk, but holding one designated key (e.g., Space) starts listening instead of tapping the screen | Useful on laptops where the child already has hands near the keyboard but must not type numbers | Still requires one keyboard key; less obvious on tablets | **Optional shortcut** alongside on-screen button |
| **On-screen number pad** | Large tap targets 0–9 arranged like a phone keypad; child taps digits then taps Check | Reliable, no mic; works offline; familiar pattern | Still "typing" with fingers — less aligned with pure voice goal | **Fallback** when voice is unavailable or repeatedly fails |
| **Multiple-choice answers** | Show 3–4 plausible answer buttons; child taps one | Very easy for beginners; zero typing or speech | Does not practice verbalizing numbers; gameable by guessing | **Out of scope for v1** (could be a future beginner mode) |
| **Always-on listening** | Mic listens continuously without a button | Fewer steps | Hard in classrooms/noisy homes; privacy concerns; accidental triggers | **Rejected** |

**Chosen direction**: Replace the text answer field with **push-to-talk voice** as the default. Remove numeric keyboard input during practice. Provide an **on-screen number pad fallback** for environments where the microphone cannot be used. Allow **one optional hold-to-speak keyboard shortcut** (Space) for laptop users — this is the only keyboard interaction permitted during answer entry, and it does not involve typing numbers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Answer by Voice (Push-to-Talk) (Priority: P1)

A child sees an addition problem and answers by speaking the sum aloud. They press and hold a large "Hold to Speak" button, say the answer (e.g., "twelve" or "12"), then release. The app shows what it heard, checks the answer, and gives the same encouraging feedback as today before moving to the next problem.

**Why this priority**: This is the core change — removing keyboard typing and enabling mental-math answers through voice.

**Independent Test**: Can be fully tested by starting a practice round, holding the speak button, saying correct and incorrect answers for several problems, and verifying feedback and scoring match the spoken number.

**Acceptance Scenarios**:

1. **Given** a problem is displayed and microphone access is granted, **When** the child holds "Hold to Speak", says the correct answer, and releases, **Then** the app recognizes the spoken number, marks the answer correct, and advances after brief positive feedback.
2. **Given** a problem is displayed, **When** the child holds the speak button, says an incorrect answer, and releases, **Then** the app shows gentle encouragement, displays the correct sum briefly, and moves to the next problem.
3. **Given** a problem is displayed, **When** the child taps Check or releases the button without speaking, **Then** the app shows a friendly prompt to try again (e.g., "Hold the button and say your answer") without scoring the attempt.
4. **Given** the practice screen, **When** the child looks for a text box or numeric keyboard to type an answer, **Then** no text input field or system number pad is offered for answer entry.

---

### User Story 2 - See What Was Heard Before Checking (Priority: P1)

After the child releases the speak button, the app briefly shows the number it understood (e.g., "I heard: 7") so the child or nearby parent can confirm before the answer is scored. If recognition is wrong, the child can try again without penalty beyond one attempt counting as their answer for that problem.

**Why this priority**: Young children need confidence that the app understood them; misrecognition without feedback would frustrate learners and caregivers.

**Independent Test**: Can be tested by speaking an answer, verifying the "heard" display appears, and confirming the scored answer matches the displayed number.

**Acceptance Scenarios**:

1. **Given** the child has released the speak button after speaking, **When** recognition completes, **Then** the recognized number is shown in large, readable text before feedback is applied.
2. **Given** the app misheard the child (e.g., said "fifteen", heard "fifty"), **When** the wrong number is shown, **Then** the child may tap "Try Again" once to re-record before the attempt is finalized.
3. **Given** recognition confidence is very low or no number was detected, **When** processing completes, **Then** the app asks the child to speak again with a short, encouraging message — not an error code or technical jargon.

---

### User Story 3 - Microphone Permission and Fallback Pad (Priority: P2)

The first time voice input is needed, the app asks for microphone permission in plain language a parent can read aloud to the child. If permission is denied or the device has no microphone, the child can switch to a large on-screen number pad (tap digits, then Check) without leaving the practice session.

**Why this priority**: Voice cannot work everywhere; a reliable fallback keeps practice possible while still blocking free-form keyboard typing.

**Independent Test**: Can be tested by denying mic permission, confirming the number pad appears, completing a round via taps only, and verifying no text keyboard is shown.

**Acceptance Scenarios**:

1. **Given** first launch of a practice session with voice enabled, **When** microphone permission has not been granted, **Then** the app shows a short explanation and a clear way to allow the microphone or choose the number pad instead.
2. **Given** microphone permission is denied, **When** the child continues practice, **Then** an on-screen number pad (digits 0–9, clear, and Check) is available with large tap targets suitable for small fingers.
3. **Given** the child is using the number pad fallback, **When** they complete answers, **Then** scoring and feedback behave identically to the voice path.
4. **Given** a parent later grants microphone permission in browser settings, **When** the child returns to practice, **Then** voice input is available again without reinstalling the app.

---

### User Story 4 - Optional Single-Key Speak Shortcut (Priority: P3)

On devices with a physical keyboard, a child or parent may hold the Space key to start listening (same as holding the on-screen button) and release to submit speech. Number keys and letter keys do not enter answers during practice.

**Why this priority**: Supports laptop use while honoring the goal of not typing answers — only one non-numeric key is used.

**Independent Test**: Can be tested on a laptop by focusing the practice screen, holding Space, speaking an answer, releasing, and verifying the answer is scored without any digit keys affecting the answer field.

**Acceptance Scenarios**:

1. **Given** the practice screen is active on a laptop, **When** the user holds Space and speaks an answer, **Then** voice capture behaves the same as the on-screen hold button.
2. **Given** the practice screen is active, **When** the user presses number keys or types in an input, **Then** nothing is entered as an answer (no visible text field accepts typing).
3. **Given** a tablet with no keyboard, **When** the child practices, **Then** the on-screen Hold to Speak button remains the primary control with no dependency on a physical keyboard.

---

### Edge Cases

- What happens when the child says the answer in words ("seven") versus digits ("seven" vs counting "one two three four five six seven")? The system should accept common number words for answers 0–99 and ignore filler words where possible.
- What happens in a noisy room? Show "I didn't catch that — try again" and allow retry; after repeated failures, suggest the number pad or quieter spot.
- What happens when the correct answer is a two-digit number (e.g., 34)? Accept "thirty four", "thirty-four", and "34" spoken forms.
- What happens if the child holds the button too briefly? Treat as no input and prompt to hold longer while speaking.
- What happens if the child holds the button but says nothing for several seconds? Stop listening with a gentle timeout message.
- What happens during the feedback delay between problems? The speak button and pad are disabled (same as current input lock) to prevent double scoring.
- What happens if browser speech recognition is unsupported? Default to number pad only and show a one-line note for the parent that voice is not available on this browser.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The practice screen MUST NOT display a text input field or invoke the system software keyboard for answer entry during normal practice.
- **FR-002**: The system MUST provide a large, labeled push-to-talk control (e.g., "Hold to Speak") that records audio only while the child holds the control and processes speech when they release it.
- **FR-003**: The system MUST convert recognized speech into a numeric answer and compare it to the correct sum for the current problem.
- **FR-004**: The system MUST accept spoken answers as whole numbers in the range required by the current problem (0–99 for current levels), including common English word forms (e.g., "twelve", "twenty one").
- **FR-005**: After recognition, the system MUST display the interpreted number to the user before applying correct/incorrect feedback.
- **FR-006**: The system MUST allow at least one retry when recognition fails or the heard number is wrong, before finalizing the attempt for that problem.
- **FR-007**: The system MUST request microphone permission with child- and parent-friendly copy before the first voice capture.
- **FR-008**: When microphone access is unavailable or denied, the system MUST offer an on-screen number pad with digit buttons and Check as a fallback — still without free-form keyboard typing.
- **FR-009**: The system MUST support an optional hold-to-speak shortcut using a single designated key (Space) that mirrors the on-screen push-to-talk behavior; number and letter keys MUST NOT populate an answer field.
- **FR-010**: Correct, incorrect, and empty-input feedback MUST remain encouraging and consistent with existing practice feedback (no punitive language).
- **FR-011**: Voice capture and answer submission MUST be disabled while feedback is showing between problems, matching current input-lock behavior.
- **FR-012**: Session scoring, progress (question N of 10), and summary screens MUST work unchanged whether the child used voice or the number pad fallback.

### Key Entities

- **Voice Answer Attempt**: A single try at answering one problem via speech — includes hold start/end time, raw recognition result, parsed number, confidence indicator, and whether a retry was used.
- **Recognized Number**: The numeric value extracted from speech (or pad taps) before scoring — shown to the user for confirmation.
- **Input Mode**: Either `voice` (default when permitted) or `number-pad` (fallback) — persisted for the session so the child is not re-prompted every question.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a quiet home environment, at least 90% of spoken single-digit and teen-number answers (sums 2–20) are recognized correctly on the first try during user testing with children ages 5–8.
- **SC-002**: Children can complete a full 10-question practice round using only voice (no keyboard typing) in under 5 minutes on first successful mic setup.
- **SC-003**: 100% of practice sessions remain completable when microphone permission is denied, using the number pad fallback alone.
- **SC-004**: In observational testing, at least 80% of children ages 5–8 can start answering by voice within 30 seconds of seeing the Hold to Speak button, without written instructions beyond a parent saying "hold the button and say the number."
- **SC-005**: Caregivers report that children are not distracted by or attempting to type on the device keyboard during practice (qualitative check in 5 family test sessions).

## Assumptions

- Target users remain children roughly 4–8 years old practicing addition, with a parent nearby for first-time microphone permission.
- Practice happens primarily on tablets or laptops in Chrome, Safari, or Edge — browsers that support speech recognition; unsupported browsers fall back to the number pad only.
- Push-to-talk (hold to record, release to process) is preferred over always-on listening for privacy and classroom/home noise.
- The on-screen number pad is a safety net, not the primary experience; marketing and UI emphasize speaking answers.
- Only one optional keyboard key (Space) is allowed for voice trigger; all digit entry via physical keyboard remains disabled.
- Existing problem generation, levels, landing page, and session summary flows are unchanged; only the answer-entry interaction on the practice screen is replaced.
- Visual and audio feedback for correct/incorrect answers reuse existing patterns and constitution limits (limited palette, encouraging tone).

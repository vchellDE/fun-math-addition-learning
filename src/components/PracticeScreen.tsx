import { useCallback, useEffect, useRef, useState } from 'react';
import type { CategoryId, FeedbackType, InputMode, LevelId, Problem } from '../types';
import { FeedbackBanner } from './FeedbackBanner';
import { HoldToSpeakButton } from './HoldToSpeakButton';
import { HeardAnswerBanner } from './HeardAnswerBanner';
import { MicPermissionPrompt } from './MicPermissionPrompt';
import { NumberPad } from './NumberPad';
import { getCategoryById, getLevelById } from '../lib/categories';
import { parseSpokenAlternatives } from '../lib/speechParser';
import { isSpeechRecognitionSupported, requestMicrophonePermission } from '../lib/speechRecognition';
import { markTiming, startQuestionTiming } from '../lib/questionTiming';
import { AUTO_CONFIRM_DELAY_MS } from '../lib/timingConfig';
import { usePushToTalk } from '../lib/usePushToTalk';

interface PracticeScreenProps {
  problem: Problem;
  questionNumber: number;
  totalQuestions: number;
  levelId: LevelId;
  categoryId: CategoryId;
  feedback: FeedbackType;
  correctMessageIndex: number;
  inputLocked: boolean;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onSubmit: (value: number) => void;
  onEmptySubmit: () => void;
}

export function PracticeScreen({
  problem,
  questionNumber,
  totalQuestions,
  levelId,
  categoryId,
  feedback,
  correctMessageIndex,
  inputLocked,
  inputMode,
  onInputModeChange,
  onSubmit,
  onEmptySubmit,
}: PracticeScreenProps) {
  const level = getLevelById(levelId);
  const category = getCategoryById(categoryId);

  const [heardValue, setHeardValue] = useState<number | null>(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const [padDigits, setPadDigits] = useState('');
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micReady, setMicReady] = useState(inputMode !== 'voice');
  const autoConfirmRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const voiceEnabled = inputMode === 'voice' && micReady && !inputLocked && heardValue === null;

  const expectedMax = problem.addendA + problem.addendB;

  const { phase, setPhase, isListening, speakButtonProps } = usePushToTalk({
    enabled: voiceEnabled,
    spaceEnabled: voiceEnabled && !showMicPrompt,
    onAlternatives: (alternatives) => {
      const parsed = parseSpokenAlternatives(alternatives, { expectedMax });
      console.debug('[PracticeScreen] parsed speech', parsed);
      if (!parsed.ok) {
        onEmptySubmit();
        return;
      }
      setHeardValue(parsed.value);
      console.debug('[PracticeScreen] VoiceTimingMarker heardDisplayed', parsed.value);
      markTiming('heardDisplayed', parsed.value);
      setPhase('confirming');
    },
    onEmpty: onEmptySubmit,
    onError: () => onEmptySubmit(),
  });

  const clearAutoConfirm = useCallback(() => {
    if (autoConfirmRef.current) {
      clearTimeout(autoConfirmRef.current);
      autoConfirmRef.current = null;
    }
  }, []);

  // Reset per-question voice/pad state
  useEffect(() => {
    clearAutoConfirm();
    setHeardValue(null);
    setRetryUsed(false);
    setPadDigits('');
    setPhase('idle');
    console.debug(`[PracticeScreen] new question ${questionNumber}`);
    // Debug: start per-question load/response/nextLoad clocks
    startQuestionTiming(questionNumber);
  }, [problem.id, questionNumber, setPhase, clearAutoConfirm]);

  const handleConfirmHeard = useCallback(() => {
    if (inputLocked || heardValue === null) return;
    clearAutoConfirm();
    onSubmit(heardValue);
    setHeardValue(null);
    setPhase('idle');
  }, [clearAutoConfirm, heardValue, inputLocked, onSubmit, setPhase]);

  const handleTryAgain = () => {
    if (inputLocked || retryUsed) return;
    clearAutoConfirm();
    setRetryUsed(true);
    setHeardValue(null);
    setPhase('idle');
  };

  // Auto-score after release so kids don't need an extra tap
  useEffect(() => {
    if (heardValue === null || inputLocked) {
      clearAutoConfirm();
      return;
    }

    console.debug('[PracticeScreen] auto-confirm scheduled', AUTO_CONFIRM_DELAY_MS);
    autoConfirmRef.current = setTimeout(() => {
      console.debug('[PracticeScreen] VoiceTimingMarker answerConfirmed');
      // answerConfirmed is marked in App.handleSubmitAnswer (covers pad + voice)
      handleConfirmHeard();
    }, AUTO_CONFIRM_DELAY_MS);

    return clearAutoConfirm;
  }, [heardValue, inputLocked, handleConfirmHeard, clearAutoConfirm]);

  const handleAllowMic = async () => {
    const status = await requestMicrophonePermission();
    setShowMicPrompt(false);
    if (status === 'granted') {
      setMicReady(true);
      console.debug('[PracticeScreen] mic granted');
    } else {
      onInputModeChange('number-pad');
    }
  };

  const handleUsePad = () => {
    setShowMicPrompt(false);
    onInputModeChange('number-pad');
  };

  const handleSwitchToVoice = () => {
    if (inputLocked) return;
    setPadDigits('');
    onInputModeChange('voice');
    if (!micReady) {
      setShowMicPrompt(true);
      console.debug('[PracticeScreen] switch to voice — show mic prompt');
    }
  };

  const handlePadSubmit = (value: number) => {
    if (inputLocked) return;
    onSubmit(value);
  };

  // Show mic prompt on first voice question when not yet ready
  useEffect(() => {
    if (inputMode === 'voice' && !micReady && questionNumber === 1 && !showMicPrompt) {
      setShowMicPrompt(true);
    }
  }, [inputMode, micReady, questionNumber, showMicPrompt]);

  const showVoiceUi = inputMode === 'voice' && micReady;
  const confirming = heardValue !== null;

  return (
    <div className="app-card">
      <p className="level-badge">
        {level.label} — {category.label}
      </p>
      <p className="progress-label">
        Question {questionNumber} of {totalQuestions}
      </p>
      <p className="problem-display" aria-label={`${problem.addendA} plus ${problem.addendB}`}>
        {problem.addendA} + {problem.addendB} = ?
      </p>

      {showMicPrompt && (
        <MicPermissionPrompt onAllow={handleAllowMic} onUsePad={handleUsePad} />
      )}

      {showVoiceUi && !confirming && (
        <>
          <HoldToSpeakButton
            disabled={inputLocked || phase === 'processing'}
            isListening={isListening}
            {...speakButtonProps}
          />
          <p className="input-mode-hint">
            <button
              type="button"
              className="link-button"
              disabled={inputLocked}
              onClick={() => onInputModeChange('number-pad')}
            >
              Can&apos;t use voice? Tap numbers instead
            </button>
          </p>
          <p className="space-hint">Or hold Spacebar to speak</p>
        </>
      )}

      {confirming && heardValue !== null && (
        <HeardAnswerBanner
          value={heardValue}
          retryUsed={retryUsed}
          disabled={inputLocked}
          onTryAgain={handleTryAgain}
        />
      )}

      {inputMode === 'number-pad' && !confirming && (
        <>
          <NumberPad
            digits={padDigits}
            disabled={inputLocked}
            onDigitsChange={setPadDigits}
            onCheck={handlePadSubmit}
            onEmptyCheck={onEmptySubmit}
          />
          {isSpeechRecognitionSupported() && (
            <p className="input-mode-hint">
              <button
                type="button"
                className="link-button"
                disabled={inputLocked}
                onClick={handleSwitchToVoice}
              >
                Prefer to speak? Use voice instead
              </button>
            </p>
          )}
        </>
      )}

      <FeedbackBanner
        type={feedback}
        inputMode={inputMode}
        correctAnswer={problem.addendA + problem.addendB}
        messageIndex={correctMessageIndex}
      />
    </div>
  );
}

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { VoiceCapturePhase } from '../types';
import { markTiming } from './questionTiming';
import { createRecognitionSession, isSpeechRecognitionSupported } from './speechRecognition';
import { RELEASE_GRACE_MS } from './timingConfig';

const LISTEN_TIMEOUT_MS = 5000;

interface UsePushToTalkOptions {
  enabled: boolean;
  spaceEnabled?: boolean;
  onAlternatives: (alternatives: string[]) => void;
  onEmpty: () => void;
  onError: (code: string) => void;
}

export function usePushToTalk({
  enabled,
  spaceEnabled = false,
  onAlternatives,
  onEmpty,
  onError,
}: UsePushToTalkOptions) {
  const [phase, setPhase] = useState<VoiceCapturePhase>('idle');
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<ReturnType<typeof createRecognitionSession> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gotResultRef = useRef(false);
  const holdingRef = useRef(false);

  const clearListenTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearGraceTimer = useCallback(() => {
    if (graceRef.current) {
      clearTimeout(graceRef.current);
      graceRef.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    clearListenTimeout();
    clearGraceTimer();
    sessionRef.current?.abort();
    sessionRef.current = null;
    holdingRef.current = false;
    setIsListening(false);
    if (phase === 'listening' || phase === 'processing') {
      setPhase('idle');
    }
  }, [clearListenTimeout, clearGraceTimer, phase]);

  const handleAlternatives = useCallback(
    (alternatives: string[]) => {
      gotResultRef.current = true;
      clearGraceTimer();
      const nonEmpty = alternatives.map((a) => a.trim()).filter(Boolean);
      console.debug('[usePushToTalk] VoiceTimingMarker transcriptReceived', nonEmpty);
      markTiming('transcriptReceived', nonEmpty.length);
      if (nonEmpty.length > 0) {
        onAlternatives(nonEmpty);
      } else {
        onEmpty();
      }
    },
    [onAlternatives, onEmpty, clearGraceTimer],
  );

  const scheduleReleaseGrace = useCallback(() => {
    if (gotResultRef.current) return;
    clearGraceTimer();
    console.debug(`[usePushToTalk] release grace ${RELEASE_GRACE_MS}ms`);
    graceRef.current = setTimeout(() => {
      if (!gotResultRef.current) {
        console.debug('[usePushToTalk] release grace expired — empty');
        onEmpty();
      }
    }, RELEASE_GRACE_MS);
  }, [onEmpty, clearGraceTimer]);

  const startListening = useCallback(() => {
    if (!enabled || !isSpeechRecognitionSupported() || holdingRef.current) return;

    // Abort stale session before starting a new capture
    sessionRef.current?.abort();
    sessionRef.current = null;
    clearGraceTimer();

    gotResultRef.current = false;
    holdingRef.current = true;
    setIsListening(true);
    setPhase('listening');
    console.debug('[usePushToTalk] VoiceTimingMarker listenStart');
    markTiming('listenStart');

    sessionRef.current = createRecognitionSession({
      onResult: handleAlternatives,
      onError: (code) => {
        if (code !== 'aborted' && code !== 'no-speech') {
          onError(code);
        } else if (!gotResultRef.current) {
          scheduleReleaseGrace();
        }
      },
      onEnd: () => {
        setIsListening(false);
        setPhase('processing');
        clearListenTimeout();
        sessionRef.current = null;
        holdingRef.current = false;
        console.debug('[usePushToTalk] VoiceTimingMarker listenEnd');
        markTiming('listenEnd');
        if (!gotResultRef.current) {
          scheduleReleaseGrace();
        }
      },
    });

    sessionRef.current?.start();

    timeoutRef.current = setTimeout(() => {
      console.debug('[usePushToTalk] listen timeout');
      sessionRef.current?.stop();
    }, LISTEN_TIMEOUT_MS);
  }, [enabled, handleAlternatives, onError, clearListenTimeout, clearGraceTimer, scheduleReleaseGrace]);

  const stopListening = useCallback(() => {
    if (!holdingRef.current) return;
    console.debug('[usePushToTalk] stop requested');
    clearListenTimeout();
    sessionRef.current?.stop();
  }, [clearListenTimeout]);

  useEffect(() => {
    if (!enabled) {
      endSession();
    }
  }, [enabled, endSession]);

  useEffect(() => {
    return () => {
      clearListenTimeout();
      clearGraceTimer();
      sessionRef.current?.abort();
    };
  }, [clearListenTimeout, clearGraceTimer]);

  // Space key shortcut (US4)
  useEffect(() => {
    if (!enabled || !spaceEnabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();
      startListening();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      stopListening();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, spaceEnabled, startListening, stopListening]);

  const speakButtonProps = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      startListening();
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      stopListening();
    },
    onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
      if (holdingRef.current) {
        e.preventDefault();
        stopListening();
      }
    },
    'aria-pressed': isListening,
  };

  return {
    phase,
    setPhase,
    isListening,
    speakButtonProps,
    endSession,
  };
}

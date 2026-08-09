import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { VoiceCapturePhase } from '../types';
import { createRecognitionSession, isSpeechRecognitionSupported } from './speechRecognition';

const LISTEN_TIMEOUT_MS = 5000;

interface UsePushToTalkOptions {
  enabled: boolean;
  spaceEnabled?: boolean;
  onTranscript: (text: string) => void;
  onEmpty: () => void;
  onError: (code: string) => void;
}

export function usePushToTalk({
  enabled,
  spaceEnabled = false,
  onTranscript,
  onEmpty,
  onError,
}: UsePushToTalkOptions) {
  const [phase, setPhase] = useState<VoiceCapturePhase>('idle');
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<ReturnType<typeof createRecognitionSession> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gotResultRef = useRef(false);
  const holdingRef = useRef(false);

  const clearListenTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const endSession = useCallback(() => {
    clearListenTimeout();
    sessionRef.current?.abort();
    sessionRef.current = null;
    holdingRef.current = false;
    setIsListening(false);
    if (phase === 'listening' || phase === 'processing') {
      setPhase('idle');
    }
  }, [clearListenTimeout, phase]);

  const startListening = useCallback(() => {
    if (!enabled || !isSpeechRecognitionSupported() || holdingRef.current) return;

    gotResultRef.current = false;
    holdingRef.current = true;
    setIsListening(true);
    setPhase('listening');
    console.debug('[usePushToTalk] listening started');

    sessionRef.current = createRecognitionSession({
      onResult: (transcript) => {
        gotResultRef.current = true;
        const trimmed = transcript.trim();
        if (trimmed) {
          onTranscript(trimmed);
        } else {
          onEmpty();
        }
      },
      onError: (code) => {
        if (code !== 'aborted' && code !== 'no-speech') {
          onError(code);
        } else if (!gotResultRef.current) {
          onEmpty();
        }
      },
      onEnd: () => {
        setIsListening(false);
        setPhase('processing');
        clearListenTimeout();
        sessionRef.current = null;
        holdingRef.current = false;
        console.debug('[usePushToTalk] listening ended');
      },
    });

    sessionRef.current?.start();

    timeoutRef.current = setTimeout(() => {
      console.debug('[usePushToTalk] listen timeout');
      sessionRef.current?.stop();
      if (!gotResultRef.current) {
        onEmpty();
      }
    }, LISTEN_TIMEOUT_MS);
  }, [enabled, onTranscript, onEmpty, onError, clearListenTimeout]);

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
      sessionRef.current?.abort();
    };
  }, [clearListenTimeout]);

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

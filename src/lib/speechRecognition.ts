/** Web Speech API types — browser provides implementation */
interface SpeechRecognitionResultLike {
  length: number;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** True when browser exposes Web Speech API */
export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

/** Request mic permission via getUserMedia before first voice capture */
export async function requestMicrophonePermission(): Promise<'granted' | 'denied'> {
  if (!navigator.mediaDevices?.getUserMedia) {
    console.debug('[speechRecognition] getUserMedia unavailable');
    return 'denied';
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    console.debug('[speechRecognition] microphone permission granted');
    return 'granted';
  } catch {
    console.debug('[speechRecognition] microphone permission denied');
    return 'denied';
  }
}

export interface RecognitionSession {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function createRecognitionSession(options: {
  lang?: string;
  onResult: (alternatives: string[]) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}): RecognitionSession | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = options.lang ?? 'en-US';
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const alternatives: string[] = [];
    const result = event.results[0];
    if (result) {
      for (let i = 0; i < result.length; i++) {
        alternatives.push(result[i]?.transcript ?? '');
      }
    }
    console.debug(`[speechRecognition] alternatives=${JSON.stringify(alternatives)}`);
    options.onResult(alternatives);
  };

  recognition.onerror = (event) => {
    console.debug(`[speechRecognition] error=${event.error}`);
    options.onError(event.error);
  };

  recognition.onend = () => {
    console.debug('[speechRecognition] ended');
    options.onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.debug('[speechRecognition] start failed', err);
        options.onError('aborted');
      }
    },
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}

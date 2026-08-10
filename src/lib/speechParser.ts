import type { ParseSpeechResult } from '../types';

export interface ParseSpeechOptions {
  /** Tie-breaker when multiple valid numbers parsed; typically problem sum */
  expectedMax?: number;
}

const ONES: Record<string, number> = {
  zero: 0,
  oh: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/** Homophone / STT mis-hearing normalization (token-level) */
const HOMOPHONE_MAP: Record<string, string> = {
  fitty: 'fifty',
  fiddy: 'fifty',
  fiveteen: 'fifteen',
  forteen: 'fourteen',
  thirtee: 'thirteen',
};

const FILLER_PREFIXES = [
  'um',
  'uh',
  "it's",
  'its',
  'the answer is',
  'equals',
  'is',
];

/** Global filler tokens removed anywhere in phrase */
const GLOBAL_FILLER_TOKENS = new Set([
  'um',
  'uh',
  'like',
  "it's",
  'its',
  'the',
  'answer',
  'is',
  'equals',
]);

function applyHomophoneMap(text: string): string {
  return text
    .split(' ')
    .map((token) => HOMOPHONE_MAP[token] ?? token)
    .join(' ');
}

function removeGlobalFillers(text: string): string {
  return text
    .split(' ')
    .filter((token) => token.length > 0 && !GLOBAL_FILLER_TOKENS.has(token))
    .join(' ');
}

/** Normalize spoken transcript for number parsing */
function normalizeTranscript(transcript: string): string {
  let text = transcript.trim().toLowerCase();
  text = text.replace(/[.,!?]/g, ' ');
  text = text.replace(/-/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  for (const filler of FILLER_PREFIXES) {
    if (text.startsWith(`${filler} `)) {
      text = text.slice(filler.length + 1).trim();
    }
  }

  text = applyHomophoneMap(text);
  text = removeGlobalFillers(text);

  return text;
}

function parseWordNumber(text: string): number | null {
  if (text in ONES) return ONES[text];
  if (text in TENS) return TENS[text];

  const compound = text.match(/^(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety) (one|two|three|four|five|six|seven|eight|nine)$/);
  if (compound) {
    const tens = TENS[compound[1]];
    const ones = ONES[compound[2]];
    if (tens !== undefined && ones !== undefined) return tens + ones;
  }

  // "oh seven" → 7
  const ohDigit = text.match(/^oh (one|two|three|four|five|six|seven|eight|nine)$/);
  if (ohDigit && ohDigit[1] in ONES) {
    return ONES[ohDigit[1]];
  }

  return null;
}

/** Tie-break among multiple candidate values using expectedMax (VR-025) */
function resolveCandidates(
  candidates: number[],
  rawTranscript: string,
  options?: ParseSpeechOptions,
): ParseSpeechResult {
  const unique = [...new Set(candidates)];

  if (unique.length === 1) {
    return { ok: true, value: unique[0], rawTranscript };
  }

  if (options?.expectedMax !== undefined) {
    const filtered = unique.filter((v) => v <= options.expectedMax!);
    if (filtered.length === 1) {
      return { ok: true, value: filtered[0], rawTranscript };
    }
  }

  return { ok: false, reason: 'ambiguous', rawTranscript };
}

/** Convert speech transcript to a number 0–99 for answer scoring */
export function parseSpokenNumber(
  transcript: string,
  options?: ParseSpeechOptions,
): ParseSpeechResult {
  const rawTranscript = transcript;
  const normalized = normalizeTranscript(transcript);

  if (!normalized) {
    return { ok: false, reason: 'no-number', rawTranscript };
  }

  if (/\bhundred\b/.test(normalized)) {
    return { ok: false, reason: 'out-of-range', rawTranscript };
  }

  // Pure digits
  if (/^\d+$/.test(normalized)) {
    const value = Number.parseInt(normalized, 10);
    if (value > 99) return { ok: false, reason: 'out-of-range', rawTranscript };
    return { ok: true, value, rawTranscript };
  }

  // Embedded digit sequence
  const digitMatch = normalized.match(/\d+/);
  if (digitMatch) {
    const allDigits = normalized.match(/\d+/g) ?? [];
    if (allDigits.length > 1) {
      return { ok: false, reason: 'ambiguous', rawTranscript };
    }
    const value = Number.parseInt(digitMatch[0], 10);
    if (value > 99) return { ok: false, reason: 'out-of-range', rawTranscript };
    return { ok: true, value, rawTranscript };
  }

  // Word forms — detect multiple number tokens
  const tokens = normalized.split(' ');
  const numberTokens: number[] = [];

  let i = 0;
  while (i < tokens.length) {
    const twoWord = tokens.slice(i, i + 2).join(' ');
    const parsedTwo = parseWordNumber(twoWord);
    if (parsedTwo !== null && twoWord.includes(' ')) {
      numberTokens.push(parsedTwo);
      i += 2;
      continue;
    }

    const parsedOne = parseWordNumber(tokens[i]);
    if (parsedOne !== null) {
      numberTokens.push(parsedOne);
      i += 1;
      continue;
    }

    i += 1;
  }

  if (numberTokens.length === 0) {
    return { ok: false, reason: 'no-number', rawTranscript };
  }

  if (numberTokens.length > 1) {
    return resolveCandidates(numberTokens, rawTranscript, options);
  }

  const value = numberTokens[0];
  if (value > 99) {
    return { ok: false, reason: 'out-of-range', rawTranscript };
  }

  return { ok: true, value, rawTranscript };
}

/** Parse STT alternatives; first ok wins unless multiple values need tie-break */
export function parseSpokenAlternatives(
  alternatives: string[],
  options?: ParseSpeechOptions,
): ParseSpeechResult {
  const successes: ParseSpeechResult[] = [];

  for (const alt of alternatives) {
    const result = parseSpokenNumber(alt, options);
    if (result.ok) {
      successes.push(result);
    }
  }

  if (successes.length === 0) {
    return {
      ok: false,
      reason: 'no-number',
      rawTranscript: alternatives[0] ?? '',
    };
  }

  const values = successes.map((s) => (s.ok ? s.value : 0));
  return resolveCandidates(values, successes[0].rawTranscript, options);
}

/** Strip non-digits from input — blocks letters and symbols */
export function sanitizeNumericInput(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** True when the sanitized value is empty */
export function isEmptyAnswer(value: string): boolean {
  return sanitizeNumericInput(value).length === 0;
}

/** Parse answer or return null if empty */
export function parseAnswer(value: string): number | null {
  const cleaned = sanitizeNumericInput(value);
  if (cleaned.length === 0) return null;
  return Number.parseInt(cleaned, 10);
}

export type ValidationResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'invalid' };

export function validateAnswer(value: string): ValidationResult {
  if (isEmptyAnswer(value)) {
    return { ok: false, reason: 'empty' };
  }
  const parsed = parseAnswer(value);
  if (parsed === null || Number.isNaN(parsed)) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, value: parsed };
}

const MAX_PAD_DIGITS = 3;
const MAX_PAD_VALUE = 99;

/** Append a digit to the number-pad display string (VR-014) */
export function appendPadDigit(current: string, digit: string): string {
  const d = sanitizeNumericInput(digit);
  if (!d) return current;
  const next = current + d;
  if (next.length > MAX_PAD_DIGITS) return current;
  const parsed = Number.parseInt(next, 10);
  if (parsed > MAX_PAD_VALUE) return current;
  return next;
}

/** Clear number-pad digits */
export function clearPadDigits(): string {
  return '';
}

/** Parse pad digits or return null if empty */
export function parsePadDigits(digits: string): number | null {
  return parseAnswer(digits);
}

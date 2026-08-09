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

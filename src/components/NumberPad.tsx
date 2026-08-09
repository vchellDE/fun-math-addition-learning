import { appendPadDigit, clearPadDigits, parsePadDigits } from '../lib/validators';

interface NumberPadProps {
  digits: string;
  disabled?: boolean;
  onDigitsChange: (digits: string) => void;
  onCheck: (value: number) => void;
  onEmptyCheck: () => void;
}

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

/** On-screen number pad fallback — no text input, no OS keyboard */
export function NumberPad({
  digits,
  disabled = false,
  onDigitsChange,
  onCheck,
  onEmptyCheck,
}: NumberPadProps) {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    onDigitsChange(appendPadDigit(digits, digit));
  };

  const handleClear = () => {
    if (disabled) return;
    onDigitsChange(clearPadDigits());
  };

  const handleCheck = () => {
    if (disabled) return;
    const value = parsePadDigits(digits);
    if (value === null) {
      onEmptyCheck();
      return;
    }
    onCheck(value);
    onDigitsChange(clearPadDigits());
  };

  return (
    <div className="number-pad">
      <div className="pad-display" role="status" aria-live="polite" aria-label="Your answer">
        {digits || '—'}
      </div>
      <div className="pad-grid">
        {PAD_KEYS.slice(0, 9).map((digit) => (
          <button
            key={digit}
            type="button"
            className="pad-key"
            disabled={disabled}
            aria-label={`Digit ${digit}`}
            onClick={() => handleDigit(digit)}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="pad-key pad-key-clear"
          disabled={disabled}
          aria-label="Clear"
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="pad-key"
          disabled={disabled}
          aria-label="Digit 0"
          onClick={() => handleDigit('0')}
        >
          0
        </button>
        <button
          type="button"
          className="pad-key pad-key-check btn-primary"
          disabled={disabled}
          aria-label="Check"
          onClick={handleCheck}
        >
          Check
        </button>
      </div>
    </div>
  );
}

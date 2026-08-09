interface HoldToSpeakButtonProps {
  disabled?: boolean;
  isListening: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => void;
  'aria-pressed': boolean;
}

/** Large push-to-talk control — hold while speaking the answer */
export function HoldToSpeakButton({
  disabled = false,
  isListening,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  'aria-pressed': ariaPressed,
}: HoldToSpeakButtonProps) {
  return (
    <button
      type="button"
      className={`btn-speak${isListening ? ' listening' : ''}`}
      disabled={disabled}
      aria-label="Hold to Speak your answer"
      aria-pressed={ariaPressed}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {isListening ? 'Listening…' : 'Hold to Speak'}
    </button>
  );
}

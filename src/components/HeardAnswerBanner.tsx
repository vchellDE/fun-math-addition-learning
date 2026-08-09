interface HeardAnswerBannerProps {
  value: number;
  retryUsed: boolean;
  disabled?: boolean;
  onTryAgain: () => void;
}

/** Shows interpreted voice answer, then auto-checks after a short pause */
export function HeardAnswerBanner({
  value,
  retryUsed,
  disabled = false,
  onTryAgain,
}: HeardAnswerBannerProps) {
  return (
    <div className="heard-answer-banner" role="status" aria-live="polite">
      <p className="heard-answer-label">
        I heard: <span className="heard-answer-value">{value}</span>
      </p>
      <p className="heard-answer-hint">Checking your answer…</p>
      {!retryUsed && (
        <div className="button-group heard-answer-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={disabled}
            onClick={onTryAgain}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

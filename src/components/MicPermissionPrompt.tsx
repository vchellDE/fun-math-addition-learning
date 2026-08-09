interface MicPermissionPromptProps {
  onAllow: () => void;
  onUsePad: () => void;
}

/** First-time microphone permission explanation for parent and child */
export function MicPermissionPrompt({ onAllow, onUsePad }: MicPermissionPromptProps) {
  return (
    <div className="mic-permission-prompt" role="dialog" aria-labelledby="mic-prompt-title">
      <h2 id="mic-prompt-title" className="mic-prompt-title">
        We need your microphone
      </h2>
      <p className="mic-prompt-body">
        Hold the button and say your answer out loud. A grown-up may need to tap Allow.
      </p>
      <div className="button-group">
        <button type="button" className="btn-primary" onClick={onAllow}>
          Allow Microphone
        </button>
        <button type="button" className="btn-secondary" onClick={onUsePad}>
          Use Number Pad Instead
        </button>
      </div>
    </div>
  );
}

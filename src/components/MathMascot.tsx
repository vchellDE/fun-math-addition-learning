/** Friendly star mascot for landing — palette tokens only (FR-011) */
export function MathMascot() {
  return (
    <svg
      className="math-mascot"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Friendly math star mascot"
    >
      <polygon
        points="60,8 74,44 112,48 82,72 92,108 60,88 28,108 38,72 8,48 46,44"
        fill="var(--color-primary)"
        stroke="var(--color-text)"
        strokeWidth="2"
      />
      <circle cx="45" cy="52" r="5" fill="var(--color-bg)" />
      <circle cx="75" cy="52" r="5" fill="var(--color-bg)" />
      <circle cx="46" cy="53" r="2" fill="var(--color-text)" />
      <circle cx="76" cy="53" r="2" fill="var(--color-text)" />
      <path
        d="M 48 68 Q 60 78 72 68"
        fill="none"
        stroke="var(--color-bg)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fill="var(--color-bg)"
      >
        +
      </text>
    </svg>
  );
}

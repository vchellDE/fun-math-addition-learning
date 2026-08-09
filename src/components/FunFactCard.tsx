import { useState } from 'react';
import { FUN_FACTS } from '../lib/funFacts';

export function FunFactCard() {
  const [index, setIndex] = useState(0);
  const fact = FUN_FACTS[index];

  const handleNext = () => {
    // Wrap around at end — never show empty state (spec edge case)
    setIndex((i) => (i + 1) % FUN_FACTS.length);
    console.debug(`[FunFactCard] next fact index=${(index + 1) % FUN_FACTS.length}`);
  };

  return (
    <div className="fun-fact-card">
      {fact.emoji && <span className="fun-fact-emoji" aria-hidden="true">{fact.emoji}</span>}
      <p className="fun-fact-text">{fact.text}</p>
      <div className="fun-fact-dots" aria-hidden="true">
        {FUN_FACTS.map((f, i) => (
          <span key={f.id} className={`fun-fact-dot ${i === index ? 'active' : ''}`} />
        ))}
      </div>
      <button type="button" className="btn-secondary fun-fact-next" onClick={handleNext}>
        Next Fact
      </button>
    </div>
  );
}

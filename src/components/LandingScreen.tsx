import { MathMascot } from './MathMascot';
import { FunFactCard } from './FunFactCard';

interface LandingScreenProps {
  onStartPractice: () => void;
}

export function LandingScreen({ onStartPractice }: LandingScreenProps) {
  return (
    <div className="app-card landing-card">
      <MathMascot />
      <h1>Welcome to Fun Math!</h1>
      <p className="landing-subhead">Train your brain with addition!</p>
      <FunFactCard />
      <div className="button-group">
        <button type="button" className="btn-primary" onClick={onStartPractice}>
          Let&apos;s Practice!
        </button>
      </div>
    </div>
  );
}

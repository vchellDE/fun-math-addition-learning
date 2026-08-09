import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

describe('Landing flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows landing page as default entry', () => {
    render(<App />);
    expect(screen.getByText(/welcome to fun math/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /let's practice/i })).toBeInTheDocument();
    expect(screen.queryByText(/pick your level/i)).not.toBeInTheDocument();
  });

  it('cycles fun facts when Next Fact is tapped', () => {
    render(<App />);
    const firstFact = screen.getByText(/adding zero to any number/i);
    expect(firstFact).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next fact/i }));
    expect(screen.queryByText(/adding zero to any number/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next fact/i })).toBeInTheDocument();
  });

  it('navigates from landing to level-select via Let\'s Practice', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    expect(screen.getByText(/pick your level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument();
  });

  it('returns to landing from level-select via Home', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /let's practice/i }));
    fireEvent.click(screen.getByRole('button', { name: /^home$/i }));
    expect(screen.getByText(/welcome to fun math/i)).toBeInTheDocument();
  });
});

import type { Outcome } from '../domain/outcome';

type Base = Readonly<{ credits: number; spins: number; lastOutcome: Outcome | null }>;
export type GameState = Base & (
  | { phase: 'loading' }
  | { phase: 'idle' }
  | { phase: 'spinning'; outcome: Outcome }
  | { phase: 'presentingResult'; outcome: Outcome }
  | { phase: 'error'; message: string }
);

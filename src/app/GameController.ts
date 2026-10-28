import type { GameState } from './gameState';
import { createOutcome, sampleSymbols, type Outcome, type RandomIndex } from '../domain/outcome';
import { RULES } from '../domain/rules';
import type { Symbols } from '../domain/symbols';

export interface Presentation {
  spin(outcome: Outcome, signal: AbortSignal): Promise<void>;
  present(outcome: Outcome, signal: AbortSignal): Promise<void>;
  reset(): void;
}

export class GameController {
  private current: GameState = { phase: 'loading', credits: RULES.startingCredits, spins: 0, lastOutcome: null };
  private lifetime = new AbortController();
  private destroyed = false;

  constructor(
    private readonly random: RandomIndex,
    private readonly presentation: Presentation,
    private readonly onChange: (state: GameState) => void,
    private readonly onResult: (outcome: Outcome, credits: number) => void,
    startingCredits: number = RULES.startingCredits,
  ) {
    if (!Number.isInteger(startingCredits) || startingCredits < 0) throw new RangeError('Invalid starting credits');
    this.current = { ...this.current, credits: startingCredits };
  }

  get state(): GameState { return this.current; }

  ready(): void {
    if (!this.destroyed && this.current.phase === 'loading') this.set({ ...this.current, phase: 'idle' });
  }

  private set(state: GameState): void {
    if (this.destroyed) return;
    this.current = Object.freeze(state);
    this.onChange(this.current);
  }

  async spin(preview?: Symbols): Promise<boolean> {
    if (this.destroyed || this.current.phase !== 'idle' || this.current.credits < RULES.cost) return false;
    // The immutable result exists before animation. Preview is supplied only by the dev module.
    let outcome: Outcome;
    try { outcome = createOutcome(preview ?? sampleSymbols(this.random)); }
    catch { this.fail('The random source was unavailable. Reset the instrument to try again.'); return false; }
    const signal = this.lifetime.signal;
    this.set({ ...this.current, phase: 'spinning', outcome, credits: this.current.credits - RULES.cost, spins: this.current.spins + 1 });
    try {
      await this.presentation.spin(outcome, signal);
      if (signal.aborted) return false;
      this.set({ ...this.current, phase: 'presentingResult', outcome, lastOutcome: outcome, credits: this.current.credits + outcome.award });
      this.onResult(outcome, this.current.credits);
      await this.presentation.present(outcome, signal);
      if (signal.aborted) return false;
      this.set({ ...this.current, phase: 'idle' });
      return true;
    } catch {
      if (!signal.aborted) this.fail('The display was interrupted. Reset the instrument to start again.');
      return false;
    }
  }

  reset(): boolean {
    if (this.destroyed || !['idle', 'error'].includes(this.current.phase)) return false;
    this.lifetime.abort();
    this.lifetime = new AbortController();
    this.presentation.reset();
    this.set({ phase: 'idle', credits: RULES.startingCredits, spins: 0, lastOutcome: null });
    return true;
  }

  fail(message: string): void { this.set({ ...this.current, phase: 'error', message }); }

  destroy(): void {
    this.destroyed = true;
    this.lifetime.abort();
  }
}

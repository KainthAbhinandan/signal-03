import type { GameState } from '../app/gameState';
import type { Outcome } from '../domain/outcome';
import { SYMBOL_NAMES } from '../domain/symbols';
import { INITIAL_SYMBOLS } from '../rendering/GameView';
import { easeOut } from '../shared/easing';
import { motion } from '../config/motion';

export function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Missing UI element: ${id}`);
  return result as T;
}

export class Controls {
  private readonly spin = element<HTMLButtonElement>('spin');
  private readonly reset = element<HTMLButtonElement>('reset');
  private readonly credits = element('credits');
  private readonly accessibleCredits = element('credits-accessible');
  private readonly title = element('result-title');
  private readonly detail = element('result-detail');
  private readonly symbolText = element('symbols');
  private displayedCredits = 100;
  private fromCredits = 100;
  private targetCredits = 100;
  private elapsed = motion.creditDuration as number;
  private reduced = false;
  private liveCount = 0;
  private readonly listeners = new AbortController();

  constructor(onSpin: () => void, onReset: () => void) {
    const signal = this.listeners.signal;
    this.spin.addEventListener('click', onSpin, { signal });
    this.reset.addEventListener('click', onReset, { signal });
    document.addEventListener('keydown', event => {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      // Prevent held keys and the native repeat-click behavior, including focused buttons.
      if (event.repeat) { event.preventDefault(); return; }
      const target = event.target as HTMLElement | null;
      if (target?.closest('button, input, select, textarea, a, summary, [contenteditable="true"]')) return;
      if (event.code === 'Space') { event.preventDefault(); onSpin(); }
    }, { signal });
  }

  setReducedMotion(value: boolean): void { this.reduced = value; }

  update(state: GameState): void {
    const idle = state.phase === 'idle';
    const busy = state.phase === 'spinning' || state.phase === 'presentingResult';
    this.spin.disabled = !idle || state.credits < 1;
    this.reset.disabled = busy || state.phase === 'loading';
    this.reset.classList.toggle('reset-needed', idle && state.credits === 0);
    element('spin-label').textContent = busy ? 'TUNING' : state.credits === 0 ? 'NO CREDITS' : 'SPIN';
    this.spin.setAttribute('aria-label', busy ? 'Spin in progress' : state.credits === 0 ? 'No credits. Reset to play again.' : 'Spin for 1 demo credit');
    element('machine-state').textContent = busy ? 'SCANNING FREQUENCIES' : state.phase === 'error' ? 'SIGNAL INTERRUPTED' : state.credits === 0 ? 'RESET TO RECONNECT' : 'SYSTEM READY';
    element('status-led').classList.toggle('is-busy', busy);
    this.accessibleCredits.textContent = `${state.credits} demo credits`;
    if (state.credits !== this.targetCredits) {
      this.fromCredits = this.displayedCredits;
      this.targetCredits = state.credits;
      this.elapsed = this.reduced ? motion.creditDuration : 0;
    }
    if (state.phase === 'spinning') {
      this.title.textContent = 'Looking for a connection…';
      this.detail.textContent = 'Three independent signals. One center line.';
      this.symbolText.textContent = '— / — / —';
      element('award').textContent = '—';
      element('award').className = 'award';
      element('credit-change').textContent = '−1';
    } else if (idle && !state.lastOutcome) {
      this.title.textContent = 'Ready to find your frequency.';
      this.detail.textContent = 'Press spin. See what connects.';
      this.symbolText.textContent = INITIAL_SYMBOLS.map(s => SYMBOL_NAMES[s]).join(' / ').toUpperCase();
      element('award').textContent = '—';
      element('award').className = 'award';
      element('credit-change').textContent = '';
    }
    if (idle && state.credits === 0) this.detail.textContent = 'Out of demo credits. Reset to reconnect.';
    if (state.phase === 'error') { this.title.textContent = 'Signal interrupted.'; this.detail.textContent = state.message; }
    this.spin.closest('.machine')?.setAttribute('data-phase', state.phase);
  }

  showResult(outcome: Outcome, credits: number): void {
    const names = outcome.symbols.map(s => SYMBOL_NAMES[s]).join(' / ');
    const title = outcome.kind === 'triple' ? 'Signal locked.' : outcome.kind === 'pair' ? 'A small connection.' : 'Not quite in sync.';
    const detail = outcome.kind === 'triple' ? 'Three aligned. 5 credits awarded.' : outcome.kind === 'pair' ? 'Two aligned. 1 credit awarded — stake returned.' : 'No match this time. Try another frequency.';
    this.title.textContent = title;
    this.detail.textContent = detail;
    this.symbolText.textContent = names.toUpperCase();
    element('award').textContent = outcome.award ? `+${outcome.award} CR` : '0 CR';
    element('award').className = `award ${outcome.kind === 'triple' ? 'locked' : ''}`;
    element('credit-change').textContent = outcome.award ? `+${outcome.award}` : '';
    // A unique sequence makes identical consecutive results announce once each.
    element('live-result').textContent = `Spin ${++this.liveCount}. ${names}. ${title} ${detail} Balance ${credits} demo credits.`;
  }

  tick(delta: number): void {
    if (this.elapsed >= motion.creditDuration && this.displayedCredits === this.targetCredits) return;
    this.elapsed = Math.min(motion.creditDuration, this.elapsed + delta);
    this.displayedCredits = this.fromCredits + (this.targetCredits - this.fromCredits) * easeOut(this.elapsed / motion.creditDuration);
    this.credits.textContent = String(Math.round(this.displayedCredits)).padStart(4, '0');
  }

  destroy(): void { this.listeners.abort(); }
}

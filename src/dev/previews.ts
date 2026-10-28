import type { GameController } from '../app/GameController';
import type { GameView } from '../rendering/GameView';
import type { Symbols } from '../domain/symbols';
import { element } from '../ui/controls';

const previews: Record<string, Symbols> = {
  none: ['pulse', 'orbit', 'wave'],
  pair: ['orbit', 'wave', 'orbit'],
  triple: ['spark', 'spark', 'spark'],
};
const listeners = new AbortController();
export function startingCredits(): number {
  return new URLSearchParams(location.search).get('dev-credits') === '0' ? 0 : 100;
}
export function attachPreviews(controller: GameController, view: GameView, gesture: () => void): void {
  element('dev-controls').innerHTML = `<details class="dev-panel"><summary>DEVELOPMENT ONLY / RESULT PREVIEW</summary><p>Forced results for inspection. Normal SPIN always uses independent random symbols.</p><div>${Object.keys(previews).map(key => `<button type="button" data-preview="${key}">Preview ${key === 'none' ? 'no match' : key}</button>`).join('')}<a href="?dev-credits=0">Open zero-credit fixture ↗</a></div></details>`;
  element('dev-controls').addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-preview]');
    if (!button || controller.state.phase !== 'idle') return;
    gesture();
    void controller.spin(previews[button.dataset.preview!]);
  }, { signal: listeners.signal });
  // Read-only diagnostics for browser assertions; never part of the production bundle.
  Object.defineProperty(window, '__signalDebug', { configurable: true, value: {
    get state() { return controller.state; },
    get settledSymbols() { return view.settledSymbols; },
  } });
}
export function cleanup(): void {
  listeners.abort();
  Reflect.deleteProperty(window, '__signalDebug');
}

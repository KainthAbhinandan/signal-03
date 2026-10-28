import { GameController } from './GameController';
import { GameView } from '../rendering/GameView';
import { AudioController } from '../audio/AudioController';
import { Controls, element } from '../ui/controls';
import { loadPreferences, savePreferences } from '../ui/preferences';
import { renderShell } from '../ui/shell';
import { cryptoRandomIndex } from '../shared/random';

/** Composition root: concrete dependencies meet here, rather than inside the domain. */
export async function createGame(root: HTMLElement): Promise<() => void> {
  renderShell(root);
  const listeners = new AbortController();
  const preferences = loadPreferences();
  let unavailable = false;
  let destroyed = false;
  const audio = new AudioController(preferences, () => { unavailable = true; refreshAudio(); });
  const view = new GameView(element('game-canvas'), (cue, index) => audio.play(cue, index));
  const activateAndClick = () => { void audio.activate().then(() => audio.play('click')); };
  const controls = new Controls(() => {
    if (controller.state.phase !== 'idle' || controller.state.credits < 1) return;
    activateAndClick();
    void controller.spin();
  }, () => {
    if (controller.reset()) { activateAndClick(); element('live-result').textContent = 'Instrument reset. 100 demo credits. Ready to play.'; }
  });
  // The query fixture and result preview module are removed by Vite's production branch elimination.
  const dev = import.meta.env.DEV ? await import('../dev/previews') : null;
  const controller = new GameController(cryptoRandomIndex, view, state => controls.update(state), (outcome, credits) => {
    controls.showResult(outcome, credits);
    if (outcome.kind !== 'none') audio.play(outcome.kind);
  }, dev?.startingCredits() ?? 100);
  controls.update(controller.state);
  view.setFrameListener(delta => controls.tick(delta));
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => { view.setReducedMotion(media.matches); controls.setReducedMotion(media.matches); };
  reducedMotion();
  media.addEventListener('change', reducedMotion, { signal: listeners.signal });

  const mute = element<HTMLButtonElement>('mute');
  const volume = element<HTMLInputElement>('volume');
  function refreshAudio(): void {
    const silent = preferences.muted || preferences.volume === 0;
    element('audio-label').textContent = unavailable ? 'SOUND UNAVAILABLE' : silent ? 'SOUND OFF' : 'SOUND ON';
    mute.setAttribute('aria-pressed', String(preferences.muted));
    mute.setAttribute('aria-label', preferences.muted ? 'Unmute sound' : 'Mute sound');
    mute.classList.toggle('is-muted', silent);
    volume.value = String(Math.round(preferences.volume * 100));
    volume.style.setProperty('--volume', `${preferences.volume * 100}%`);
  }
  const persistAudio = () => { audio.setPreferences(preferences.muted, preferences.volume); savePreferences(preferences); refreshAudio(); };
  refreshAudio();
  mute.addEventListener('click', () => { preferences.muted = !preferences.muted; persistAudio(); void audio.activate(); }, { signal: listeners.signal });
  volume.addEventListener('input', () => { preferences.volume = Number(volume.value) / 100; persistAudio(); void audio.activate(); }, { signal: listeners.signal });
  const visibility = () => { view.setHidden(document.hidden); audio.setHidden(document.hidden); };
  document.addEventListener('visibilitychange', visibility, { signal: listeners.signal });
  element('retry').addEventListener('click', () => location.reload(), { signal: listeners.signal });

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    listeners.abort();
    controller.destroy();
    controls.destroy();
    view.destroy();
    audio.destroy();
    dev?.cleanup();
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: listeners.signal });

  try {
    await view.init();
    if (destroyed) return destroy;
    element('loading').hidden = true;
    visibility();
    controller.ready();
    dev?.attachPreviews(controller, view, activateAndClick);
  } catch (error) {
    console.error('SIGNAL / 03 initialization failed', error);
    element('loading').hidden = true;
    element('recovery').hidden = false;
    element('error-message').textContent = 'The instrument could not start its graphics display. Try reloading or use a browser with WebGL enabled.';
    controller.fail('The graphics display could not start. Reload the instrument to try again.');
    element<HTMLButtonElement>('reset').disabled = true;
    element('game-canvas').setAttribute('aria-label', 'Graphics unavailable');
  }
  return destroy;
}

// Run in the dev page using agent-browser eval --stdin. No runtime dependency.
(async () => {
  const checks = [];
  const assert = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const idle = async () => {
    for (let i = 0; i < 80; i++) { if (window.__signalDebug.state.phase === 'idle') return; await wait(50); }
    throw new Error('Spin did not return to idle');
  };
  const debug = window.__signalDebug;
  assert(!!debug, 'Development diagnostics available');
  assert(document.querySelector('canvas').width > 0, 'Pixi canvas initialized');
  assert(!document.querySelector('vite-error-overlay'), 'No Vite error overlay');
  assert(document.documentElement.scrollWidth === innerWidth, 'No horizontal overflow');
  document.querySelector('#reset').click();
  const before = debug.state.spins;
  document.querySelector('#spin').click();
  const sampled = [...debug.state.outcome.symbols];
  for (let i = 0; i < 30; i++) document.querySelector('#spin').click();
  for (let i = 0; i < 30; i++) document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: true, bubbles: true, cancelable: true }));
  document.querySelector('#reset').click();
  assert(debug.state.spins === before + 1 && debug.state.credits === 99, 'Rapid click/key-repeat and busy reset rejected');
  assert(document.querySelector('#spin').disabled && document.querySelector('#reset').disabled, 'Active controls disabled');
  await idle();
  assert(JSON.stringify(debug.settledSymbols) === JSON.stringify(sampled), 'Final reel symbols equal the sampled outcome');
  assert(document.querySelector('#live-result').textContent.includes('Spin'), 'Completed result announced');
  assert(document.querySelector('#symbols').textContent === sampled.join(' / ').toUpperCase(), 'Visible text summary matches reels');
  document.querySelector('#reset').click();
  assert(debug.state.credits === 100 && debug.state.spins === 0, 'Idle reset restores credits');
  document.querySelector('.dev-panel').open = true;
  for (const [kind, balance] of [['none',99],['pair',100],['triple',104]]) {
    document.querySelector('#reset').click();
    document.querySelector(`[data-preview="${kind}"]`).click();
    await idle();
    assert(debug.state.lastOutcome.kind === kind && debug.state.credits === balance, `Preview ${kind}: correct accounting`);
    assert(JSON.stringify(debug.settledSymbols) === JSON.stringify(debug.state.lastOutcome.symbols), `Preview ${kind}: correct final symbols`);
    if (kind === 'pair') assert(document.querySelector('#result-detail').textContent.includes('stake returned'), 'Pair described as refund');
  }
  document.querySelector('#mute').click();
  assert(document.querySelector('#mute').getAttribute('aria-pressed') === 'true', 'Mute toggles accessibly');
  const volume = document.querySelector('#volume');
  volume.value = '22'; volume.dispatchEvent(new Event('input', { bubbles: true }));
  const prefs = JSON.parse(localStorage.getItem('signal-03.preferences.v1'));
  assert(prefs.muted && prefs.volume === 0.22, 'Only audio preferences persisted');
  assert(!localStorage.getItem('signal-03.credits'), 'Credits not persisted');
  document.querySelector('.dev-panel').open = false;
  return JSON.stringify({ checks, finalState: debug.state }, null, 2);
})()

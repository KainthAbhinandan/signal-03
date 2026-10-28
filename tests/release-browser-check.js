// Run against a fresh production preview after setting window.__expectedGameVersion
// from package.json in the browser harness. This file is not shipped in dist/.
(async () => {
  const checks = [];
  const assert = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  const expected = window.__expectedGameVersion;
  assert(typeof expected === 'string', 'Expected release comes from package metadata');
  const version = document.querySelector('.game-version');
  assert(version?.textContent === `v${expected}`, 'Visible version matches package.json');
  assert(version?.getAttribute('aria-label') === `Game version ${expected}`, 'Accessible version matches package.json');
  assert(!version.closest('[aria-hidden="true"]'), 'Version is exposed to assistive technology');
  const box = version.getBoundingClientRect();
  assert(box.width > 0 && box.height > 0 && box.right <= innerWidth, 'Version is rendered within the page');
  assert(document.documentElement.scrollWidth === innerWidth, 'No horizontal overflow');
  for (const selector of ['#mute', '#volume', '.about summary']) {
    const control = document.querySelector(selector).getBoundingClientRect();
    const overlaps = box.left < control.right && box.right > control.left && box.top < control.bottom && box.bottom > control.top;
    assert(!overlaps, `Version does not overlap ${selector}`);
  }
  const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((total, v, i) => total + v * [0.2126, 0.7152, 0.0722][i], 0);
  const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
  const foreground = luminance(rgb(getComputedStyle(version).color));
  const background = luminance(rgb(getComputedStyle(document.documentElement).backgroundColor));
  const contrast = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  assert(contrast >= 4.5, 'Version contrast meets normal-text AA');
  assert(!document.querySelector('.dev-panel') && !window.__signalDebug, 'Development controls absent from production');
  assert(document.querySelector('canvas')?.width > 0, 'Game initialized without player accounts or keys');
  const foreignResources = performance.getEntriesByType('resource').map(entry => new URL(entry.name))
    .filter(url => url.origin !== location.origin && url.protocol !== 'data:');
  assert(foreignResources.length === 0, 'Runtime resources come from the deployment origin');
  const spin = document.querySelector('#spin');
  spin.click();
  for (let i = 0; i < 25; i++) spin.click();
  for (let i = 0; i < 80 && document.querySelector('.machine').dataset.phase !== 'idle'; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert(!spin.disabled && document.querySelector('#live-result').textContent.startsWith('Spin 1.'), 'Production spin settles once after rapid input');
  document.querySelector('#reset').click();
  return { checks, version: version.textContent, accessibleLabel: version.getAttribute('aria-label'), contrast: Number(contrast.toFixed(2)), viewport: innerWidth };
})()

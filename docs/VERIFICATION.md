# Verification evidence

Verified **25 October 2026 (Asia/Kolkata)** on Windows, Node **24.14.0**, npm, installed Chrome, and agent-browser **0.39.2**. These are observed results, not a device-wide certification.

## Release preparation — 29 October 2026

- package.json is now the sole source for the release version. Vite's typed `__GAME_VERSION__` replacement supplies both visible footer text and its accessible label. The lockfile mirrors npm package metadata; it is not a separate manually maintained version setting.
- Final `npm run verify` passed again: strict type checking, all **85 tests**, and production build, without warnings. The JSON import in the Vite configuration includes its native import attribute.
- `tests/release-browser-check.js` passed **14 assertions at each of 1280×800, 390×844 and 320×740** against the built production site, using an expected version read from package.json. It verified the version, accessible name/exposure, contrast, no horizontal overflow, no overlap with any footer control, local runtime resources, absence of development controls, account/key-free startup and one completed spin after rapid input.
- Computed version-label contrast was **7.83:1** against the page background. Desktop/mobile axe-core audits each reported **0 violations, 0 incomplete checks**. The production browser console and page-error checks were empty.
- Desktop, mobile and narrow screenshots were refreshed from production with the footer label visible. The triple and recovery demonstration captures were refreshed from the development build with the same label.
- `.node-version` pins the locally verified Node release for Pages builds. Build command remains `npm run build`; output is explicitly `dist`. The hosting guide and changelog describe GitHub connection, Free-plan setup, public-URL verification, release numbering and player bug reports.
- No authenticated Cloudflare deployment access or project Git remote was found. **No public deployment was made or public URL verified**. Follow docs/DEPLOYMENT.md to publish and run its public smoke checklist. The sections below retain the broader original gameplay evidence; physical-device, human screen-reader/listening and sustained-performance limits remain unchanged.

## Automated source checks

Final `npm run verify` completed successfully:

- `npm run typecheck`: strict TypeScript checking, including tests and Vite configuration; no errors.
- `npm test`: **2 test files, 85 passing cases**.
- `npm run build`: Vite production output generated successfully; no build warnings. The final main application chunk was about 272 kB uncompressed / 81 kB gzip, with additional Pixi renderer chunks loaded as needed. This is a build-size observation, not a performance benchmark.
- Exact package versions and transitive dependencies are pinned in package.json/package-lock.json. Installation reported zero known vulnerabilities at that time; no enduring security guarantee is implied.

The test suite covers all 64 outcomes, all pair positions, triple-only awards, immutable sampling, the three-draw contract, invalid indices, one debit/award, busy input and reset rejection, insufficient credit, last-credit spending, loading, idle reset, failure recovery and destruction before/after settlement.

## Real browser interaction

`tests/browser-check.js` passed **20 assertions**, including the actual Pixi canvas, no error overlay, no horizontal overflow, 30 rapid clicks and 30 repeated Space events, disabled controls, position-derived final reel symbols matching the sample, result text, announcement, reset, all three development previews and their balances, pair-as-refund wording, mute and preference persistence.

Additional checks performed:

- **Native keyboard:** focused SPIN + a real Space keypress produced exactly one spin. The document shortcut and repeat handling are also exercised by the script and controller tests. Native controls retain standard Enter/Space behavior.
- **Resize during a spin:** changed from 390px portrait to 1280px desktop without restarting. The final Wave / Orbit / Wave matched the sample.
- **Actual background tab:** created another browser tab during an active spin. The original page reported `hidden: true` while spinning, then `hidden: false` about 26 seconds later while still spinning. It resumed and returned to idle with the same result. The AudioContext was suspended on return and resumed through a subsequent gesture.
- **Reduced motion:** Chrome media emulation enabled the OS preference; a complete spin/presentation returned to idle in approximately **446 ms**, with final symbols matching the sample. This is one local observation, not a cross-device timing guarantee.
- **Zero credits:** development fixture started at 0, SPIN disabled, reset enabled and explanatory text visible. Reset immediately restored 100.
- **Audio startup:** instrumented the native constructor; a trusted click created one context in `running` state.
- **Mute/volume:** toggled mute, moved volume to 22%, verified the persisted preference object and reloaded. Credits were never persisted.
- **Audio unavailable:** replaced AudioContext with a throwing constructor. The UI showed SOUND UNAVAILABLE; the spin still settled and returned to idle.
- **Teardown during a spin:** dispatched non-cached pagehide. Canvas and debug getter were removed, the tracked context changed from running to closed, and no late credit update appeared. Controller tests independently cover both pending phases.
- **Graphics initialization failure:** temporarily denied WebGL context creation and composed a fresh game. The helpful recovery text and Reload instrument button appeared; SPIN was disabled. The expected initialization error was logged. Reload restored the game.
- **Missing external asset:** not applicable; there are no external gameplay assets or fonts. The local favicon is decorative.

## Production and visual inspection

The actual built site was served with `npm run preview`, then played in Chrome:

- No development panel or `window.__signalDebug` existed. `?dev-credits=0` was ignored and the balance started at 100. A search of dist for the development controls, fixture and diagnostic strings returned no matches.
- Rapid production clicks completed one announced spin, with the expected payout and an enabled idle SPIN button. Reset worked.
- At **1280×800**, SPIN ended at about **733px**, fully inside the first screen. At **390×844**, it ended at about **621px**, also fully visible. No horizontal overflow at either size.
- Desktop and mobile automated axe-core **4.12.1** audits each reported **37 passing rules, 0 violations, 0 incomplete checks**. This does not replace a human screen-reader audit.
- Final production browser console and page-error checks were empty after clearing the earlier deliberately simulated failure.

Screenshots were opened and visually reviewed for hierarchy, spacing, center-band clarity and distinct symbols. The first desktop review exposed an overly tall cabinet; the layout was shortened, and an additional short-laptop layout brought SPIN above the fold. Touch hit areas for the sound controls were expanded. Final evidence:

- [Desktop production](desktop.png)
- [390px mobile production](mobile.png)
- [320px narrow layout](mobile-320.png)
- [Triple response](triple.png)
- [Initialization recovery](recovery.png)

## Limits and next verification

No physical phone, Safari/Firefox matrix, NVDA/VoiceOver session, subjective speaker/headphone listening or sustained CPU/GPU/frame-rate benchmark was performed. Mobile layouts were emulated in desktop Chrome. There is no claim of universal 60fps, production readiness or gambling certification. Next: test on a real mid-range phone and iPhone, check keyboard/announcements with assistive technology, listen to every cue and record a short performance profile.

# Asset inventory and ownership

All visual geometry and synthesized sound recipes are authored in this project. No third-party images, recordings, remote assets or downloaded fonts are used. Project-authored assets are covered by the repository MIT license; dependency licenses remain their owners'.

The project owner explicitly confirmed retaining MIT before public source publication. The implementation, procedural geometry, sound recipes, documentation and verification were produced with substantial AI assistance; this is not a claim of unaided authorship or prior commercial experience.

## Runtime dependency attribution

Every production build runs scripts/generate-notices.mjs. It reads package-lock.json and collects the installed production packages' license texts into public/THIRD_PARTY_NOTICES.txt, which Vite copies to dist/. Notices for tree-shaken and type-only dependencies are retained conservatively. The @pixi/colord npm package omits a license file, so licenses/colord-LICENSE.md preserves the grant from its declared [upstream repository](https://github.com/omgovich/colord/blob/master/LICENSE.md), checked 29 October 2026. The build fails if another production dependency lacks a notice instead of silently omitting it. Build/test tools are not distributed as runtime game files.

## Inventory
- Pulse: square pulse polyline; a discrete electronic impulse.
- Orbit: oval track, center ring and satellite; a repeating circuit.
- Spark: four pointed, concave outline; a concentrated signal.
- Wave: two sine curves; an analog oscillation.
- Cabinet: original PixiJS rectangles, fine rules and dot markers, accompanied by CSS casing.
- Symbol legend and favicon: original inline/local SVG geometry, matching the same four designs.
- Text: OS-supplied sans-serif and monospace with generic fallbacks; no bundled font license needed.
- Audio: native Web Audio oscillator/noise recipes; no recordings.

## Construction and lifetime
SymbolFactory draws each symbol once with PixiJS Graphics, generates a transparent texture at capped device resolution, then destroys the temporary geometry. Reel sprites share these four textures. The view destroys sprites without destroying shared textures, then destroys its four owned textures and the application. No external asset requires PixiJS Assets; use Assets.load/unload if a future theme introduces image files.

AudioController owns its AudioContext, master gain, compressor, filtered-noise buffer and active voice nodes. Each envelope disconnects on ended; hiding cancels all voices and suspends the context; destruction also closes it.

## Sound recipes
Click: 150 Hz triangle, 35 ms. Roll: quiet filtered noise bursts, rate bounded by the visual clock. Stops: short sine/triangle taps at 220, 277 and 330 Hz. Pair: 330/440 Hz. Triple: 262/330/392/523 Hz chord. Exact envelopes live beside the synthesis implementation.

## Replacing a theme
Change src/config/theme.ts, CSS color tokens and SymbolFactory geometry together. Change sound recipes in audio only. Keep symbol IDs and domain payout rules unchanged for a visual replacement. A new symbol also requires an explicit domain/probability and test update.

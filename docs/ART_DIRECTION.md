# Art direction

## Object
SIGNAL / 03 is a tabletop electronic instrument. A spacious charcoal page frames a slightly lighter, finely outlined cabinet. A red status light, technical coordinates and tiny dot grids suggest measured signals. No borrowed branding or product layouts.

## Palette and type
Page #111313, cabinet #1a1d1c, reel well #121514, warm foreground #eeeae0, secondary #a2aaa4, signal red #ff5748, fine rule #343b37. System sans-serif for large, tightly tracked titles and readable body copy; local system monospace for numbers and small technical labels. No font downloads or license dependency.

## Symbols
Optically similar 96-unit white line drawings: Pulse is an angular square pulse; Orbit is an ellipse crossed by a satellite; Spark is a four-point concave star; Wave is two smooth sinusoidal paths. Stroke weight is shared. Shape alone identifies every symbol. Red is reserved for the payline, controls and a triple lock.

## Layout
Wide screen: product heading above one centered cabinet; reel headers, recessed three-reel window, result strip, then credits and a large red spin key. A quiet symbol/payout legend and audio controls finish the object. Mobile: retain three reels, compress cabinet padding, stack credit and action regions only when necessary. Adjacent symbols remain dim; a bracketed central band is the only payline.

## Motion
Quick physical button depression; continuously wrapped reels accelerate and ease out into sequential short settlements. A pair produces a small pulse and explicitly says stake returned. A triple receives a brief line/symbol pulse and at most 24 dots. No full-screen flashes. Reduced motion replaces travel with short fades and removes particles/overshoot. Timing and intensity live in src/config/motion.ts.

## Sound
Soft sine/triangle tones and filtered noise: a short click, quiet reel ticks, three ascending stop taps, two notes for a pair and a consonant chord for a triple. A restrained master gain, short envelopes and a compressor prevent harsh peaks. Sounds begin only from gestures; hidden pages cancel scheduled nodes and suspend the context. No music.

# Architecture

## One transaction, four boundaries

`main.ts` mounts the application and registers hot-reload disposal. `createGame.ts` composes concrete dependencies explicitly: cryptographic randomness, a `GameView`, an `AudioController` and HTML `Controls`. There is no service container or global event bus.

The domain has no PixiJS, DOM or sound dependency. `symbols.ts` defines four IDs and a fixed three-symbol tuple. `sampleSymbols()` asks its injected `RandomIndex` for exactly three indices in `[0,4)`. `createOutcome()` copies/freezes the tuple and evaluates it. `evaluateWin()` checks triples first, then any pair, and returns one award.

`GameController` owns the authoritative credit balance, spin count, latest outcome and phase. `Presentation` is the small asynchronous boundary used by both the real view and deferred test doubles. UI state changes use a direct callback, and completed results use a separate callback for text and audio.

```mermaid
sequenceDiagram
  participant H as HTML controls
  participant C as GameController
  participant D as Pure domain + RandomIndex
  participant V as GameView / Pixi ticker
  H->>C: spin()
  C->>C: Guard idle and credits
  C->>D: Sample three independent IDs; freeze and evaluate
  D-->>C: Immutable outcome
  C->>H: spinning; debit 1; disable controls
  C->>V: spin(outcome, AbortSignal)
  V-->>C: All reels settled
  C->>C: Add the single award
  C->>H: presentingResult; announce once; sound cue
  C->>V: present(outcome, AbortSignal)
  V-->>C: Soft result effect complete
  C->>H: idle; enable allowed controls
```

Sampling and the debit happen synchronously inside acceptance; sampling is attempted before publishing the debit so a broken random source never charges a credit. The valid transaction publishes one debit, then animates, then publishes one award. No reel position or elapsed time can decide a payout.

## Why sample first?

A reel animation is a presentation of a decision. Sampling first makes it possible to test the decision without a GPU, pause or resize without changing it, and inspect final symbols against a known target. The strip wraps a fixed cycle of symbol textures and travels a whole number of cycles plus the distance to that target. Adjacent symbols come from that fixed strip; there is no outcome-dependent near-miss selection.

`cryptoRandomIndex` uses Web Crypto with rejection sampling for an unbiased integer. Four symbols divide the 32-bit space exactly, so rejection is normally unnecessary here. Tests inject exact indices instead of patching global randomness. Exhaustive evaluation covers the whole finite outcome space: 24 misses, 36 exact pairs and 4 triples. Deterministic tests demonstrate behavior, not a statistical certification of browser entropy.

## Duplicate work and cancellation

The first accepted call changes state to `spinning` before returning a promise. Further click/touch/keyboard calls see a busy state and return false before drawing or charging. Disabled HTML buttons support that guard, but correctness lives in the controller. `presentingResult` remains busy. Only the single continuation after reel completion adds the award.

The state union explicitly covers loading, idle, spinning, presentingResult and error. Loading rejects play. Error allows controller recovery through reset; a failed graphics initialization instead exposes a reload button because a reset cannot recreate a renderer.

Each controller lifetime owns an AbortController. Destroy marks the controller disposed before aborting pending work. Continuations check the signal before changing state or paying. The view removes its abort listener when each ticker job completes or cancels. Reset is accepted only when idle or recovering from an error, and starts a new lifetime. A cancellation after an award preserves that one award and prevents a late transition.

## Rendering and one clock

`SymbolFactory` draws four Graphics shapes once, generates four textures and destroys its temporary geometry. Each `ReelView` reuses five sprites and a rectangular mask. Logical positions in `layout.ts` are independent of browser pixels. ResizeObserver changes renderer dimensions and world scale, leaving spin state and logical travel unchanged. Device resolution is capped at 2.

`GameView` owns a private Pixi application/ticker. One time-based job animates all three reels with a smooth acceleration/deceleration curve and sequential endpoints at 1340, 1520 and 1700 ms. The final 10% provides a 6px settlement. Result presentation lasts 540 ms. The same ticker interpolates displayed credits through `Controls.tick()`. The authoritative balance never comes from those intermediate numbers.

`EffectsLayer` allocates its outline and 24 dots once. A pair gives a small outline/symbol pulse; a triple adds a red pulse and short dot burst. Reduced motion uses brief fades, 140/195/250 ms reel endpoints and a 180 ms result period, without overshoot, symbol scaling or particles. A changed OS preference affects subsequent animations. Press feedback is a small CSS transform, with transitions removed for reduced motion.

## Why HTML controls?

Native buttons, a labeled range input, visible focus, details disclosure and readable result text are more dependable for keyboard and assistive technology than rebuilding controls inside a canvas. The canvas is hidden from the accessibility tree. A separate text summary names the settled symbols; a single polite live region announces each result with a unique spin sequence. Animation frames are never announced. Native button keyboard activation is preserved; the document Space shortcut ignores interactive targets and held key repeats.

## Audio and preferences

`AudioController` creates/resumes its context from a gesture, then plays typed click/tick/stop/pair/triple cues. A gain node and compressor feed the destination. Envelopes are short and voices disconnect on ended. A small noise buffer is created once. Noise uses `Math.random()` solely to synthesize timbre; outcomes exclusively use the injected cryptographic source.

The UI does not await audio before spinning. Unavailable sound changes the visible label and leaves the game usable. Only validated mute/volume preferences are saved. Storage failure is harmless.

## Ownership and lifecycle

- `createGame`: listeners, media query subscription, visibility policy and the overall idempotent disposal function.
- `GameController`: authoritative state and cancellation signal; no renderer resources.
- `GameView`: application, ticker job, ResizeObserver, world, sprites, masks, effects and four generated textures. Child destruction preserves shared textures; the owner then destroys those four textures explicitly. Pixi's built-in white texture is never destroyed by this code.
- `AudioController`: context, audio graph, noise buffer and active voice set. Stops/disconnects all voices and closes the context on disposal.
- `Controls`: input listeners and non-authoritative displayed values.
- Development module: optional result panel and read-only diagnostics. Its import branch is removed from production.

Hidden pages stop the Pixi ticker and stop/suspend audio. A visible page restarts the ticker with a fresh timestamp, preserving progress without a background-sized delta. Audio resumes on the next gesture. A non-cached pagehide destroys the application; a page retained in the browser's back-forward cache relies on visibility events and remains resumable.

There are no external gameplay assets to load. If a future theme includes images, use PixiJS Assets with explicit load/unload ownership. No artificial asset manager is needed for today's procedural shapes.

## Extension points and deliberate limits

Release metadata lives in package.json. `vite.config.ts` reads its version and defines `__GAME_VERSION__` for build-time replacement; `src/vite-env.d.ts` declares the constant's type, and the HTML shell uses it for the visible footer and accessible label. Neither the client nor the deployment needs an API request or environment secret to obtain a version. `.node-version` selects the verified build runtime. Pages serves only `dist/`; deployment setup is documented in DEPLOYMENT.md.

A visual theme changes `config/theme.ts`, CSS tokens, symbol geometry and optionally sound recipes. Payout logic remains unchanged. A fifth symbol requires changing `SYMBOLS`, its name, geometry, initial strip assumptions where relevant, and exhaustive tests. Domain randomness already takes its range from the symbol list; current center payline and three-reel assumptions remain deliberate.

A server-authoritative version would replace the local sampling boundary with an authenticated asynchronous outcome provider and balance transaction. It would need a request phase, idempotency, reconciliation and server error handling. Injecting fake reel positions would be the wrong boundary. This project implements none of that network machinery.

The prototype intentionally omits real money, wagering options, certification, account storage, backend persistence, multiplayer, autoplay, jackpots, extra paylines and general engine abstractions. It also does not claim a universal 60fps guarantee or complete screen-reader/hardware coverage.

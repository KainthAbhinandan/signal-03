# Interview walkthrough

## A 60-second introduction

Use this as a rehearsal script, not a claim of unaided work. Say explicitly: “I directed this portfolio project and used substantial AI assistance for code, procedural graphics/sound code, documentation and checks. I’m responsible for reviewing it and explaining the decisions.” Do not invent professional experience, player numbers or ownership of third-party code. Replace any claim you cannot demonstrate with what you are currently learning.

“SIGNAL / 03 is a small electronic instrument disguised as a slot game. I wanted one satisfying interaction that someone could understand immediately: press the red key, watch three frequencies settle, and see whether they align.

“Each reel independently selects one of four original symbols. A spin costs one demo credit. A pair returns that credit; a triple awards five. The strongest sound and visual response belong to the triple, so the interface does not celebrate a refund as a profit.

“I used PixiJS for cached symbol textures, masked reels and restrained effects, with HTML for accessible controls. A pure TypeScript domain and a guarded controller decide the result before the renderer moves. That separation is the main architectural choice: motion can pause, resize or be reduced without changing the outcome.

“The project has exhaustive tests of all 64 outcomes, transaction and cancellation tests, and browser checks at desktop and narrow mobile sizes. It is a deliberately small portfolio prototype, with no real-money or server infrastructure.”

## Five-minute code tour

1. **0:00–0:35 — `src/app/createGame.ts`, `src/ui/controls.ts`.** Begin at the actual composition root and click/Space handlers. Explain why audio startup does not block a spin and why native button activation is not duplicated.
2. **0:35–1:15 — `src/app/GameController.ts`, `gameState.ts`.** Enter spin(). Point to the idle/credit guard; a busy call returns before sampling. Explain synchronous acceptance, sampling and the one-credit debit before awaiting the renderer.
3. **1:15–2:00 — `src/domain/outcome.ts`, `evaluateWin.ts`, `symbols.ts`, `rules.ts`, `src/shared/random.ts`.** Trace three independent draws, the copied/frozen tuple and triple-first evaluation. Use Orbit/Wave/Orbit for a separated pair. The renderer cannot rewrite the award.
4. **2:00–3:00 — `src/rendering/GameView.ts`, `ReelView.ts`, `SymbolFactory.ts`.** Follow the supplied outcome through one ticker job. Explain wrapped strips, sequential stops, actual final center positions and textures generated once. Resize changes scale, not the result.
5. **3:00–4:00 — back to `GameController.ts`, then `src/ui/controls.ts` and `src/audio/AudioController.ts`.** Show the single award after reel completion, presentingResult, the one announcement, sound/effect response, awaited presentation and return to idle. From 100, a pair ends at 100, a triple at 104 and a miss at 99.
6. **4:00–5:00 — `tests/domain.test.ts`, `tests/controller.test.ts`, `createGame.ts`.** Show all 64 outcomes, one rapid-input test and one cancellation test. Finish with visibility/disposal ownership, release metadata/notices, dated verification and one honest limitation. Do not present forced development previews as random results.

## Rehearse before outreach

Without reading a script, explain a separated pair’s balance, find the guard rejecting the second press, identify reduced-motion behavior, and name the owner of each texture/audio context. Run a controller test and explain its deferred promise. If an answer is uncertain, revisit that file before claiming confidence. Take one small change through review and verification yourself; do not claim a test or improvement you did not perform.

## Five likely questions

**Why not calculate the result from where the reels stop?**

That would couple correctness to frame timing and make pause/resize/reduced motion harder to reason about. Here the immutable result exists first; positions only reveal it. The browser checks compare the final center IDs calculated from reel positions to that sample.

**What prevents two rapid clicks from spending twice?**

The controller changes to `spinning` synchronously on the first accepted call. Every entry path goes through the same idle/credit guard. Buttons are also disabled, and held keyboard repeats are suppressed, but those UI measures are not the accounting boundary.

**What happens if the tab is hidden or the app is destroyed?**

Hiding pauses the visual ticker, cancels active sound and suspends the context. Returning resumes from a fresh timestamp, with the same target. Destruction marks the controller disposed, aborts the current job, removes listeners/observer/ticker, releases owned textures and closes audio. Tests cover cancellation before and after an award. Browser testing confirmed a real tab switch paused an active spin.

**How do you test randomness without making flaky tests?**

Inject exact indices and test the sampling contract. Separately enumerate all 64 symbol tuples and evaluate each against its number of distinct symbols. Normal gameplay continues to use three independent cryptographic draws; previews are in a development-only module. These tests do not certify the browser entropy source.

**How would you make the game server-authoritative?**

Replace the local outcome sampling/balance transaction with an authenticated asynchronous provider. Add a requesting phase and server-side idempotency and reconciliation. Keep the renderer's supplied-outcome contract. There is no backend in this prototype, so I would not describe it as ready for real-money deployment.

## Three tradeoffs

1. **HTML plus canvas.** More than one presentation technology, but native controls, focus and announcements are easier to implement correctly. Pixi remains responsible for the machine/reels/effects.
2. **Procedural assets and synthesized audio.** A coherent original identity with no external asset failures or downloads. Shapes and sound recipes are modest; richer art direction would require more asset production and testing.
3. **A small promise-based controller.** Explicit dependencies and cancellation are easy to follow. There is no general timeline engine or state-machine dependency, so any future asynchronous provider would need a deliberate state extension.

## One honest limitation and the next improvement

Verification used desktop Chrome with emulated mobile widths. There is no physical iPhone/Android, Safari, NVDA/VoiceOver or subjective speaker/headphone listening evidence, and no sustained performance benchmark. Next, run a short device and assistive-technology matrix, listen to every sound cue on headphones and small speakers, and profile a real mid-range phone before promising performance targets.

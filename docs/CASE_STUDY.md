# SIGNAL / 03 — a deliberately small browser instrument

## Project snapshot

SIGNAL / 03 is a portfolio prototype: a three-reel slot-like electronic instrument using demo credits. The public demo, repository and recording status are tracked in [RELEASE_STATUS.md](RELEASE_STATUS.md). The displayed version is compiled from package.json. It has no backend, account, real-money stake, prize, purchase, withdrawal or analytics.

The objective was to make one action understandable and satisfying within seconds, while making the code easy to defend in a technical conversation. It is a client interaction/architecture sample, not evidence of gambling certification or commercial operations.

## What was implemented

The brief specified a sparse charcoal/off-white/red object, four original geometric symbols, one center payline, a one-credit cost, a one-credit exact-pair award and a five-credit triple award. The implementation uses strict TypeScript, Vite, PixiJS, native Web Audio and semantic HTML controls. It avoids React, a backend and a general game-engine abstraction.

This project was built with substantial AI assistance, including implementation, procedural asset and audio code, documentation and verification scripting. The project owner supplied direction, made release/licensing decisions and is responsible for reviewing and understanding what is presented. Do not describe it as unaided authorship or invent previous professional experience. The accompanying walkthrough is a learning and explanation aid, not proof the owner has already mastered every module.

## Trace one spin

The HTML button and Space shortcut enter GameController.spin(). It first rejects non-idle or zero-credit input. The pure domain draws three independent indices, freezes a copied result and evaluates its one award. The controller publishes the one-credit debit and a busy state synchronously, so overlapping input cannot start a second transaction.

GameView receives the outcome; its private Pixi ticker moves three masked, wrapped strips toward it. The renderer does not select a payout. When the reels finish, the controller adds the award once, announces the settled symbols and presents the short result effect before returning to idle. Cancellation checks prevent late state updates after disposal.

Authoritative credits stay in the controller. Their visual interpolation is presentation only. Resize scales logical coordinates rather than resampling; hiding pauses the ticker and suspends audio. Those boundaries make the same result compatible with a slower frame, a different viewport and reduced motion.

## Audiovisual decisions

Pulse, Orbit, Spark and Wave are original Pixi Graphics geometry, baked once into four shared textures. They differ by shape, not just color. Adjacent symbols are dimmed, while brackets and a center band make the payable line clearer. Fine rules and dot accents support the electronic-object direction without borrowing product branding.

Each press has a quick physical response. Reels accelerate smoothly and stop in sequence with restrained settlement. A pair receives a small response and says the stake was returned; a triple receives the strongest brief line/symbol pulse and a bounded dot pool. There is no full-screen flash or long shake.

Audio uses short sine/triangle envelopes and filtered noise through a restrained gain/compressor graph. Gesture-created audio may fail silently without blocking play. HTML controls provide focus, mute/volume and a single polite result announcement; the animated canvas is excluded from the accessibility tree.

## Verification and release work

Fresh source verification in this release-preparation session passed strict checking, 85 domain/controller cases and a production build. The domain suite covers every one of the 64 possible outcomes, and deferred presentation tests cover busy input and disposal races. Earlier browser evidence remains labeled by date in [VERIFICATION.md](VERIFICATION.md); new public checks must be recorded only after the deployed URL works.

The production version is injected from package.json. Secret/temporary outputs are excluded from Git. A prebuild step conservatively bundles the locked production dependencies' license notices with the game, including an upstream notice absent from a published dependency package. The owner explicitly chose to retain MIT for project-authored material.

## Tradeoffs

- HTML and canvas share presentation responsibility. This costs some layout coordination, but avoids rebuilding native controls and accessibility inside Pixi.
- Procedural symbols and sound keep the package original and self-contained. They are intentionally modest rather than a large art-production pipeline.
- A small promise-based controller is easy to trace and test. A future server-authoritative product would need an asynchronous transaction/provider boundary, idempotency and reconciliation; none is claimed here.

## Honest limits and next evidence

No player study, retention result, publisher interest, revenue or sustained frame-rate measurement exists yet. Browser viewport emulation is not a physical-phone check. Other engines, screen readers and subjective headphone/speaker quality need testing. Publisher SDKs, ads, production accounts and real-money infrastructure are intentionally absent.

The next step is 5–10 short playtests, grouping repeated observable problems before choosing a few small fixes. New gameplay features should follow evidence, not be added to make the portfolio look larger. Use [PLAYTEST.md](PLAYTEST.md), the [demo script](DEMO_SCRIPT.md) and the [interview walkthrough](INTERVIEW_WALKTHROUGH.md) together.

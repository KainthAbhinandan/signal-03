# SIGNAL / 03 — implementation plan

## Scope
A local, portfolio-sized electronic slot instrument: three independent, equiprobable four-symbol reels, one center payline, 100 demo credits. A spin costs 1; exactly two matches award 1; three award 5. No backend or real money.

## Milestones
1. Establish original art direction, document assets, verify official APIs and compatible dependency versions; pin packages and lockfile.
2. Implement a pure domain and a tested controller; connect a minimal PixiJS view and semantic HTML controls.
3. Refine continuous masked reel movement, sequential stops, responsive sizing, keyboard handling and reduced motion.
4. Add native synthesized audio, bounded effects, preference persistence and visibility/teardown ownership.
5. Run strict type checking, exhaustive outcome tests, controller tests and production build. Inspect real desktop/mobile rendering and exercise lifecycle/input edges.
6. Write architecture and interview walkthrough against the actual code; record evidence and limitations.

## Tools and decisions
TypeScript strict, Vite, PixiJS 8, Vitest, native Web Audio, HTML/CSS. No React, animation library, external imagery or custom font. Agent-browser for actual interaction and screenshots (fallback only if unavailable). Procedural symbols need no asset loader.

## Acceptance criteria
- The initial screen is playable without onboarding; the center line and payouts are obvious.
- A result is sampled once before motion; accepted spins deduct and award exactly once. Busy inputs and reset are rejected.
- Normal reel motion settles within 1.5–2 seconds; reduced motion is shorter and simpler.
- One Pixi ticker drives all game visuals, including credit interpolation. Resize preserves spin progress and outcomes.
- Four distinct, original cached symbols; restrained red/off-white/charcoal cabinet and consistent sound.
- Accessible controls, keyboard focus, one result announcement, text symbols, mute/volume, safe silent fallback.
- Hidden pages pause visuals and suspend/cancel sound; disposal cancels work and releases resources.
- All 64 outcomes plus controller races, cancellation, reset and zero credit are tested.
- Development previews are visibly labeled and excluded from production.
- Required documents, exact local commands and honest browser evidence are delivered.

## Official references
- https://pixijs.com/8.x/guides/components/application — async initialization, private ticker, renderer options.
- https://pixijs.com/8.x/guides/components/ticker — time-based updates and ticker lifecycle.
- https://pixijs.com/8.x/guides/components/scene-objects/graphics — retained Graphics geometry.
- https://vite.dev/guide/ — tooling/runtime compatibility.
- https://vitest.dev/guide/ — test runner/runtime compatibility.

Exact installed versions and completed checks will be recorded in memory.md and docs/VERIFICATION.md.

## Completion
All six milestones completed. Exact dependencies, browser evidence, screenshots and honest remaining limits are recorded in README.md, memory.md and docs/VERIFICATION.md.

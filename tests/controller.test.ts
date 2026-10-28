import { describe, expect, it, vi } from 'vitest';
import { GameController, type Presentation } from '../src/app/GameController';
import type { GameState } from '../src/app/gameState';

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}

function setup(indices = [0, 1, 2], startingCredits = 100) {
  const reel = deferred();
  const result = deferred();
  const view: Presentation = { spin: vi.fn(() => reel.promise), present: vi.fn(() => result.promise), reset: vi.fn() };
  let index = 0;
  const random = vi.fn(() => indices[index++ % indices.length]!);
  const changed = vi.fn<(state: GameState) => void>();
  const announced = vi.fn();
  const game = new GameController(random, view, changed, announced, startingCredits);
  game.ready();
  return { game, reel, result, view, random, changed, announced };
}

describe('spin transaction', () => {
  it('requires ready, deducts once and rejects rapid inputs without resampling', async () => {
    const s = setup();
    const pending = s.game.spin();
    expect(s.game.state).toMatchObject({ phase: 'spinning', credits: 99, spins: 1 });
    expect(await Promise.all(Array.from({ length: 20 }, () => s.game.spin()))).toEqual(Array(20).fill(false));
    expect(s.random).toHaveBeenCalledTimes(3);
    expect(s.view.spin).toHaveBeenCalledTimes(1);
    expect(s.game.reset()).toBe(false);
    s.reel.resolve();
    await Promise.resolve();
    expect(s.game.state.phase).toBe('presentingResult');
    expect(await s.game.spin()).toBe(false);
    expect(s.game.reset()).toBe(false);
    s.result.resolve();
    expect(await pending).toBe(true);
    expect(s.game.state).toMatchObject({ phase: 'idle', credits: 99 });
    expect(s.announced).toHaveBeenCalledTimes(1);
  });

  it.each([
    { indices: [1, 2, 1], balance: 100, kind: 'pair' },
    { indices: [2, 2, 2], balance: 104, kind: 'triple' },
    { indices: [0, 1, 2], balance: 99, kind: 'none' },
  ])('applies $kind award exactly once after settlement', async ({ indices, balance, kind }) => {
    const s = setup(indices);
    const pending = s.game.spin();
    expect(s.game.state.credits).toBe(99);
    const outcome = vi.mocked(s.view.spin).mock.calls[0]![0];
    expect(outcome.kind).toBe(kind);
    s.reel.resolve(); await Promise.resolve();
    expect(s.game.state.credits).toBe(balance);
    expect(s.view.present).toHaveBeenCalledWith(outcome, expect.any(AbortSignal));
    s.reel.resolve(); s.result.resolve(); await pending;
    expect(s.game.state.credits).toBe(balance);
    expect(s.announced).toHaveBeenCalledTimes(1);
    expect(s.game.state.lastOutcome).toBe(outcome);
  });

  it('rejects insufficient credits and makes reset available immediately', async () => {
    const s = setup([0, 1, 2], 0);
    expect(await s.game.spin()).toBe(false);
    expect(s.random).not.toHaveBeenCalled();
    expect(s.game.reset()).toBe(true);
    expect(s.game.state).toEqual({ phase: 'idle', credits: 100, spins: 0, lastOutcome: null });
    expect(s.view.reset).toHaveBeenCalledTimes(1);
  });

  it('the final credit can be spent once and then reset', async () => {
    const s = setup([0, 1, 2], 1);
    const pending = s.game.spin();
    expect(s.game.state.credits).toBe(0);
    s.reel.resolve(); s.result.resolve(); await pending;
    expect(await s.game.spin()).toBe(false);
    expect(s.game.reset()).toBe(true);
  });

  it('does not accept input in loading', async () => {
    const view = { spin: vi.fn(), present: vi.fn(), reset: vi.fn() };
    const game = new GameController(() => 0, view, vi.fn(), vi.fn());
    expect(await game.spin()).toBe(false);
    expect(game.reset()).toBe(false);
    expect(view.spin).not.toHaveBeenCalled();
  });
});

describe('lifecycle and recovery', () => {
  it('teardown during reels aborts the supplied signal and prevents late award or updates', async () => {
    const s = setup([0, 0, 0]);
    const pending = s.game.spin();
    const signal = vi.mocked(s.view.spin).mock.calls[0]![1];
    s.game.destroy();
    const count = s.changed.mock.calls.length;
    expect(signal.aborted).toBe(true);
    s.reel.resolve(); s.result.resolve();
    expect(await pending).toBe(false);
    expect(s.game.state.credits).toBe(99);
    expect(s.changed).toHaveBeenCalledTimes(count);
    expect(s.announced).not.toHaveBeenCalled();
    expect(s.view.present).not.toHaveBeenCalled();
  });

  it('teardown during presentation keeps its one award and prevents a late idle transition', async () => {
    const s = setup([0, 0, 0]);
    const pending = s.game.spin();
    s.reel.resolve(); await Promise.resolve();
    expect(s.game.state.credits).toBe(104);
    s.game.destroy();
    const count = s.changed.mock.calls.length;
    s.result.resolve(); await pending;
    expect(s.changed).toHaveBeenCalledTimes(count);
    expect(s.announced).toHaveBeenCalledTimes(1);
    expect(await s.game.spin()).toBe(false);
    expect(s.game.reset()).toBe(false);
  });

  it('recovers from a failed presentation without applying the award twice', async () => {
    const s = setup([0, 0, 0]);
    const pending = s.game.spin();
    s.reel.resolve(); await Promise.resolve();
    s.result.reject(new Error('renderer lost'));
    expect(await pending).toBe(false);
    expect(s.game.state).toMatchObject({ phase: 'error', credits: 104 });
    expect(s.game.reset()).toBe(true);
    expect(s.game.state.credits).toBe(100);
  });

  it('does not charge credits if the random source fails', async () => {
    const s = setup([4]);
    expect(await s.game.spin()).toBe(false);
    expect(s.game.state).toMatchObject({ phase: 'error', credits: 100 });
  });
});

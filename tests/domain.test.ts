import { describe, expect, it, vi } from 'vitest';
import { SYMBOLS, type Symbols } from '../src/domain/symbols';
import { evaluateWin } from '../src/domain/evaluateWin';
import { createOutcome, sampleSymbols } from '../src/domain/outcome';

describe('the complete outcome space', () => {
  const counts = { none: 0, pair: 0, triple: 0 };
  for (const a of SYMBOLS) for (const b of SYMBOLS) for (const c of SYMBOLS) {
    const symbols = [a, b, c] as const;
    const distinct = new Set(symbols).size;
    const expected = distinct === 1 ? { kind: 'triple', award: 5 } : distinct === 2 ? { kind: 'pair', award: 1 } : { kind: 'none', award: 0 };
    counts[expected.kind as keyof typeof counts]++;
    it(`${a} / ${b} / ${c}`, () => expect(evaluateWin(symbols)).toEqual(expected));
  }
  it('covers 64 outcomes: 24 misses, 36 pairs, 4 triples', () => {
    expect(counts).toEqual({ none: 24, pair: 36, triple: 4 });
  });
});

it.each<Symbols>([
  ['pulse', 'pulse', 'wave'], ['pulse', 'wave', 'pulse'], ['wave', 'pulse', 'pulse'],
])('recognizes a pair in every position: %s %s %s', (...symbols) => {
  expect(evaluateWin(symbols as unknown as Symbols)).toEqual({ kind: 'pair', award: 1 });
});

it('draws exactly three independent indices with the same range', () => {
  const random = vi.fn().mockReturnValueOnce(2).mockReturnValueOnce(0).mockReturnValueOnce(2);
  const symbols = sampleSymbols(random);
  expect(symbols).toEqual(['spark', 'pulse', 'spark']);
  expect(random.mock.calls).toEqual([[4], [4], [4]]);
  expect(Object.isFrozen(symbols)).toBe(true);
});

it.each([-1, 4, 0.5, NaN])('rejects an invalid random index %s', index => {
  expect(() => sampleSymbols(() => index)).toThrow(RangeError);
});

it('copies and freezes the sampled outcome so animation cannot rewrite it', () => {
  const supplied: ['pulse', 'orbit', 'wave'] = ['pulse', 'orbit', 'wave'];
  const outcome = createOutcome(supplied);
  supplied[0] = 'pulse';
  expect(outcome.symbols).not.toBe(supplied);
  expect(Object.isFrozen(outcome)).toBe(true);
  expect(Object.isFrozen(outcome.symbols)).toBe(true);
  expect(outcome.award).toBe(0);
});

import { SYMBOLS, type Symbols } from './symbols';
import { evaluateWin } from './evaluateWin';

/** Return an integer in [0, exclusiveMax). A useful boundary for deterministic tests. */
export type RandomIndex = (exclusiveMax: number) => number;

export function sampleSymbols(random: RandomIndex): Symbols {
  const pick = () => {
    const index = random(SYMBOLS.length);
    if (!Number.isInteger(index) || index < 0 || index >= SYMBOLS.length) {
      throw new RangeError('Random source returned an invalid symbol index.');
    }
    return SYMBOLS[index]!;
  };
  return Object.freeze([pick(), pick(), pick()] as const);
}

export function createOutcome(symbols: Symbols) {
  const immutableSymbols = Object.freeze([...symbols] as [Symbols[0], Symbols[1], Symbols[2]]);
  return Object.freeze({ symbols: immutableSymbols, ...evaluateWin(immutableSymbols) });
}
export type Outcome = ReturnType<typeof createOutcome>;

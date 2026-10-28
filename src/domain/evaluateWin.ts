import type { Symbols } from './symbols';
import { RULES } from './rules';

export type Win = Readonly<{ kind: 'none' | 'pair' | 'triple'; award: number }>;

export function evaluateWin([a, b, c]: Symbols): Win {
  if (a === b && b === c) return { kind: 'triple', award: RULES.tripleAward };
  if (a === b || a === c || b === c) return { kind: 'pair', award: RULES.pairAward };
  return { kind: 'none', award: 0 };
}

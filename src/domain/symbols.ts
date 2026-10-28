export const SYMBOLS = ['pulse', 'orbit', 'spark', 'wave'] as const;
export type SymbolId = (typeof SYMBOLS)[number];
export type Symbols = readonly [SymbolId, SymbolId, SymbolId];
export const SYMBOL_NAMES: Record<SymbolId, string> = {
  pulse: 'Pulse', orbit: 'Orbit', spark: 'Spark', wave: 'Wave',
};

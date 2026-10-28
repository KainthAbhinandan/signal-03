import type { RandomIndex } from '../domain/outcome';

// Rejection sampling avoids modulo bias if the number of symbols changes.
export const cryptoRandomIndex: RandomIndex = (exclusiveMax) => {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / exclusiveMax) * exclusiveMax;
  do { crypto.getRandomValues(buffer); } while (buffer[0]! >= limit);
  return buffer[0]! % exclusiveMax;
};

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;

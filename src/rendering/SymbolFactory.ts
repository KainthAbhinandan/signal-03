import { Graphics, Rectangle, type Renderer, type Texture } from 'pixi.js';
import { SYMBOLS, type SymbolId } from '../domain/symbols';
import { theme } from '../config/theme';

/** One geometry definition per symbol; the renderer bakes four shared textures once. */
export function createSymbolTextures(renderer: Renderer): Record<SymbolId, Texture> {
  const textures = {} as Record<SymbolId, Texture>;
  for (const id of SYMBOLS) {
    const g = new Graphics();
    if (id === 'pulse') {
      g.moveTo(12, 53).lineTo(30, 53).lineTo(30, 26).lineTo(48, 26)
        .lineTo(48, 72).lineTo(66, 72).lineTo(66, 43).lineTo(84, 43);
    } else if (id === 'orbit') {
      g.ellipse(48, 48, 35, 20).stroke({ width: theme.symbolStroke, color: theme.foreground });
      g.circle(48, 48, 12);
      g.stroke({ width: theme.symbolStroke, color: theme.foreground });
      g.circle(75, 35, 6).fill(theme.foreground);
    } else if (id === 'spark') {
      g.moveTo(48, 10).lineTo(58, 37).lineTo(85, 48).lineTo(58, 59)
        .lineTo(48, 86).lineTo(38, 59).lineTo(11, 48).lineTo(38, 37).closePath();
    } else {
      for (const y of [37, 59]) {
        g.moveTo(10, y).bezierCurveTo(23, y - 27, 33, y - 27, 48, y)
          .bezierCurveTo(63, y + 27, 73, y + 27, 86, y);
      }
    }
    if (id !== 'orbit') g.stroke({ width: theme.symbolStroke, color: theme.foreground, cap: 'round', join: 'round' });
    textures[id] = renderer.generateTexture({ target: g, frame: new Rectangle(0, 0, 96, 96), resolution: Math.min(devicePixelRatio || 1, theme.resolutionCap) });
    g.destroy();
  }
  return textures;
}

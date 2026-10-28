import { Container, Graphics } from 'pixi.js';
import { motion } from '../config/motion';
import { theme } from '../config/theme';
import { layout } from './layout';

/** Fixed pool. All geometry is created once, never in the animation loop. */
export class EffectsLayer {
  readonly container = new Container();
  private readonly line = new Graphics();
  private readonly dots: Graphics[] = [];

  constructor() {
    this.line.roundRect(10, layout.paylineY, layout.width - 20, layout.paylineHeight, 7).stroke({ color: theme.red, width: 1.3 });
    this.line.alpha = 0;
    this.container.addChild(this.line);
    for (let i = 0; i < motion.particleCount; i++) {
      const dot = new Graphics().circle(0, 0, i % 4 === 0 ? 2 : 1.3).fill(theme.red);
      dot.visible = false;
      this.dots.push(dot);
      this.container.addChild(dot);
    }
  }

  update(t: number, triple: boolean, reduced: boolean): void {
    this.line.alpha = Math.sin(t * Math.PI) * (triple ? 0.85 : 0.32);
    for (let i = 0; i < this.dots.length; i++) {
      const dot = this.dots[i]!;
      dot.visible = triple && !reduced && t > 0 && t < 1;
      if (!dot.visible) continue;
      const angle = i * 2.39996;
      const distance = (35 + (i % 5) * 19) * (1 - (1 - t) ** 3);
      dot.x = layout.width / 2 + Math.cos(angle) * distance * 2.5;
      dot.y = layout.center + Math.sin(angle) * distance;
      dot.alpha = (1 - t) * 0.8;
    }
  }
  reset(): void { this.update(0, false, true); }
}

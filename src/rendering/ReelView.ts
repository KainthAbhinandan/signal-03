import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { SYMBOLS, type SymbolId } from '../domain/symbols';
import { smoother, clamp01 } from '../shared/easing';
import { motion } from '../config/motion';
import { theme } from '../config/theme';
import { layout } from './layout';

const STEP = layout.symbolStep;
const CENTER = layout.center;
const wrap = (index: number) => ((index % SYMBOLS.length) + SYMBOLS.length) % SYMBOLS.length;

export class ReelView {
  readonly container = new Container();
  private sprites: Sprite[] = [];
  private position: number;
  private from = 0;
  private target = 0;
  private reduced = false;

  constructor(private readonly textures: Record<SymbolId, Texture>, initial: SymbolId) {
    this.position = SYMBOLS.indexOf(initial);
    const clip = new Graphics().rect(0, layout.maskInset, layout.reelWidth, layout.maskHeight).fill(0xffffff);
    this.container.addChild(clip);
    for (let i = 0; i < 5; i++) {
      const sprite = new Sprite(textures.pulse);
      sprite.anchor.set(0.5);
      sprite.x = layout.reelWidth / 2;
      this.sprites.push(sprite);
      this.container.addChild(sprite);
    }
    this.container.mask = clip;
    this.draw();
  }

  prepare(symbol: SymbolId, reduced: boolean): void {
    this.from = this.position;
    this.reduced = reduced;
    const delta = wrap(SYMBOLS.indexOf(symbol) - wrap(Math.round(this.from)));
    this.target = this.from + motion.cycles * SYMBOLS.length + delta;
  }

  update(progress: number): void {
    const t = clamp01(progress);
    if (this.reduced) {
      if (t >= 0.5) this.position = this.target;
      this.container.alpha = 0.35 + Math.abs(t - 0.5) * 1.3;
    } else {
      const travelEnd = motion.travelFraction;
      if (t < travelEnd) this.position = this.from + (this.target - this.from) * smoother(t / travelEnd);
      else this.position = this.target + Math.sin((t - travelEnd) / (1 - travelEnd) * Math.PI) * motion.settlePixels / STEP;
    }
    if (t === 1) { this.position = this.target; this.container.alpha = 1; }
    this.draw();
  }

  private draw(scale = 1, red = false): void {
    const floor = Math.floor(this.position);
    for (let i = 0; i < this.sprites.length; i++) {
      const index = floor + i - 2;
      const sprite = this.sprites[i]!;
      const distance = Math.abs(index - this.position);
      sprite.texture = this.textures[SYMBOLS[wrap(index)]!];
      sprite.y = CENTER + (index - this.position) * STEP;
      sprite.alpha = Math.max(0.07, 1 - distance * 0.84);
      sprite.scale.set(distance < 0.3 ? scale : 0.88);
      sprite.tint = distance < 0.3 && red ? theme.red : theme.foreground;
    }
  }

  reward(amount: number, red: boolean): void { this.draw(1 + amount * motion.rewardScale, red); }
  get settledSymbol(): SymbolId { return SYMBOLS[wrap(Math.round(this.position))]!; }
  reset(symbol: SymbolId): void {
    this.position = SYMBOLS.indexOf(symbol);
    this.container.alpha = 1;
    this.draw();
  }
}

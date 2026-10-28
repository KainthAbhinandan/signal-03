import { Application, Container, Graphics, type Ticker, type Texture } from 'pixi.js';
import type { Outcome } from '../domain/outcome';
import type { SymbolId, Symbols } from '../domain/symbols';
import type { Presentation } from '../app/GameController';
import { createSymbolTextures } from './SymbolFactory';
import { ReelView } from './ReelView';
import { EffectsLayer } from './EffectsLayer';
import { theme } from '../config/theme';
import { motion } from '../config/motion';
import { layout } from './layout';

type Job = { elapsed: number; duration: number; frame: (elapsed: number) => void; finish: () => void; cancel: () => void };
export const INITIAL_SYMBOLS: Symbols = ['pulse', 'orbit', 'wave'];

export class GameView implements Presentation {
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly effects = new EffectsLayer();
  private reels: ReelView[] = [];
  private textures: Record<SymbolId, Texture> | null = null;
  private observer: ResizeObserver | null = null;
  private job: Job | null = null;
  private alive = true;
  private initialized = false;
  private reduced = false;
  private tickElapsed = 0;
  private onFrame: (delta: number) => void = () => {};

  constructor(private readonly host: HTMLElement, private readonly cue: (cue: 'tick' | 'stop', index?: number) => void) {}

  async init(): Promise<void> {
    await this.app.init({ width: layout.width, height: layout.height, backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio || 1, theme.resolutionCap), autoDensity: true, preference: 'webgl', sharedTicker: false });
    this.initialized = true;
    if (!this.alive) { this.disposeApp(); return; }
    this.app.canvas.setAttribute('aria-hidden', 'true');
    this.host.append(this.app.canvas);
    this.app.stage.addChild(this.world);
    const cabinet = new Graphics().roundRect(0, 0, layout.width, layout.height, 10).fill(theme.well);
    for (let i = 0; i < 3; i++) {
      const x = layout.reelInset + i * layout.reelStride;
      const centerX = x + layout.reelWidth / 2;
      cabinet.roundRect(x, layout.maskInset, layout.reelWidth, layout.maskHeight, 5).fill(theme.panel);
      cabinet.moveTo(centerX, 25).lineTo(centerX, 34).stroke({ width: 1, color: theme.line });
      cabinet.moveTo(centerX, layout.height - 34).lineTo(centerX, layout.height - 25).stroke({ width: 1, color: theme.line });
    }
    cabinet.roundRect(9, layout.paylineY, layout.width - 18, layout.paylineHeight, 7).stroke({ color: theme.line, width: 1 });
    cabinet.moveTo(0, layout.center - 5).lineTo(7, layout.center).lineTo(0, layout.center + 5).closePath().fill(theme.red);
    cabinet.moveTo(layout.width, layout.center - 5).lineTo(layout.width - 7, layout.center).lineTo(layout.width, layout.center + 5).closePath().fill(theme.red);
    this.world.addChild(cabinet);
    this.textures = createSymbolTextures(this.app.renderer);
    this.reels = INITIAL_SYMBOLS.map((id, i) => {
      const reel = new ReelView(this.textures!, id);
      reel.container.x = layout.reelInset + i * layout.reelStride;
      this.world.addChild(reel.container);
      return reel;
    });
    this.world.addChild(this.effects.container);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.host);
    this.resize();
    this.app.ticker.maxFPS = 60;
    this.app.ticker.add(this.update);
  }

  private resize = (): void => {
    if (!this.alive || !this.initialized) return;
    const width = this.host.clientWidth;
    if (width <= 0) return;
    this.app.renderer.resize(width, width * layout.height / layout.width);
    this.world.scale.set(width / layout.width);
  };

  setReducedMotion(value: boolean): void { this.reduced = value; }
  setFrameListener(listener: (delta: number) => void): void { this.onFrame = listener; }
  get settledSymbols(): Symbols { return this.reels.map(reel => reel.settledSymbol) as unknown as Symbols; }

  private update = (ticker: Ticker): void => {
    const delta = Math.min(ticker.deltaMS, 50);
    this.onFrame(delta);
    const job = this.job;
    if (!job) return;
    job.elapsed = Math.min(job.duration, job.elapsed + delta);
    job.frame(job.elapsed);
    if (job.elapsed >= job.duration) job.finish();
  };

  private animate(duration: number, frame: (elapsed: number) => void, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted || !this.alive) { reject(new DOMException('Canceled', 'AbortError')); return; }
      const clear = () => { signal.removeEventListener('abort', cancel); this.job = null; };
      const cancel = () => { clear(); reject(new DOMException('Canceled', 'AbortError')); };
      this.job = { elapsed: 0, duration, frame, finish: () => { clear(); resolve(); }, cancel };
      signal.addEventListener('abort', cancel, { once: true });
    });
  }

  spin(outcome: Outcome, signal: AbortSignal): Promise<void> {
    const reduced = this.reduced;
    const duration = reduced ? motion.reduced.reelDuration : motion.reelDuration;
    const stagger = reduced ? motion.reduced.reelStagger : motion.reelStagger;
    const stopped = [false, false, false];
    this.effects.reset();
    this.tickElapsed = 0;
    this.reels.forEach((reel, index) => reel.prepare(outcome.symbols[index]!, reduced));
    return this.animate(duration + stagger * 2, elapsed => {
      for (let index = 0; index < this.reels.length; index++) {
        const reel = this.reels[index]!;
        const progress = Math.min(1, elapsed / (duration + index * stagger));
        reel.update(progress);
        if (progress === 1 && !stopped[index]) { stopped[index] = true; this.cue('stop', index); }
      }
      if (!reduced && elapsed - this.tickElapsed >= motion.tickInterval) { this.cue('tick'); this.tickElapsed = elapsed; }
    }, signal);
  }

  present(outcome: Outcome, signal: AbortSignal): Promise<void> {
    const reduced = this.reduced;
    const duration = reduced ? motion.reduced.resultDuration : motion.resultDuration;
    const matching = outcome.symbols.map((symbol, i) => outcome.symbols.some((id, j) => i !== j && id === symbol));
    return this.animate(duration, elapsed => {
      const t = elapsed / duration;
      if (outcome.kind === 'none') return;
      this.effects.update(t, outcome.kind === 'triple', reduced);
      for (let i = 0; i < this.reels.length; i++) {
        this.reels[i]!.reward(matching[i] && !reduced ? Math.sin(t * Math.PI) : 0, outcome.kind === 'triple' && t < 0.96);
      }
    }, signal).then(() => {
      if (signal.aborted || !this.alive) return;
      this.effects.reset();
      this.reels.forEach(reel => reel.reward(0, false));
    });
  }

  reset(): void { this.effects.reset(); this.reels.forEach((reel, i) => reel.reset(INITIAL_SYMBOLS[i]!)); }

  setHidden(hidden: boolean): void {
    if (!this.initialized || !this.alive) return;
    if (hidden) this.app.stop();
    else { this.app.ticker.lastTime = performance.now(); this.app.start(); }
  }

  private disposeApp(): void {
    this.app.ticker.remove(this.update);
    this.app.destroy({ removeView: true }, { children: true, texture: false, textureSource: false });
    if (this.textures) Object.values(this.textures).forEach(texture => texture.destroy(true));
  }

  destroy(): void {
    this.alive = false;
    this.job?.cancel();
    this.observer?.disconnect();
    if (this.initialized) this.disposeApp();
    else this.effects.container.destroy({ children: true });
  }
}

export type SoundCue = 'click' | 'tick' | 'stop' | 'pair' | 'triple';
type Voice = { source: AudioScheduledSourceNode; gain: GainNode; filter?: BiquadFilterNode };

/** Gesture-created context; the controller never depends on audio succeeding. */
export class AudioController {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noise: AudioBuffer | null = null;
  private voices = new Set<Voice>();
  private muted: boolean;
  private volume: number;
  private hidden = document.hidden;
  private destroyed = false;

  constructor(preferences: { muted: boolean; volume: number }, private readonly unavailable: () => void) {
    this.muted = preferences.muted;
    this.volume = preferences.volume;
  }

  async activate(): Promise<void> {
    if (this.destroyed || this.hidden) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -12;
        this.compressor.ratio.value = 4;
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
        this.noise = this.context.createBuffer(1, Math.floor(this.context.sampleRate * 0.04), this.context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
        this.applyGain();
      }
      if (this.context.state === 'suspended') await this.context.resume();
      // A visibility/disposal event may have arrived while resume was pending.
      if (this.destroyed || this.hidden) {
        this.stopVoices();
        if (this.context.state !== 'closed') await this.context.suspend();
      }
    } catch { if (!this.destroyed) this.unavailable(); }
  }

  setPreferences(muted: boolean, volume: number): void {
    this.muted = muted;
    this.volume = volume;
    this.applyGain();
    if (muted) this.stopVoices();
  }

  private applyGain(): void {
    if (!this.context || !this.master) return;
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume * 0.24, this.context.currentTime, 0.015);
  }

  private voice(frequency: number, delay: number, duration: number, amplitude: number, noise = false, type: OscillatorType = 'sine'): void {
    const context = this.context;
    if (!context || !this.master || context.state !== 'running' || this.hidden || this.muted || this.destroyed) return;
    const source = noise ? context.createBufferSource() : context.createOscillator();
    if (source instanceof OscillatorNode) { source.type = type; source.frequency.value = frequency; }
    else source.buffer = this.noise;
    const gain = context.createGain();
    const at = context.currentTime + delay;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(amplitude, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    gain.gain.setValueAtTime(0, at + duration + 0.005);
    const voice: Voice = { source, gain };
    if (noise) {
      voice.filter = context.createBiquadFilter();
      voice.filter.type = 'lowpass';
      voice.filter.frequency.value = 1500;
      source.connect(voice.filter).connect(gain);
    } else source.connect(gain);
    gain.connect(this.master);
    this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); voice.filter?.disconnect(); this.voices.delete(voice); };
    source.start(at);
    source.stop(at + duration + 0.01);
  }

  play(cue: SoundCue, index = 0): void {
    switch (cue) {
      case 'click': this.voice(150, 0, 0.035, 0.5, false, 'triangle'); break;
      case 'tick': this.voice(0, 0, 0.025, 0.16, true); break;
      case 'stop': this.voice([220, 277, 330][index] ?? 330, 0, 0.075, 0.6, false, 'triangle'); break;
      case 'pair': this.voice(330, 0, 0.16, 0.5); this.voice(440, 0.09, 0.2, 0.4); break;
      case 'triple': [262, 330, 392, 523].forEach((f, i) => this.voice(f, i * 0.025, 0.38, 0.26)); break;
    }
  }

  private stopVoices(): void {
    for (const voice of this.voices) {
      voice.source.onended = null;
      try { voice.source.stop(); } catch { /* A voice can have just ended. */ }
      voice.source.disconnect(); voice.gain.disconnect(); voice.filter?.disconnect();
    }
    this.voices.clear();
  }

  setHidden(hidden: boolean): void {
    this.hidden = hidden;
    if (hidden) { this.stopVoices(); void this.context?.suspend().catch(() => {}); }
    // Foregrounding never starts sound without a gesture. The next press resumes it.
  }

  destroy(): void {
    this.destroyed = true;
    this.stopVoices();
    this.master?.disconnect();
    this.compressor?.disconnect();
    void this.context?.close().catch(() => {});
  }
}

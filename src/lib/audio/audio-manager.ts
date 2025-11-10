"use client"

export type PlayOptions = { loop?: boolean; volume?: number; fadeInMs?: number; onEnd?: () => void };

export class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private sourceUrl: string | null = null;
  private _isPlaying = false;
  private _duration = 0;
  private fadeTimer: number | null = null;

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get currentUrl(): string | null {
    return this.sourceUrl;
  }

  get duration(): number {
    return this._duration;
  }

  get currentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  async preload(url: string): Promise<{ duration: number } | null> {
    try {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = url;
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener("loadedmetadata", () => resolve(), { once: true });
        audio.addEventListener("error", () => reject(new Error("Failed to load metadata")), { once: true });
      });
      return { duration: isFinite(audio.duration) ? audio.duration : 0 };
    } catch {
      return null;
    }
  }

  async play(url: string, opts: PlayOptions = {}): Promise<boolean> {
    try {
      // Stop any current audio first
      await this.stop({ fadeOutMs: 0 });

      const audio = new Audio();
      audio.src = url;
      audio.loop = !!opts.loop;
      audio.preload = "auto";
      audio.volume = typeof opts.volume === "number" ? Math.max(0, Math.min(1, opts.volume)) : 1;

      // Start at 0 volume for fade in
      const shouldFadeIn = !!opts.fadeInMs && opts.fadeInMs > 0;
      const targetVolume = audio.volume;
      if (shouldFadeIn) {
        audio.volume = 0;
      }

      audio.addEventListener("ended", () => {
        this._isPlaying = false;
        if (opts.onEnd) opts.onEnd();
      });
      audio.addEventListener("loadedmetadata", () => {
        this._duration = isFinite(audio.duration) ? audio.duration : 0;
      });
      audio.addEventListener("error", () => {
        this._isPlaying = false;
      });

      this.audio = audio;
      this.sourceUrl = url;

      await audio.play().then(() => {
        this._isPlaying = true;
      }).catch(() => {
        // Autoplay policy likely blocked
        this._isPlaying = false;
      });

      if (this._isPlaying && shouldFadeIn) {
        this.fadeTo(targetVolume, opts.fadeInMs!);
      }

      return this._isPlaying;
    } catch {
      this._isPlaying = false;
      return false;
    }
  }

  async stop(opts: { fadeOutMs?: number } = {}): Promise<void> {
    if (!this.audio) return;
    const audio = this.audio;
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    const fadeOutMs = opts.fadeOutMs ?? 0;
    if (fadeOutMs > 0) {
      await new Promise<void>((resolve) => {
        const steps = Math.max(1, Math.round(fadeOutMs / 40));
        const delta = (audio.volume) / steps;
        this.fadeTimer = window.setInterval(() => {
          if (!this.audio) {
            window.clearInterval(this.fadeTimer!);
            this.fadeTimer = null;
            resolve();
            return;
          }
          if (this.audio.volume > delta) {
            this.audio.volume = Math.max(0, this.audio.volume - delta);
          } else {
            window.clearInterval(this.fadeTimer!);
            this.fadeTimer = null;
            resolve();
          }
        }, 40);
      });
    }
    audio.pause();
    this.audio = null;
    this.sourceUrl = null;
    this._isPlaying = false;
    this._duration = 0;
  }

  setVolume(volume: number) {
    const v = Math.max(0, Math.min(1, volume));
    if (this.audio) this.audio.volume = v;
  }

  setLoop(loop: boolean) {
    if (this.audio) this.audio.loop = loop;
  }

  private fadeTo(target: number, durationMs: number) {
    if (!this.audio) return;
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    const audio = this.audio;
    const start = audio.volume;
    const steps = Math.max(1, Math.round(durationMs / 40));
    let i = 0;
    this.fadeTimer = window.setInterval(() => {
      if (!this.audio) {
        window.clearInterval(this.fadeTimer!);
        this.fadeTimer = null;
        return;
      }
      i++;
      const t = i / steps;
      const next = start + (target - start) * t;
      this.audio.volume = Math.max(0, Math.min(1, next));
      if (i >= steps) {
        window.clearInterval(this.fadeTimer!);
        this.fadeTimer = null;
      }
    }, 40);
  }
}

export const audioManager = new AudioManager();
export default audioManager;
"use client"

import { soundCatalog } from './sound-catalog'

export type PlayOptions = {
  loop?: boolean;
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
  onEnd?: () => void
};

export type AudioSourceType = 'ambient' | 'youtube' | 'custom'
export type AudioStatus = 'stopped' | 'playing' | 'paused' | 'loading' | 'error'

export interface AudioSource {
  id: string
  type: AudioSourceType
  name: string
  vn?: string
  url?: string
  volume: number
  loop: boolean
  metadata?: Record<string, any>
}

interface AudioPlayer {
  play(): Promise<void>
  pause(): Promise<void>
  stop(): Promise<void>
  setVolume(volume: number): void
  getStatus(): AudioStatus
  getCurrentTime(): number
  getDuration(): number
}

class HTMLAudioPlayer implements AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private source: AudioSource
  private fadeTimer: number | null = null

  constructor(source: AudioSource) {
    this.source = source
  }

  async play(): Promise<void> {
    if (this.audio) {
      await this.audio.play()
      return
    }

    this.audio = new Audio()
    this.audio.setAttribute('data-managed', 'true')  // mark as managed
    this.audio.src = this.source.url!
    this.audio.loop = this.source.loop
    this.audio.volume = this.source.volume / 100

    await this.audio.play()
  }

  async pause(): Promise<void> {
    if (this.audio) {
      this.audio.pause()
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer)
      this.fadeTimer = null
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume / 100))
    }
  }

  getStatus(): AudioStatus {
    if (!this.audio) return 'stopped'
    if (this.audio.paused) return 'paused'
    return 'playing'
  }

  getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0
  }

  getDuration(): number {
    return this.audio ? this.audio.duration : 0
  }
}

class YouTubePlayer implements AudioPlayer {
  private player: any = null
  private source: AudioSource
  private containerId = 'youtube-global-container'

  constructor(source: AudioSource) {
    this.source = source
  }

  private getOrCreateContainer(): HTMLDivElement {
    let el = document.getElementById(this.containerId) as HTMLDivElement | null
    if (!el) {
      el = document.createElement('div')
      el.id = this.containerId
      el.style.position = 'fixed'
      el.style.width = '0px'
      el.style.height = '0px'
      el.style.left = '-9999px'
      el.style.top = '0'
      el.style.display = 'none'
      document.body.appendChild(el)
    }
    return el
  }

  private ensureYouTubeAPI(): Promise<any> {
    return new Promise((resolve) => {
      const w = window as any
      if (w.YT && w.YT.Player) {
        resolve(w.YT)
        return
      }
      const prev = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null
      if (!prev) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
      w.onYouTubeIframeAPIReady = () => resolve(w.YT)
    })
  }

  async play(): Promise<void> {
    const YT = await this.ensureYouTubeAPI()
    const container = this.getOrCreateContainer()

    if (!this.player) {
      this.player = new YT.Player(container, {
        videoId: this.source.metadata?.videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
          ...(this.source.metadata?.listId && { list: this.source.metadata.listId })
        },
        events: {
          onReady: () => {
            this.player.unMute()
            this.player.setVolume(this.source.volume)
            this.player.playVideo()
          }
        }
      })
    } else {
      this.player.unMute()
      this.player.setVolume(this.source.volume)
      this.player.playVideo()
    }
  }

  async pause(): Promise<void> {
    if (this.player) {
      this.player.pauseVideo()
    }
  }

  async stop(): Promise<void> {
    if (this.player) {
      this.player.stopVideo()
    }
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.setVolume(volume)
    }
  }

  getStatus(): AudioStatus {
    if (!this.player) return 'stopped'
    const state = this.player.getPlayerState?.()
    if (state === 1) return 'playing'
    if (state === 2) return 'paused'
    if (state === 3) return 'loading'
    return 'stopped'
  }

  getCurrentTime(): number {
    return this.player ? this.player.getCurrentTime?.() || 0 : 0
  }

  getDuration(): number {
    return this.player ? this.player.getDuration?.() || 0 : 0
  }
}

export class AudioManager {
  private currentPlayer: AudioPlayer | null = null
  private currentSource: AudioSource | null = null
  private ambientPlayers: Map<string, HTMLAudioPlayer> = new Map()
  private ambientVolumes: Map<string, number> = new Map() // per-sound volumes (0-100)
  private masterVolume = 50
  private isMuted = false
  private fadeInMs = 300
  private fadeOutMs = 300

  parseYouTubeUrl(url: string): { videoId?: string; listId?: string; isChannel?: boolean } {
    if (!url) return {}
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0]
        return id ? { videoId: id } : {}
      }
      if (u.hostname.includes('youtube.com')) {
        if (u.pathname.startsWith('/watch')) {
          const vid = u.searchParams.get('v') || undefined
          const list = u.searchParams.get('list') || undefined
          return { videoId: vid, listId: list }
        }
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/').filter(Boolean)[1]
          return id ? { videoId: id } : {}
        }
        if (u.pathname.startsWith('/live/')) {
          const id = u.pathname.split('/').filter(Boolean)[1]
          return id ? { videoId: id } : {}
        }
        if (u.pathname.startsWith('/playlist')) {
          const list = u.searchParams.get('list') || undefined
          return { listId: list }
        }
        if (u.pathname.startsWith('/c/') || u.pathname.startsWith('/channel/')) {
          return { isChannel: true }
        }
      }
      return {}
    } catch {
      return {}
    }
  }

  async play(source: AudioSource): Promise<boolean> {
    try {
      // If playing YouTube, stop current main player but KEEP ambients
      if (source.type === 'youtube') {
        await this.stop()
      } else if (source.type === 'ambient') {
        // For ambient sounds, use the mix system
        return await this.playAmbient(source)
      } else {
        // For other types, stop current player
        await this.stop()
      }

      this.currentSource = source

      // Create appropriate player based on source type
      if (source.type === 'youtube') {
        const ytData = this.parseYouTubeUrl(source.url || '')
        if (!ytData.videoId && !ytData.listId) {
          throw new Error('Invalid YouTube URL')
        }
        source.metadata = ytData
        this.currentPlayer = new YouTubePlayer(source)
      } else {
        this.currentPlayer = new HTMLAudioPlayer(source)
      }

      // Start playback first (required before any volume manipulation)
      this.currentPlayer.setVolume(this.isMuted ? 0 : 0) // start silent for fade
      await this.currentPlayer.play()

      // Apply fade or set final volume
      if (this.fadeInMs > 0 && !this.isMuted) {
        await this.fadeIn(this.currentPlayer, this.masterVolume)
      } else {
        this.currentPlayer.setVolume(this.isMuted ? 0 : this.masterVolume)
      }

      return true
    } catch (error) {
      console.error('Failed to play audio:', error)
      this.currentPlayer = null
      this.currentSource = null
      return false
    }
  }

  async stop(): Promise<void> {
    if (!this.currentPlayer) return

    try {
      // Fade out if enabled
      if (this.fadeOutMs > 0) {
        await this.fadeOut(this.currentPlayer, this.fadeOutMs)
      }

      await this.currentPlayer.stop()
    } catch (error) {
      console.error('Error stopping audio:', error)
    }

    this.currentPlayer = null
    this.currentSource = null
  }

  async pause(): Promise<void> {
    const promises: Promise<void>[] = []

    // Pause main player
    if (this.currentPlayer) {
      promises.push(this.currentPlayer.pause().catch(err => {
        console.error('Error pausing main audio:', err)
      }))
    }

    // Pause all ambient players
    this.ambientPlayers.forEach(player => {
      promises.push(player.pause().catch(err => {
        console.error('Error pausing ambient sound:', err)
      }))
    })

    await Promise.all(promises)
  }

  async resume(): Promise<void> {
    const promises: Promise<void>[] = []

    // Resume main player
    if (this.currentPlayer) {
      promises.push(this.currentPlayer.play().catch(error => {
        console.error('Error resuming main audio:', error)
        // Fallback: try to play the current source again
        if (this.currentSource) {
          this.play(this.currentSource).catch(e => console.error('Error retrying playback:', e))
        }
      }))
    }

    // Resume all ambient players
    this.ambientPlayers.forEach(player => {
      promises.push(player.play().catch(err => {
        console.error('Error resuming ambient sound:', err)
      }))
    })

    await Promise.all(promises)
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(100, volume))

    if (this.currentPlayer) {
      this.currentPlayer.setVolume(this.isMuted ? 0 : this.masterVolume)
    }

    // Recalculate effective volumes for all ambient players
    this.ambientPlayers.forEach((player, id) => {
      const soundVol = this.ambientVolumes.get(id) ?? 50
      const effective = this.isMuted ? 0 : (soundVol / 100) * (this.masterVolume / 100) * 100
      player.setVolume(effective)
    })
  }

  setMute(muted: boolean): void {
    this.isMuted = muted

    if (this.currentPlayer) {
      this.currentPlayer.setVolume(muted ? 0 : this.masterVolume)
    }

    // Recalculate for all ambient players
    this.ambientPlayers.forEach((player, id) => {
      if (muted) {
        player.setVolume(0)
      } else {
        const soundVol = this.ambientVolumes.get(id) ?? 50
        const effective = (soundVol / 100) * (this.masterVolume / 100) * 100
        player.setVolume(effective)
      }
    })
  }

  // Set per-sound volume for a specific ambient sound
  setAmbientVolume(soundId: string, soundVolume: number): void {
    const clamped = Math.max(0, Math.min(100, soundVolume))
    this.ambientVolumes.set(soundId, clamped)
    const player = this.ambientPlayers.get(soundId)
    if (player) {
      const effective = this.isMuted ? 0 : (soundVolume / 100) * (this.masterVolume / 100) * 100
      player.setVolume(effective)
    }
  }

  setFadeSettings(fadeInMs: number, fadeOutMs: number): void {
    this.fadeInMs = fadeInMs
    this.fadeOutMs = fadeOutMs
  }

  getStatus(): AudioStatus {
    if (!this.currentPlayer) return 'stopped'
    return this.currentPlayer.getStatus()
  }

  getCurrentSource(): AudioSource | null {
    return this.currentSource
  }

  // Ambient mixing methods
  async playAmbient(source: AudioSource): Promise<boolean> {
    try {
      const soundId = source.id

      // If already playing, just return true
      if (this.ambientPlayers.has(soundId)) {
        return true
      }

      // Store per-sound volume (clamped)
      const soundVolume = Math.max(0, Math.min(100, source.volume))
      this.ambientVolumes.set(soundId, soundVolume)

      // Calculate effective volume
      const effectiveVolume = this.isMuted ? 0 : (soundVolume / 100) * (this.masterVolume / 100) * 100

      // Create player with effective volume
      const effectiveSource = { ...source, volume: effectiveVolume }
      const player = new HTMLAudioPlayer(effectiveSource)

      // Play the sound
      await player.play()

      // Store in map
      this.ambientPlayers.set(soundId, player)

      return true
    } catch (error) {
      console.error('Failed to play ambient sound:', error)
      return false
    }
  }

  async stopAmbient(soundId: string): Promise<void> {
    const player = this.ambientPlayers.get(soundId)
    if (player) {
      try {
        await player.stop()
      } catch (error) {
        console.error('Error stopping ambient sound:', error)
      }
      this.ambientPlayers.delete(soundId)
      this.ambientVolumes.delete(soundId)
    }
  }

  async toggleAmbient(source: AudioSource): Promise<boolean> {
    const soundId = source.id
    if (this.ambientPlayers.has(soundId)) {
      await this.stopAmbient(soundId)
      return false // Stopped
    } else {
      return await this.playAmbient(source) // Started
    }
  }

  async stopAllAmbient(): Promise<void> {
    const promises = Array.from(this.ambientPlayers.keys()).map(id => this.stopAmbient(id))
    await Promise.all(promises)
    this.ambientPlayers.clear()
    this.ambientVolumes.clear()
  }

  getActiveAmbientIds(): string[] {
    return Array.from(this.ambientPlayers.keys())
  }

  isAmbientActive(soundId: string): boolean {
    return this.ambientPlayers.has(soundId)
  }

  getAmbientCount(): number {
    return this.ambientPlayers.size
  }

  // Global cleanup: Stop ALL audio elements in the entire document (including orphaned ones)
  globalAudioCleanup(): void {
    // Stop all <audio> elements
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      audio.pause()
      audio.src = ''
      audio.remove()
    })

    // Stop all YouTube iframes
    const ytIframes = document.querySelectorAll('iframe[src*="youtube.com"]')
    ytIframes.forEach(iframe => iframe.remove())

    // Clear AudioManager's internal state
    this.ambientPlayers.clear()
    this.ambientVolumes.clear()
    this.currentPlayer = null
    this.currentSource = null
  }

  private fadeIn(player: AudioPlayer, targetVolume: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = performance.now()

      const fade = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / this.fadeInMs, 1)
        player.setVolume(targetVolume * progress)  // pass 0-100 scale, setVolume handles normalization
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(fade)
    })
  }

  private fadeOut(player: AudioPlayer, durationMs: number): Promise<void> {
    return new Promise(resolve => {
      const startVolume = this.masterVolume  // keep in 0-100 scale
      const startTime = performance.now()

      const fade = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        player.setVolume(startVolume * (1 - progress))  // pass 0-100 scale
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(fade)
    })
  }
}

// Singleton instance
export const audioManager = new AudioManager()
export default audioManager

// Helper functions for common operations
export const playAmbientSound = async (soundId: string, volume = 50): Promise<boolean> => {
  const sound = soundCatalog.ambient.find((s: any) => s.id === soundId)
  if (!sound) return false

  const source: AudioSource = {
    id: sound.id,
    type: 'ambient',
    name: sound.label,
    vn: sound.vn,
    url: sound.url,
    volume,
    loop: true
  }

  return await audioManager.play(source)
}

export const playYouTube = async (url: string, volume = 50): Promise<boolean> => {
  const source: AudioSource = {
    id: 'youtube-custom',
    type: 'youtube',
    name: 'YouTube Video',
    url,
    volume,
    loop: false
  }

  return await audioManager.play(source)
}

export const stopAllAudio = async (): Promise<void> => {
  await audioManager.stop()
}

export const setAudioVolume = (volume: number): void => {
  audioManager.setVolume(volume)
}

export const setAudioMute = (muted: boolean): void => {
  audioManager.setMute(muted)
}

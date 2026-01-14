"use client"

import { soundCatalog } from './sound-catalog'

export type PlayOptions = {
  loop?: boolean;
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
  onEnd?: () => void
};

export type AudioSourceType = 'ambient' | 'youtube' | 'spotify' | 'custom'
export type AudioStatus = 'stopped' | 'playing' | 'paused' | 'loading' | 'error'

export interface SpotifyPlaybackOptions {
  containerId?: string
  theme?: 'light' | 'dark'
  view?: 'list' | 'coverart'
  autoplay?: boolean
}

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

type SpotifyPlayerMetadata = SpotifyPlaybackOptions & {
  embedHeight?: number
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

class SpotifyPlayer implements AudioPlayer {
  private controller: any = null
  private source: AudioSource
  private containerId = 'spotify-global-container'
  private isReady = false
  private status: AudioStatus = 'stopped'

  constructor(source: AudioSource) {
    this.source = source
  }

  private get metadata(): SpotifyPlayerMetadata {
    return (this.source.metadata || {}) as SpotifyPlayerMetadata
  }

  private getOrCreateContainer(): HTMLDivElement {
    const customId = this.metadata.containerId
    if (customId) {
      const customEl = document.getElementById(customId) as HTMLDivElement | null
      if (!customEl) {
        throw new Error(`Spotify embed container "${customId}" not found`)
      }
      customEl.innerHTML = ''
      return customEl
    }

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
    } else {
      el.innerHTML = ''
    }
    return el
  }

  private clearContainer(): void {
    const targetId = this.metadata.containerId || this.containerId
    const el = document.getElementById(targetId) as HTMLDivElement | null
    if (el) {
      el.innerHTML = ''
    }
  }

  private async ensureSpotifyAPI(): Promise<any> {
    const SPOTIFY_IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
    const SPOTIFY_IFRAME_API_SCRIPT_ID = 'spotify-iframe-api'

    return new Promise((resolve, reject) => {
      const win = window as any
      if (win.Spotify) {
        resolve(win.Spotify)
        return
      }

      const prev = document.getElementById(SPOTIFY_IFRAME_API_SCRIPT_ID) as HTMLScriptElement | null
      if (!prev) {
        const tag = document.createElement('script')
        tag.id = SPOTIFY_IFRAME_API_SCRIPT_ID
        tag.src = SPOTIFY_IFRAME_API_SRC
        tag.async = true
        tag.onerror = () => reject(new Error('Failed to load Spotify iframe API'))
        document.body.appendChild(tag)
      }

      win.onSpotifyIframeApiReady = (IFrameAPI: any) => {
        resolve(IFrameAPI)
      }
    })
  }

  private extractPlaylistId(uri: string): string | null {
    if (!uri) return null

    // Handle different URI formats
    if (uri.startsWith('spotify:playlist:')) {
      return uri.split(':')[2]
    }

    // Handle URLs
    try {
      const url = new URL(uri)
      if (url.hostname.includes('spotify.com')) {
        const segments = url.pathname.split('/').filter(Boolean)
        const playlistIndex = segments.findIndex(
          (segment) => segment === 'playlist'
        )
        if (playlistIndex !== -1 && segments[playlistIndex + 1]) {
          return segments[playlistIndex + 1].split('?')[0]
        }
      }
    } catch {
      // Not a URL, continue
    }

    // Handle direct playlist IDs
    if (/^[a-zA-Z0-9]{22}$/.test(uri)) {
      return uri
    }

    return null
  }

  async play(): Promise<void> {
    try {
      this.status = 'loading'
      const IFrameAPI = await this.ensureSpotifyAPI()
      const container = this.getOrCreateContainer()

      const playlistId = this.extractPlaylistId(this.source.url || this.source.id)
      if (!playlistId) {
        throw new Error('Invalid Spotify playlist URI')
      }

      const metadata = this.metadata

      if (!this.controller) {
        this.controller = await new Promise<any>((resolve, reject) => {
          IFrameAPI.createController(
            container,
            {
              uri: `spotify:playlist:${playlistId}`,
              width: '100%',
              height: `${metadata.embedHeight ?? (metadata.view === 'coverart' ? 352 : 600)}`,
              ...(metadata.theme ? { theme: metadata.theme } : {}),
              ...(metadata.view ? { view: metadata.view } : {}),
              ...(metadata.autoplay !== undefined ? { autoplay: metadata.autoplay } : {}),
            },
            (controller: any) => {
              this.isReady = true
              this.setupEventListeners(controller)
              resolve(controller)
            }
          )
        })
      }

      this.controller.play()
      this.status = 'playing'
    } catch (error) {
      console.error('Spotify player error:', error)
      this.status = 'error'
      throw error
    }
  }

  private setupEventListeners(controller: any): void {
    if (!controller?.addListener) return

    const handlePlaybackUpdate = (event: any) => {
      if (event?.data?.isPaused) {
        this.status = 'paused'
      } else {
        this.status = 'playing'
      }
    }

    const handlePlaybackStarted = () => {
      this.status = 'playing'
    }

    const handlePlaybackPaused = () => {
      this.status = 'paused'
    }

    const handlePlaybackStopped = () => {
      this.status = 'stopped'
    }

    controller.addListener('playback_update', handlePlaybackUpdate)
    controller.addListener('playback_started', handlePlaybackStarted)
    controller.addListener('playback_paused', handlePlaybackPaused)
    controller.addListener('playback_stopped', handlePlaybackStopped)
  }

  async pause(): Promise<void> {
    if (this.controller) {
      this.controller.pause()
      this.status = 'paused'
    }
  }

  async stop(): Promise<void> {
    if (this.controller) {
      this.controller.pause()
      this.controller = null
      this.isReady = false
    }
    this.clearContainer()
    this.status = 'stopped'
  }

  setVolume(volume: number): void {
    if (this.controller) {
      // Spotify volume is 0-1, our volume is 0-100
      this.controller.setVolume(volume / 100)
    }
    // Update source volume as well
    this.source.volume = volume
  }

  getStatus(): AudioStatus {
    if (!this.controller) return 'stopped'
    if (!this.isReady && this.status !== 'error') return 'loading'
    return this.status
  }

  getCurrentTime(): number {
    // Spotify iframe API doesn't expose current time through the controller
    return 0
  }

  getDuration(): number {
    // Spotify iframe API doesn't expose duration through the controller
    return 0
  }
}

export class AudioManager {
  private currentPlayer: AudioPlayer | null = null
  private currentSource: AudioSource | null = null
  private ambientPlayers: Map<string, HTMLAudioPlayer> = new Map()
  private volume = 50
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
      // If playing YouTube or Spotify, stop all ambients and current player
      if (source.type === 'youtube' || source.type === 'spotify') {
        await this.stopAllAmbient()
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
      } else if (source.type === 'spotify') {
        this.currentPlayer = new SpotifyPlayer(source)
      } else {
        this.currentPlayer = new HTMLAudioPlayer(source)
      }

      // Apply current settings
      this.currentPlayer.setVolume(this.isMuted ? 0 : this.volume)

      // Play with fade in if enabled
      if (this.fadeInMs > 0) {
        await this.fadeIn(this.currentPlayer, this.volume)
      } else {
        await this.currentPlayer.play()
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
    if (!this.currentPlayer) return
    try {
      await this.currentPlayer.pause()
    } catch (error) {
      console.error('Error pausing audio:', error)
    }
  }

  async resume(): Promise<void> {
    if (!this.currentPlayer) return
    try {
      await this.currentPlayer.play()
    } catch (error) {
      console.error('Error resuming audio:', error)
      // Fallback: try to play the current source again
      if (this.currentSource) {
        try {
          await this.play(this.currentSource)
        } catch (retryError) {
          console.error('Error retrying playback:', retryError)
        }
      }
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume))
    if (this.currentPlayer) {
      this.currentPlayer.setVolume(this.isMuted ? 0 : this.volume)
    }
    // Apply to all ambient players
    this.ambientPlayers.forEach(player => {
      player.setVolume(this.isMuted ? 0 : this.volume)
    })
  }

  setMute(muted: boolean): void {
    this.isMuted = muted
    if (this.currentPlayer) {
      this.currentPlayer.setVolume(muted ? 0 : this.volume)
    }
    // Apply to all ambient players
    this.ambientPlayers.forEach(player => {
      player.setVolume(muted ? 0 : this.volume)
    })
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

      // Create new HTML audio player for this ambient sound
      const player = new HTMLAudioPlayer(source)

      // Set volume
      player.setVolume(this.isMuted ? 0 : this.volume)

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

  private async fadeIn(player: AudioPlayer, targetVolume: number): Promise<void> {
    const steps = Math.max(1, Math.round(this.fadeInMs / 40))
    const stepVolume = (targetVolume / 100) / steps

    for (let i = 0; i < steps; i++) {
      const volume = Math.min((i + 1) * stepVolume, targetVolume / 100)
      player.setVolume(volume)
      await this.delay(40)
    }
  }

  private async fadeOut(player: AudioPlayer, durationMs: number): Promise<void> {
    const steps = Math.max(1, Math.round(durationMs / 40))
    const stepVolume = (this.volume / 100) / steps

    for (let i = 0; i < steps; i++) {
      const volume = Math.max((this.volume / 100) - ((i + 1) * stepVolume), 0)
      player.setVolume(volume)
      await this.delay(40)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
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
    loop: sound.loopRecommended
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

export const playSpotify = async (
  playlistId: string,
  name: string,
  volume = 50,
  options?: SpotifyPlaybackOptions,
): Promise<boolean> => {
  const metadata: SpotifyPlayerMetadata = {
    embedHeight: options?.view === 'coverart' ? 352 : 600,
    ...(options || {}),
  }

  const source: AudioSource = {
    id: playlistId,
    type: 'spotify',
    name,
    url: `spotify:playlist:${playlistId}`,
    volume,
    loop: false,
    metadata,
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
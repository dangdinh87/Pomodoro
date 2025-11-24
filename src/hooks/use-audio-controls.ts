"use client"

import { useEffect, useState } from 'react'
import { useAudioStore } from '@/stores/audio-store'
import { audioManager } from '@/lib/audio/audio-manager'

export function useAudioControls() {
  const { currentlyPlaying } = useAudioStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [currentSource, setCurrentSource] = useState<string | null>(null)

  // Sync with audio store
  useEffect(() => {
    if (currentlyPlaying) {
      setIsPlaying(currentlyPlaying.isPlaying)
      setVolume(currentlyPlaying.volume)
      setCurrentSource(currentlyPlaying.id)
    } else {
      setIsPlaying(false)
      setCurrentSource(null)
    }
  }, [currentlyPlaying])

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioManager.pause()
      } else {
        await audioManager.resume()
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
      // Fallback: try to restart if resume fails
      if (!isPlaying && currentlyPlaying) {
        console.log('Fallback: restarting current audio')
      }
    }
  }

  const handleStop = async () => {
    try {
      await audioManager.stop()
    } catch (error) {
      console.error('Error stopping audio:', error)
    }
  }

  const handleVolumeChange = async (newVolume: number) => {
    try {
      setVolume(newVolume)
      // The audio manager will update the store automatically
    } catch (error) {
      console.error('Error changing volume:', error)
    }
  }

  const handleMuteToggle = () => {
    const newMuted = volume === 0
    if (newMuted) {
      handleVolumeChange(50)
    } else {
      handleVolumeChange(0)
    }
  }

  return {
    isPlaying,
    volume,
    currentSource,
    currentPlaying: currentlyPlaying,
    handlePlayPause,
    handleStop,
    handleVolumeChange,
    handleMuteToggle,
  }
}

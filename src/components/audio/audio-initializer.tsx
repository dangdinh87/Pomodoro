'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubePlayer } from '@/hooks/use-youtube-player';
import { audioManager } from '@/lib/audio/audio-manager';
import { soundCatalog } from '@/lib/audio/sound-catalog';
import { AudioSource } from '@/lib/audio/audio-manager';

export function AudioInitializer() {
    const {
        currentlyPlaying,
        activeAmbientSounds,
        audioSettings
    } = useAudioStore();

    const { createOrUpdatePlayer } = useYouTubePlayer();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const restoreAudio = async () => {
            // Restore Ambient Sounds
            if (activeAmbientSounds.length > 0) {
                console.log('[AudioInitializer] Restoring ambient sounds:', activeAmbientSounds);

                for (const soundId of activeAmbientSounds) {
                    const sound = soundCatalog.ambient.find(s => s.id === soundId);
                    if (sound) {
                        const source: AudioSource = {
                            id: sound.id,
                            type: 'ambient',
                            name: sound.label,
                            vn: sound.vn,
                            url: sound.url,
                            volume: audioSettings.volume,
                            loop: true
                        };
                        // Use audioManager directly to avoid duplicating state in store
                        await audioManager.playAmbient(source);
                    }
                }
            }

            // Restore YouTube
            if (currentlyPlaying?.type === 'youtube' && currentlyPlaying.id) {
                console.log('[AudioInitializer] Restoring YouTube:', currentlyPlaying);

                // Extract ID from format "video-{id}" or "playlist-{id}"
                const isPlaylist = currentlyPlaying.id.startsWith('playlist-');
                const realId = currentlyPlaying.id.replace(/^(video-|playlist-)/, '');

                if (realId) {
                    // Restore player. 
                    // Note: Browsers might block autoplay if not muted.
                    // We'll try to play if it was playing.
                    await createOrUpdatePlayer(realId, currentlyPlaying.isPlaying, { isPlaylist });
                }
            }
        };

        restoreAudio();
    }, []); // Run once on mount

    return null;
}

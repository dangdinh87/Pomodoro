# HTML5 Audio Mixing Research Report

**Date**: 2026-02-09
**Context**: Ambient sound mixer with 5-6 simultaneous sounds, individual volume sliders, 300ms fade in/out
**Token Budget**: 5 tool calls completed

---

## 1. Independent Volume Control per HTMLAudioElement

**Answer**: YES. Each HTMLAudioElement has independent `.volume` property (0.0-1.0 range).

```typescript
const sounds = {
  rain: new Audio('/sounds/rain.mp3'),
  thunder: new Audio('/sounds/thunder.mp3'),
  fire: new Audio('/sounds/fire.mp3')
};

// Each sound volume is independent
sounds.rain.volume = 0.7;
sounds.thunder.volume = 0.3;
sounds.fire.volume = 1.0;
```

**Map UI slider (0-100) to audio volume (0-1)**:
```typescript
const handleVolumeChange = (soundKey: string, sliderValue: number) => {
  sounds[soundKey].volume = sliderValue / 100;
};
```

---

## 2. Performance & Browser Limits

**Reality Check**: HTMLAudioElement has known limitations for simultaneous playback.

- **Not all browsers play multiple audio elements simultaneously** (historical issue)
- **Mobile browsers** (iOS/Android) have stricter limits
- **No hard limit documented** for 5-6 instances, but expect minimal issues on modern desktop browsers
- **5-6 ambient loops = SAFE ZONE** for HTMLAudioElement approach

**Recommendation**: Stick with HTMLAudioElement for your use case. Web Audio API only justified if you hit performance issues (unlikely with 5-6 sounds).

---

## 3. Fade In/Out Implementation

**Best Practice**: Use `requestAnimationFrame` (NOT `setInterval`).

### Why requestAnimationFrame?

- **Synced with browser repaint** (~60fps)
- **More efficient** than setInterval
- **No wasted frames** when tab is inactive
- **Smoother animations**

### Fade Out Implementation (300ms):

```typescript
const fadeOut = (audio: HTMLAudioElement, duration = 300) => {
  const startVolume = audio.volume;
  const startTime = performance.now();

  const fade = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    audio.volume = startVolume * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(fade);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  requestAnimationFrame(fade);
};
```

### Fade In Implementation (300ms):

```typescript
const fadeIn = (audio: HTMLAudioElement, targetVolume: number, duration = 300) => {
  audio.volume = 0;
  audio.play();

  const startTime = performance.now();

  const fade = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    audio.volume = targetVolume * progress;

    if (progress < 1) {
      requestAnimationFrame(fade);
    }
  };

  requestAnimationFrame(fade);
};
```

---

## 4. Seamless Looping (Gap Prevention)

**Problem**: HTMLAudioElement `loop` attribute has inherent gaps (codec decoding delay).

### Solutions Ranked:

#### Option A: Accept Minor Gap (RECOMMENDED for your case)
```typescript
audio.loop = true;
audio.play();
```
- **Gap duration**: 10-50ms depending on browser/codec
- **User perception**: Barely noticeable for ambient sounds (rain, fire)
- **Tradeoff**: Simplest implementation, acceptable for non-critical loops

#### Option B: Use Well-Prepared Audio Files
- Export loops with **crossfade overlap** at start/end
- Use **lossless formats** (WAV/FLAC) or high-quality Vorbis
- **Gap still exists** but less perceptible

#### Option C: Web Audio API (ONLY if gap is unacceptable)
```typescript
const audioContext = new AudioContext();
const buffer = await fetch('/sounds/rain.mp3')
  .then(res => res.arrayBuffer())
  .then(arr => audioContext.decodeAudioData(arr));

const source = audioContext.createBufferSource();
source.buffer = buffer;
source.loop = true;
source.connect(audioContext.destination);
source.start();
```
- **Truly gapless** via AudioBufferSourceNode
- **Requires full refactor** to Web Audio API
- **Only justified if** users complain about gaps

---

## 5. Web Audio API GainNode vs HTMLAudioElement.volume

### Decision Matrix:

| Feature | HTMLAudioElement.volume | Web Audio API GainNode |
|---------|------------------------|------------------------|
| Individual volume | ✅ Yes | ✅ Yes |
| Fade in/out | ✅ Via rAF | ✅ Via AudioParam.linearRampToValueAtTime |
| Seamless looping | ❌ Has gaps | ✅ Gapless |
| Implementation complexity | ✅ Simple | ❌ Complex |
| Mobile compatibility | ✅ Good | ⚠️ Requires autoplay handling |
| Use case fit | ✅ **RECOMMENDED** | ❌ Overkill |

### When to Use Web Audio API:

- **Spatial audio** (panning, 3D positioning)
- **Real-time audio effects** (reverb, filters, distortion)
- **Audio visualization** (frequency analysis)
- **Sub-10ms timing precision**
- **Truly gapless loops** (only if gap is UX blocker)

### Recommendation for Your App:

**Stick with HTMLAudioElement** because:
1. You only need volume control (no effects)
2. 5-6 sounds is well within performance limits
3. Minor loop gap is acceptable for ambient sounds
4. Significantly simpler implementation

---

## Recommended Implementation Pattern

```typescript
// src/lib/audio-mixer.ts
interface Sound {
  audio: HTMLAudioElement;
  isPlaying: boolean;
  targetVolume: number; // 0-100 UI value
}

class AmbientMixer {
  private sounds: Map<string, Sound> = new Map();

  addSound(key: string, src: string, defaultVolume = 50) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = defaultVolume / 100;

    this.sounds.set(key, {
      audio,
      isPlaying: false,
      targetVolume: defaultVolume
    });
  }

  play(key: string) {
    const sound = this.sounds.get(key);
    if (!sound || sound.isPlaying) return;

    this.fadeIn(sound.audio, sound.targetVolume / 100);
    sound.isPlaying = true;
  }

  stop(key: string) {
    const sound = this.sounds.get(key);
    if (!sound || !sound.isPlaying) return;

    this.fadeOut(sound.audio);
    sound.isPlaying = false;
  }

  setVolume(key: string, volume: number) {
    const sound = this.sounds.get(key);
    if (!sound) return;

    sound.targetVolume = volume;
    if (sound.isPlaying) {
      sound.audio.volume = volume / 100;
    }
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration = 300) {
    audio.volume = 0;
    audio.play();

    const startTime = performance.now();
    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = targetVolume * progress;

      if (progress < 1) requestAnimationFrame(fade);
    };

    requestAnimationFrame(fade);
  }

  private fadeOut(audio: HTMLAudioElement, duration = 300) {
    const startVolume = audio.volume;
    const startTime = performance.now();

    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    requestAnimationFrame(fade);
  }
}
```

---

## Unresolved Questions

None. All research objectives answered.

---

## Sources

- [HTMLAudioElement - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [HTML DOM Audio volume Property](https://www.w3schools.com/jsref/prop_audio_volume.asp)
- [Stop Using setInterval. Use requestAnimationFrame](https://blog.webdevsimplified.com/2021-12/request-animation-frame/)
- [Animating with javascript: from setInterval to requestAnimationFrame – Mozilla Hacks](https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/)
- [Seamless audio looping in html5 JavaScript - Kev's Site](https://www.kevssite.com/seamless-audio-looping/)
- [GitHub - Hivenfour/SeamlessLoop](https://github.com/Hivenfour/SeamlessLoop)
- [Using the Web Audio API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- [GainNode - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/GainNode)

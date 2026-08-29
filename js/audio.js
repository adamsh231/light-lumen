/**
 * Atelier Lumen — Click Audio Player (MP3 Asset with Web Audio API Zero-Latency Playback)
 */
import clickSoundUrl from './click-sound.mp3';

let audioCtx = null;
let clickBuffer = null;
let isLoadingBuffer = false;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Pre-load and decode audio buffer for instantaneous zero-latency clicking
async function loadClickBuffer() {
  if (clickBuffer || isLoadingBuffer) return clickBuffer;
  isLoadingBuffer = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    const response = await fetch(clickSoundUrl);
    const arrayBuffer = await response.arrayBuffer();
    clickBuffer = await ctx.decodeAudioData(arrayBuffer);
    return clickBuffer;
  } catch (err) {
    console.warn('Could not decode click sound buffer:', err);
    return null;
  } finally {
    isLoadingBuffer = false;
  }
}

// Preload on initial user gesture or page load
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    loadClickBuffer();
  }, { once: true });
}

export async function playSwitchSound(type = 'on') {
  if (typeof window === 'undefined') return;
  const store = window.AppStore;
  if (store && store.state && !store.state.soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) {
      const audio = new Audio(clickSoundUrl);
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    let buffer = clickBuffer;
    if (!buffer) {
      buffer = await loadClickBuffer();
    }

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.95, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(ctx.currentTime);
    } else {
      const audio = new Audio(clickSoundUrl);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  } catch (e) {
    try {
      const audio = new Audio(clickSoundUrl);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (_) {}
  }
}

export const AppAudio = {
  playSwitchSound
};

if (typeof window !== 'undefined') {
  window.AppAudio = AppAudio;
}

export default AppAudio;

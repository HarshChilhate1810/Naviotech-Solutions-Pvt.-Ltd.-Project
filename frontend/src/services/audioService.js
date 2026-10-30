// Real Physical Page Turn Audio Service
// Uses authentic recorded paper acoustics (/sounds/page-flip.mp3)
// Enhanced with Web Audio API for zero latency, dynamic pitch jitter (0.95x - 1.05x),
// and directional stereo spatial panning (Right -> Left on Next, Left -> Right on Prev).

let audioCtx = null;
let pageFlipBuffer = null;
let isLoadingBuffer = false;

// Fallback HTMLAudio elements pool for instant playback across all browser environments
const audioPool = [];
const POOL_SIZE = 4;
let poolIndex = 0;

const SOUND_URL = '/sounds/page-flip.mp3';

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Preload the authentic MP3 into an AudioBuffer
async function loadAudioBuffer() {
  if (pageFlipBuffer || isLoadingBuffer || typeof window === 'undefined') return;
  isLoadingBuffer = true;

  try {
    const ctx = getAudioContext();
    if (!ctx) {
      isLoadingBuffer = false;
      return;
    }

    const res = await fetch(SOUND_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    pageFlipBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.debug('Preloading audio buffer fallback:', err);
  } finally {
    isLoadingBuffer = false;
  }
}

// Initialize audio pool and start pre-fetch
if (typeof window !== 'undefined') {
  for (let i = 0; i < POOL_SIZE; i++) {
    const audio = new Audio(SOUND_URL);
    audio.preload = 'auto';
    audioPool.push(audio);
  }

  // Pre-load immediately
  loadAudioBuffer();

  // Auto-unlock audio and ensure buffer is loaded on first user interaction
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!pageFlipBuffer) {
      loadAudioBuffer();
    }
    // Also unlock HTMLAudio element pool
    if (audioPool.length > 0) {
      const silent = audioPool[0];
      silent.volume = 0;
      silent.play().then(() => {
        silent.pause();
        silent.currentTime = 0;
        silent.volume = 1;
      }).catch(() => {});
    }

    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Play authentic recorded physical page flip sound
 * @param {boolean} enabled - Whether sound is enabled
 * @param {'next'|'prev'} direction - Turning direction
 */
export function playPageTurnSound(enabled = true, direction = 'next') {
  if (!enabled) return;

  const ctx = getAudioContext();

  // Primary Path: Web Audio API with pre-decoded real sample buffer
  if (ctx && pageFlipBuffer) {
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const source = ctx.createBufferSource();
      source.buffer = pageFlipBuffer;

      // Realistic pitch and speed jitter: 0.95x to 1.05x (every turn sounds organic & unique)
      const pitchVariation = 0.95 + (Math.random() * 0.10);
      source.playbackRate.setValueAtTime(pitchVariation, now);

      // Natural tactile volume variation (0.85 to 1.0)
      const gainNode = ctx.createGain();
      const volumeVariation = 0.88 + (Math.random() * 0.12);
      gainNode.gain.setValueAtTime(volumeVariation, now);

      // Directional 3D Stereo Panning
      if (ctx.createStereoPanner) {
        try {
          const panner = ctx.createStereoPanner();
          // Next: paper sweeps right to left; Prev: paper sweeps left to right
          const startPan = direction === 'next' ? 0.35 : -0.35;
          const endPan = direction === 'next' ? -0.35 : 0.35;
          panner.pan.setValueAtTime(startPan, now);
          panner.pan.linearRampToValueAtTime(endPan, now + 0.45);

          source.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(ctx.destination);
        } catch {
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
        }
      } else {
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
      }

      source.start(now);
      return;
    } catch (e) {
      console.debug('WebAudio buffer play fallback to HTMLAudio:', e);
    }
  }

  // Secondary Fallback: HTMLAudioElement pool (real recorded sound)
  if (audioPool.length > 0) {
    try {
      const audio = audioPool[poolIndex];
      poolIndex = (poolIndex + 1) % audioPool.length;
      audio.currentTime = 0;
      audio.playbackRate = 0.96 + (Math.random() * 0.08);
      audio.volume = 0.9 + (Math.random() * 0.1);
      audio.play().catch(() => {});
      return;
    } catch (e) {
      console.debug('HTMLAudio pool playback note:', e);
    }
  }

  // Tertiary Fallback: Synthesized paper noise in case media fails completely
  playFallbackSyntheticPaper(ctx, direction);
}

// Fallback synthesizer in the unlikely event the MP3 is blocked or unreadable
function playFallbackSyntheticPaper(ctx, direction) {
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const duration = 0.35;
    const sampleRate = ctx.sampleRate;

    const frictionLen = Math.floor(sampleRate * duration);
    const frictionBuffer = ctx.createBuffer(1, frictionLen, sampleRate);
    const data = frictionBuffer.getChannelData(0);

    for (let i = 0; i < frictionLen; i++) {
      const t = i / frictionLen;
      const env = Math.sin(t * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.3;
    }

    const src = ctx.createBufferSource();
    src.buffer = frictionBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(direction === 'next' ? 2400 : 2100, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(now);
    src.stop(now + duration);
  } catch (err) {
    // silent fallback
  }
}

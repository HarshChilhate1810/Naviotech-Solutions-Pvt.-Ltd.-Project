// Web Audio API — Realistic Multi-Layer Physical Paper Page Turn Synthesizer
// Accurately models the physical acoustics of real paper turning:
// 1. Initial edge friction / thumb slide (crisp high-frequency paper grain friction)
// 2. Paper fiber flex & micro-snaps (scattered micro-transients)
// 3. Aerodynamic air displacement whoosh (low-mid resonant displacement with flutter modulation)
// 4. Soft landing / page settling impact onto the resting stack
// 5. Directional 3D Stereo Panning (Right -> Left on Next; Left -> Right on Prev)
// 6. Dynamic pitch, envelope, and duration jitter so every page turn sounds unique

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Auto-unlock audio on user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

export function playPageTurnSound(enabled = true, direction = 'next') {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Jitter duration slightly for organic feel: 0.35s to 0.44s
    const jitter = (Math.random() - 0.5) * 0.06;
    const duration = 0.38 + jitter;
    const sampleRate = ctx.sampleRate;

    // ─────────────────────────────────────────────────────────────
    // 3D Directional Stereo Panner
    // ─────────────────────────────────────────────────────────────
    let panner = null;
    if (ctx.createStereoPanner) {
      try {
        panner = ctx.createStereoPanner();
        const startPan = direction === 'next' ? 0.6 : -0.6;
        const endPan = direction === 'next' ? -0.6 : 0.6;
        panner.pan.setValueAtTime(startPan, now);
        panner.pan.linearRampToValueAtTime(endPan, now + duration * 0.85);
        panner.connect(ctx.destination);
      } catch {
        panner = null;
      }
    }
    const destination = panner || ctx.destination;

    // Master volume gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85 + Math.random() * 0.15, now);
    masterGain.connect(destination);

    // ─────────────────────────────────────────────────────────────
    // LAYER 1: Surface Friction & Paper Grain Rub (Shhh-krrr)
    // ─────────────────────────────────────────────────────────────
    const frictionLen = Math.floor(sampleRate * duration);
    const frictionBuffer = ctx.createBuffer(1, frictionLen, sampleRate);
    const frictionData = frictionBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < frictionLen; i++) {
      const t = i / frictionLen;
      const white = Math.random() * 2 - 1;
      // Pink noise approximation for warm organic paper grain
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      const pink = b0 + b1 + b2 + white * 0.5362;

      let env = 0;
      if (t < 0.15) {
        env = Math.sin((t / 0.15) * (Math.PI / 2));
      } else if (t < 0.65) {
        env = 1.0 - ((t - 0.15) / 0.5) * 0.35 + Math.sin(t * 80) * 0.08;
      } else {
        env = 0.65 * Math.pow(Math.max(0, 1 - (t - 0.65) / 0.35), 1.8);
      }
      frictionData[i] = pink * env * 0.42;
    }

    const frictionSrc = ctx.createBufferSource();
    frictionSrc.buffer = frictionBuffer;

    const frictionFilter = ctx.createBiquadFilter();
    frictionFilter.type = 'bandpass';
    const baseFreq = 2300 + (Math.random() - 0.5) * 400;
    frictionFilter.frequency.setValueAtTime(baseFreq, now);
    frictionFilter.frequency.exponentialRampToValueAtTime(850, now + duration * 0.85);
    frictionFilter.Q.setValueAtTime(1.6, now);

    const frictionGain = ctx.createGain();
    frictionGain.gain.setValueAtTime(0.001, now);
    frictionGain.gain.linearRampToValueAtTime(0.38, now + 0.03);
    frictionGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    frictionSrc.connect(frictionFilter);
    frictionFilter.connect(frictionGain);
    frictionGain.connect(masterGain);

    // ─────────────────────────────────────────────────────────────
    // LAYER 2: Aerodynamic Sheet Flex & Whoosh (Flutter displacement)
    // ─────────────────────────────────────────────────────────────
    const whooshLen = Math.floor(sampleRate * (duration * 0.85));
    const whooshBuffer = ctx.createBuffer(1, whooshLen, sampleRate);
    const whooshData = whooshBuffer.getChannelData(0);

    for (let i = 0; i < whooshLen; i++) {
      const t = i / whooshLen;
      const white = Math.random() * 2 - 1;
      const env = Math.pow(Math.sin(t * Math.PI), 1.5);
      const flutter = 1 + 0.22 * Math.sin(2 * Math.PI * 24 * t);
      whooshData[i] = white * env * flutter;
    }

    const whooshSrc = ctx.createBufferSource();
    whooshSrc.buffer = whooshBuffer;

    const whooshFilter = ctx.createBiquadFilter();
    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.setValueAtTime(400, now);
    whooshFilter.frequency.linearRampToValueAtTime(900, now + duration * 0.35);
    whooshFilter.frequency.exponentialRampToValueAtTime(200, now + duration * 0.85);
    whooshFilter.Q.setValueAtTime(2.0, now);

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.001, now);
    whooshGain.gain.linearRampToValueAtTime(0.32, now + 0.08);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);

    whooshSrc.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(masterGain);

    // ─────────────────────────────────────────────────────────────
    // LAYER 3: Fibre Snaps / Stiffness Release (Micro-crinkles)
    // ─────────────────────────────────────────────────────────────
    const numPops = 4 + Math.floor(Math.random() * 4);
    for (let p = 0; p < numPops; p++) {
      const popTime = now + 0.015 + p * 0.024 + Math.random() * 0.014;
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = 'triangle';
      const popFreq = 1600 + Math.random() * 1900;
      popOsc.frequency.setValueAtTime(popFreq, popTime);
      popOsc.frequency.exponentialRampToValueAtTime(380, popTime + 0.014);

      const popVol = 0.035 + Math.random() * 0.045;
      popGain.gain.setValueAtTime(popVol, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.014);

      popOsc.connect(popGain);
      popGain.connect(masterGain);

      popOsc.start(popTime);
      popOsc.stop(popTime + 0.016);
    }

    // ─────────────────────────────────────────────────────────────
    // LAYER 4: Soft Landing / Page Settle Impact (The "Thwip")
    // ─────────────────────────────────────────────────────────────
    const landTime = now + duration * 0.66;
    const landOsc = ctx.createOscillator();
    const landGain = ctx.createGain();

    landOsc.type = 'sine';
    landOsc.frequency.setValueAtTime(140, landTime);
    landOsc.frequency.exponentialRampToValueAtTime(45, landTime + 0.1);

    landGain.gain.setValueAtTime(0.001, landTime);
    landGain.gain.linearRampToValueAtTime(0.18, landTime + 0.016);
    landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.1);

    landOsc.connect(landGain);
    landGain.connect(masterGain);

    // High frequency landing rustle
    const landRustleLen = Math.floor(sampleRate * 0.09);
    const landRustleBuffer = ctx.createBuffer(1, landRustleLen, sampleRate);
    const landRustleData = landRustleBuffer.getChannelData(0);
    for (let i = 0; i < landRustleLen; i++) {
      const t = i / landRustleLen;
      landRustleData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 9);
    }
    const landRustleSrc = ctx.createBufferSource();
    landRustleSrc.buffer = landRustleBuffer;

    const landFilter = ctx.createBiquadFilter();
    landFilter.type = 'bandpass';
    landFilter.frequency.setValueAtTime(3400, landTime);
    landFilter.Q.setValueAtTime(1.4, landTime);

    const landRustleGain = ctx.createGain();
    landRustleGain.gain.setValueAtTime(0.14, landTime);
    landRustleGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.09);

    landRustleSrc.connect(landFilter);
    landFilter.connect(landRustleGain);
    landRustleGain.connect(masterGain);

    // Trigger main audio sources
    frictionSrc.start(now);
    whooshSrc.start(now + 0.02);
    landOsc.start(landTime);
    landRustleSrc.start(landTime);

    frictionSrc.stop(now + duration);
    whooshSrc.stop(now + duration);
    landOsc.stop(landTime + 0.11);
    landRustleSrc.stop(landTime + 0.1);
  } catch (err) {
    console.debug('Audio page turn note:', err);
  }
}

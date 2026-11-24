// Web Audio API pure programmatic sound synthesizer - zero external files required

let ringtoneInterval: NodeJS.Timeout | null = null;
let audioCtx: AudioContext | null = null;
const activeOscillators: OscillatorNode[] = [];
const activeGainNodes: GainNode[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playRingtone() {
  stopRingtone();

  const ringCycle = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Dual frequencies for classic gentle chime (440Hz + 480Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      activeOscillators.push(osc1, osc2);
      activeGainNodes.push(gainNode);

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.setValueAtTime(0.12, now + 1.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 1.25);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);

      osc1.onended = () => {
        const idx1 = activeOscillators.indexOf(osc1);
        if (idx1 !== -1) activeOscillators.splice(idx1, 1);
        const idx2 = activeOscillators.indexOf(osc2);
        if (idx2 !== -1) activeOscillators.splice(idx2, 1);
        const gIdx = activeGainNodes.indexOf(gainNode);
        if (gIdx !== -1) activeGainNodes.splice(gIdx, 1);
      };
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  };

  ringCycle();
  ringtoneInterval = setInterval(ringCycle, 2800);
}

export function stopRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }

  // Force-kill all active ringtone oscillators immediately
  while (activeOscillators.length > 0) {
    const osc = activeOscillators.pop();
    if (osc) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    }
  }

  while (activeGainNodes.length > 0) {
    const gain = activeGainNodes.pop();
    if (gain) {
      try {
        gain.gain.setValueAtTime(0, audioCtx ? audioCtx.currentTime : 0);
        gain.disconnect();
      } catch {
        // ignore
      }
    }
  }
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {
    console.warn('Notification chime error:', e);
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  } catch (e) {
    console.warn('Success chime error:', e);
  }
}

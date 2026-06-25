let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function note(
  ac: AudioContext, freq: number, startAt: number, duration: number,
  gain = 0.22, type: OscillatorType = "sine", attack = 0.03
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + startAt);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + startAt + attack);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + duration);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

function noiseClick(ac: AudioContext, startAt: number, duration = 0.06, gain = 0.04) {
  const bufLen = Math.floor(ac.sampleRate * duration);
  const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass"; filter.frequency.value = 1200; filter.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime + startAt);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + duration);
  src.connect(filter); filter.connect(g); g.connect(ac.destination);
  src.start(ac.currentTime + startAt);
  src.stop(ac.currentTime + startAt + duration + 0.01);
}

/** Login success — C E G C ascending */
export function playLoginSuccess() {
  try {
    const ac = getCtx();
    [261.6, 329.6, 392, 523.3].forEach((f, i) => note(ac, f, i * 0.13, 0.55, 0.17));
  } catch {}
}

/** Soft tap for nav / minor button */
export function playTap() {
  try {
    const ac = getCtx();
    note(ac, 880, 0, 0.10, 0.07);
    note(ac, 1108, 0.06, 0.12, 0.05);
  } catch {}
}

/** Satisfying press for primary action buttons */
export function playButtonPress() {
  try {
    const ac = getCtx();
    noiseClick(ac, 0, 0.05, 0.05);
    note(ac, 660, 0, 0.18, 0.12);
    note(ac, 880, 0.04, 0.20, 0.09);
  } catch {}
}

/** Page navigation — soft whoosh */
export function playNavSwipe() {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.15);
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.22);
  } catch {}
}

/** Form submit — rising whoosh */
export function playFormSubmit() {
  try {
    const ac = getCtx();
    noiseClick(ac, 0, 0.08, 0.03);
    note(ac, 523.3, 0.05, 0.3, 0.12);
    note(ac, 659.3, 0.12, 0.35, 0.10);
  } catch {}
}

/** Validation error — low double buzz */
export function playError() {
  try {
    const ac = getCtx();
    note(ac, 180, 0, 0.12, 0.18, "sawtooth");
    note(ac, 160, 0.16, 0.12, 0.14, "sawtooth");
  } catch {}
}

/** New alert notification — two-note ding-dong */
export function playNewAlert() {
  try {
    const ac = getCtx();
    note(ac, 880, 0, 0.4, 0.16);
    note(ac, 740, 0.22, 0.5, 0.14);
  } catch {}
}

/** Call button — brief rising phone tone */
export function playCallButton() {
  try {
    const ac = getCtx();
    [440, 480].forEach((f, i) => {
      note(ac, f, i * 0.08, 0.25, 0.12);
    });
  } catch {}
}

/** Nurse resolve action — satisfying conclusion */
export function playResolved() {
  try {
    const ac = getCtx();
    [392, 493.9, 587.3].forEach((f, i) => note(ac, f, i * 0.09, 0.50, 0.14));
  } catch {}
}

/** Green check-in result */
export function playGreenResult() {
  try {
    const ac = getCtx();
    [523.3, 659.3, 784, 1046.5].forEach((f, i) => note(ac, f, i * 0.10, 0.55, 0.15));
  } catch {}
}

/** Amber caution result */
export function playAmberResult() {
  try {
    const ac = getCtx();
    note(ac, 440, 0, 0.60, 0.16);
    note(ac, 554.4, 0.18, 0.55, 0.13);
    note(ac, 440, 0.38, 0.50, 0.10);
  } catch {}
}

/** Red urgent result — gentle descending */
export function playRedResult() {
  try {
    const ac = getCtx();
    [329.6, 293.7, 261.6].forEach((f, i) => note(ac, f, i * 0.22, 0.65, 0.19, "triangle"));
  } catch {}
}

/** EPDS complete — soft lullaby */
export function playEpdsComplete() {
  try {
    const ac = getCtx();
    [523.3, 659.3, 784, 659.3, 523.3].forEach((f, i) => note(ac, f, i * 0.14, 0.45, 0.12));
  } catch {}
}

/** EPDS answer selected — tiny confirmation note */
export function playEpdsAnswer() {
  try {
    const ac = getCtx();
    note(ac, 740, 0, 0.18, 0.08);
  } catch {}
}

/** Dashboard stat loaded — pleasant ding */
export function playStatLoad() {
  try {
    const ac = getCtx();
    note(ac, 1046.5, 0, 0.30, 0.08);
  } catch {}
}

/** Generic success */
export function playSuccess() {
  try {
    const ac = getCtx();
    note(ac, 587.3, 0, 0.35, 0.13);
    note(ac, 784, 0.12, 0.40, 0.11);
  } catch {}
}

/** Dispatch based on risk level */
export function playForRisk(riskLevel: string | null | undefined) {
  if (riskLevel === "high") playRedResult();
  else if (riskLevel === "mid") playAmberResult();
  else playGreenResult();
}

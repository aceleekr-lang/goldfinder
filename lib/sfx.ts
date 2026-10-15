"use client";
// 효과음·진동 (2026-10-15) — 음원 파일 없이 Web Audio로 합성 (데이터 0, 즉시 재생)
//   소리: 기본 켜짐, 화면의 🔈 버튼으로 끄면 그 폰에 기억 / 진동: 기본 켜짐 (지원 폰만)
//   브라우저 정책상 소리는 사용자가 화면을 터치한 뒤에만 난다 → 모든 효과음은 터치에서 시작
let ctx: AudioContext | null = null;
const MUTE_KEY = "gf_mute";
export function isMuted(): boolean { try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; } }
export function setMuted(m: boolean) { try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch {} }

function ac(): AudioContext | null {
  if (typeof window === "undefined" || isMuted()) return null;
  try {
    if (!ctx) { const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
export function vibrate(p: number | number[]) { try { if (navigator.vibrate) navigator.vibrate(p); } catch {} }

// ---- 기본 소리 재료 ----
function tone(c: AudioContext, freq: number, t0: number, dur: number, vol = 0.18, type: OscillatorType = "sine", glideTo?: number) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
}
function bell(c: AudioContext, freq: number, t0: number, dur = 1.2, vol = 0.16) {
  tone(c, freq, t0, dur, vol, "sine"); tone(c, freq * 2.01, t0, dur * 0.6, vol * 0.35, "sine"); tone(c, freq * 3.02, t0, dur * 0.35, vol * 0.15, "triangle");
}
function noise(c: AudioContext, t0: number, dur: number, vol: number, filter: BiquadFilterType, f0: number, f1?: number, q = 1) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur)); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = filter; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.03, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(c.destination); s.start(t0); s.stop(t0 + dur + 0.02);
}
// 국악풍 5음(황·태·중·임·남 근사) — 별 소리에 쓰는 음계
const PENTA = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66, 1396.91, 1567.98];

export const sfx = {
  /** 대문 노크 (나무 문 두드림) */
  knock() { const c = ac(); if (!c) return; const t = c.currentTime; tone(c, 140, t, 0.16, 0.5, "sine", 70); noise(c, t, 0.07, 0.35, "bandpass", 900, 500, 2); vibrate(35); },
  /** 문이 열림 — 묵직한 나무 삐걱임 + 바람 + 빛의 화음 */
  gateOpen() { const c = ac(); if (!c) return; const t = c.currentTime;
    tone(c, 95, t, 0.9, 0.12, "sawtooth", 70); noise(c, t, 1.4, 0.18, "lowpass", 400, 2400, 0.7);
    [0, 2, 4, 5].forEach((k, i) => bell(c, PENTA[k], t + 0.55 + i * 0.12, 1.6, 0.11)); },
  /** 잠든 별을 깨움 — 반짝 상승음 */
  wake() { const c = ac(); if (!c) return; const t = c.currentTime; tone(c, 400, t, 0.35, 0.14, "triangle", 1600); bell(c, PENTA[5], t + 0.18, 1.0, 0.14); vibrate([20, 40, 60]); },
  /** 색별 연출음 */
  motif(color: string) { const c = ac(); if (!c) return; const t = c.currentTime + 0.05;
    if (color === "yellow") {          // 붓이 지나가는 소리 + 금빛 종
      noise(c, t, 0.55, 0.22, "bandpass", 1200, 4200, 0.8); bell(c, PENTA[2], t + 0.45, 1.3); bell(c, PENTA[6], t + 0.6, 1.1, 0.1);
    } else if (color === "red") {      // SP 음반 잡음 + 가락
      for (let i = 0; i < 14; i++) noise(c, t + Math.random() * 1.2, 0.015, 0.12, "highpass", 3000);
      [0, 1, 3, 2, 4].forEach((k, i) => tone(c, PENTA[k], t + 0.15 + i * 0.17, 0.35, 0.12, "triangle"));
    } else if (color === "white") {    // 구름 걷히는 바람 + 낮고 맑은 달 종
      noise(c, t, 1.0, 0.12, "lowpass", 300, 1200, 0.5); bell(c, PENTA[0] / 2, t + 0.5, 2.0, 0.18); bell(c, PENTA[4], t + 0.75, 1.6, 0.09);
    } else if (color === "teal") {     // 얼음이 맺히는 맑은 소리 + 물결
      for (let i = 0; i < 7; i++) tone(c, 2000 + Math.random() * 2600, t + i * 0.09, 0.25, 0.06, "sine");
      tone(c, 300, t + 0.4, 0.8, 0.08, "sine", 180); bell(c, PENTA[7], t + 0.7, 1.2, 0.09);
    } else {                            // 나비 날갯짓 + 소원 종
      for (let i = 0; i < 6; i++) noise(c, t + i * 0.13, 0.08, 0.1, "bandpass", 700, 1100, 1.5);
      [3, 5, 7].forEach((k, i) => bell(c, PENTA[k], t + 0.5 + i * 0.14, 1.2, 0.1));
    }
    vibrate(color === "red" ? [30, 60, 30, 60, 30] : [40, 80, 40]); },
  /** 정답 — 별이 날아가 박힘 */
  correct() { const c = ac(); if (!c) return; const t = c.currentTime; tone(c, 600, t, 0.4, 0.1, "triangle", 1800); bell(c, PENTA[4], t + 0.32, 0.9); bell(c, PENTA[7], t + 0.46, 1.1); vibrate([30, 50, 120]); },
  /** 오답 — 별이 다시 잠듦 (아프지 않게) */
  wrong() { const c = ac(); if (!c) return; const t = c.currentTime; tone(c, 520, t, 0.5, 0.1, "sine", 300); tone(c, 390, t + 0.25, 0.6, 0.08, "sine", 260); vibrate(80); },
  /** 이미 깨운 색 — 윙크 */
  wink() { const c = ac(); if (!c) return; const t = c.currentTime; tone(c, 900, t, 0.12, 0.08, "sine"); tone(c, 1200, t + 0.1, 0.18, 0.08, "sine"); },
  /** 별자리 한 점이 켜질 때 (i번째) */
  starOn(i: number) { const c = ac(); if (!c) return; bell(c, PENTA[Math.min(i + 2, PENTA.length - 1)], c.currentTime, 1.2, 0.13); vibrate(25); },
  /** 별자리 완성 — 화음 + 뽑기권 */
  constellation() { const c = ac(); if (!c) return; const t = c.currentTime; [0, 2, 4, 5, 7].forEach((k, i) => bell(c, PENTA[k], t + i * 0.08, 2.2, 0.1)); noise(c, t + 0.5, 0.6, 0.08, "highpass", 5000); vibrate([60, 60, 60, 60, 200]); },
  /** 버튼 톡 */
  tick() { const c = ac(); if (!c) return; tone(c, 1500, c.currentTime, 0.05, 0.05, "sine"); },
};

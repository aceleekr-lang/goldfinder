"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FX_CSS } from "./fxCss";
import SoundToggle from "./SoundToggle";
import { sfx } from "@/lib/sfx";
import { FX } from "@/lib/fxAssets";

// 「별빛정원의 문」 — 예약번호 확인 직후. "○○님, 문을 두드려 보세요" → 똑! 똑! → 문이 열리며 빛과 별가루 (2026-10-15)
export function Twinkles({ n = 46 }: { n?: number }) {
  const dots = useMemo(() => Array.from({ length: n }, () => ({ l: Math.random() * 100, t: Math.random() * 70, d: Math.random() * 2.4, s: Math.random() < 0.2 ? 3 : 2 })), [n]);
  return <div className="gf-twinkles" aria-hidden>{dots.map((p, i) => <i key={i} style={{ left: `${p.l}%`, top: `${p.t}%`, animationDelay: `${p.d}s`, width: p.s, height: p.s }} />)}</div>;
}

// 대문 한 짝 (그림이 없을 때 코드로 그림) — 붉은 단청 문틀, 나무결 판재, 금빛 장식못, 문고리
function Leaf({ side }: { side: "l" | "r" }) {
  const studs = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) studs.push(<circle key={`${r}-${c}`} cx={30 + c * 40} cy={70 + r * 70} r={5.5} fill="url(#gf-brass)" stroke="#5a3b12" strokeWidth={1} />);
  return (
    <svg viewBox="0 0 150 480" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={`gf-wood-${side}`} x1="0" x2="1">
          <stop offset="0" stopColor={side === "l" ? "#5b2c1a" : "#6e3720"} /><stop offset=".5" stopColor="#7d4126" /><stop offset="1" stopColor={side === "l" ? "#6e3720" : "#5b2c1a"} />
        </linearGradient>
        <radialGradient id="gf-brass" cx=".35" cy=".35"><stop offset="0" stopColor="#fff2b8" /><stop offset=".5" stopColor="#d8a43a" /><stop offset="1" stopColor="#8a5f17" /></radialGradient>
      </defs>
      <rect x="0" y="0" width="150" height="480" fill={`url(#gf-wood-${side})`} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={i * 30 + 15} y1="0" x2={i * 30 + 15} y2="480" stroke="#4a2414" strokeWidth="1" opacity=".35" />)}
      <rect x="6" y="6" width="138" height="468" fill="none" stroke="#a8321f" strokeWidth="8" />
      <rect x="16" y="150" width="118" height="10" fill="#3d1d10" opacity=".6" /><rect x="16" y="330" width="118" height="10" fill="#3d1d10" opacity=".6" />
      {studs}
      <g transform={`translate(${side === "l" ? 128 : 22},250)`}>
        <circle r="16" fill="none" stroke="url(#gf-brass)" strokeWidth="5" /><circle r="7" fill="url(#gf-brass)" />
      </g>
    </svg>
  );
}

export default function GateIntro({ name, onDone }: { name: string; onDone: () => void }) {
  const [knocks, setKnocks] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; setLeaving(true); setTimeout(onDone, 450); };
  useEffect(() => {
    if (!open) return;
    const a = setTimeout(() => setWelcome(true), 1500), b = setTimeout(finish, 4200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [open]);   // eslint-disable-line
  const dust = useMemo(() => Array.from({ length: 34 }, () => ({ l: 30 + Math.random() * 40, dx: `${(Math.random() - 0.5) * 70}vw`, d: Math.random() * 0.9, s: 3 + Math.random() * 6 })), []);

  const tap = (e: React.PointerEvent) => {
    if (open) { if (welcome) finish(); return; }
    const n = knocks + 1; setKnocks(n);
    setBubbles((b) => [...b.slice(-3), { id: Date.now(), x: e.clientX, y: e.clientY }]);
    setShakeKey((k) => k + 1); sfx.knock();
    if (n >= 2) setTimeout(() => { setOpen(true); sfx.gateOpen(); }, 380);
  };
  const W = "min(78vw, 360px)", H = "min(62vh, 520px)";
  const half = (side: "l" | "r") => FX.gate
    ? <div style={{ width: "100%", height: "100%", backgroundImage: `url(${FX.gate})`, backgroundSize: "200% 100%", backgroundPosition: side === "l" ? "left center" : "right center" }} />
    : <Leaf side={side} />;

  return (
    <div className={`gf-stage ${leaving ? "gf-out" : ""}`} onPointerDown={tap} role="dialog" aria-label="별빛정원의 문">
      <style>{FX_CSS}</style>
      <Twinkles />
      <button className="gf-skip" onPointerDown={(e) => { e.stopPropagation(); finish(); }}>건너뛰기</button>
      <SoundToggle />
      <div className="gf-hint gf-fadein" style={{ top: "7vh", fontSize: 24, padding: "0 20px" }}>{name ? `${name}님,` : ""}<br />{open ? "별빛정원의 문이 열렸어요" : "별빛정원의 문을 두드려 보세요"}</div>

      {/* 지붕·현판 (코드 그림) */}
      <svg viewBox="0 0 400 90" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "calc(19vh - 6px)", width: "min(96vw, 440px)" }} aria-hidden>
        <path d="M10 70 Q200 10 390 70 L370 78 Q200 30 30 78 Z" fill="#1d1a24" />
        <path d="M30 78 Q200 30 370 78" stroke="#a8321f" strokeWidth="5" fill="none" />
        {Array.from({ length: 19 }, (_, i) => <path key={i} d={`M${30 + i * 18.9} ${78 - Math.sin((i / 18) * Math.PI) * 26} v8`} stroke="#3a3346" strokeWidth="9" strokeLinecap="round" />)}
      </svg>
      <div style={{ position: "absolute", left: "50%", top: "calc(19vh + 46px)", transform: "translateX(-50%)", zIndex: 3, background: "linear-gradient(#3b2416, #26160d)", border: "3px solid #b8862a",
        borderRadius: 4, padding: "6px 18px", color: "#F2C14E", fontWeight: 900, fontSize: 18, letterSpacing: 4, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.5)" }}>영남루 별빛정원</div>

      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "calc(19vh + 70px)", width: W, height: H }}>
        <div key={shakeKey} className={`gf-gate ${shakeKey && !open ? "gf-shake" : ""} ${open ? "gf-open" : ""}`}>
          <div className="gf-light" />
          {!open ? <div className="gf-seam" /> : null}
          <div className="gf-leaf l">{half("l")}</div>
          <div className="gf-leaf r">{half("r")}</div>
        </div>
      </div>
      {open ? dust.map((p, i) => <span key={i} className="gf-dust" style={{ left: `${p.l}%`, width: p.s, height: p.s, animationDelay: `${p.d}s`, ["--dx" as string]: p.dx }} />) : null}

      {bubbles.map((b, i) => <div key={b.id} className="gf-knock" style={{ left: b.x, top: b.y }}>{i % 2 ? "똑!" : "똑!"}</div>)}
      <div className="gf-hint" style={{ bottom: "6vh", fontSize: 20 }}>
        {!open ? <span className="gf-pulse" style={{ display: "inline-block" }}>👆 문을 두 번 두드려 보세요 {knocks ? `(${knocks}/2)` : ""}</span>
          : welcome ? <span className="gf-fadein" style={{ display: "inline-block", color: "#F2C14E" }}>흩어진 별을 찾으러 가요 ✦<br /><span style={{ fontSize: 14, opacity: .8 }}>화면을 누르면 계속</span></span> : null}
      </div>
    </div>
  );
}

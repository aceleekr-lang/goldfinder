"use client";
import { useEffect, useRef, useState } from "react";
import { FX_CSS } from "./fxCss";
import SoundToggle from "./SoundToggle";
import { Twinkles } from "./GateIntro";
import { sfx } from "@/lib/sfx";
import { FX } from "@/lib/fxAssets";
import { COLOR_HEX, COLOR_WORD } from "@/lib/copy";

// 「잠든 별 깨우기」 — 별 표식 태그 직후. 잠든 은빛 별 → 톡 → 그 색으로 깨어나며 색별 연출 (2026-10-15)
//   영남루별(노랑)=붓이 현판에 금빛 글씨 · 아리랑별(빨강)=SP 음반과 가락 · 달빛별(흰색)=구름 걷히고 보름달
//   밀양별(파랑)=얼음 결정과 물결 · 소원별(주황)=태극나비 날갯짓
export const STAR_PATH = "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z";
const LINE: Record<string, string> = {
  yellow: "일곱 살 아이의 붓끝처럼, 별이 금빛으로 깨어나요",
  red: "백 년 전 음반이 돌며, 가락이 별이 되어요",
  white: "구름이 걷히고, 팔백 년 전의 달이 떠올라요",
  teal: "한여름 얼음골처럼, 맑은 결정이 피어나요",
  orange: "광복의 날 나비가 날아와, 소원을 들어줄게요",
};

// 색별 장면: 그림이 있으면 그림 고리(가운데 빈 원에 별이 들어감)가 피어나며 천천히 돌고, 없으면 코드 그림
function Motif({ color }: { color: string }) {
  const src = FX.motif[color];
  if (!src) return <MotifAnim color={color} />;
  return (
    <div className="gf-pop" style={{ position: "absolute", inset: "-65%", pointerEvents: "none" }}>
      <img src={src} alt="" className={color === "red" ? "gf-spin-slow" : "gf-sway"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>);
}
function MotifAnim({ color }: { color: string }) {
  const hex = COLOR_HEX[color];
  if (color === "yellow") return (   // 현판 틀 + 붓 획이 그려짐
    <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: "-30%", width: "160%", height: "160%" }} aria-hidden>
      <rect x="40" y="96" width="220" height="108" rx="6" fill="rgba(40,24,12,.55)" stroke="#b8862a" strokeWidth="4" className="gf-pop" />
      <path d="M62 150 C 90 110, 120 190, 150 140 S 210 120, 238 160" stroke={hex} strokeWidth="11" strokeLinecap="round" fill="none" className="gf-draw" style={{ ["--len" as string]: 260, ["--dur" as string]: "1.1s" }} />
      <path d="M95 118 L 112 182 M 186 118 L 200 180" stroke="#fff2b8" strokeWidth="7" strokeLinecap="round" fill="none" className="gf-draw" style={{ ["--len" as string]: 70, ["--dur" as string]: ".5s", ["--delay" as string]: ".9s" }} />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={60 + i * 36} cy={100 + (i % 2) * 100} r="3" fill="#fff6d6" className="gf-note" style={{ ["--dx" as string]: `${(i - 2.5) * 10}px`, ["--delay" as string]: `${0.8 + i * 0.1}s` }} />)}
    </svg>);
  if (color === "red") return (      // 돌아가는 SP 음반 + 음표가 별로
    <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: "-30%", width: "160%", height: "160%" }} aria-hidden>
      <g className="gf-pop"><g className="gf-spin">
        <circle cx="150" cy="150" r="118" fill="#151515" />
        {[100, 88, 76, 64].map((r) => <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#333" strokeWidth="2" />)}
        <circle cx="150" cy="150" r="40" fill={hex} /><circle cx="150" cy="150" r="5" fill="#111" />
        <path d="M150 112 a38 38 0 0 1 30 14" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" />
      </g></g>
      {["♪", "♫", "♪", "♬", "♪"].map((n, i) => <text key={i} x={70 + i * 40} y={250} fontSize="30" fill={i % 2 ? "#fff6d6" : hex} className="gf-note" style={{ ["--dx" as string]: `${(i - 2) * 18}px`, ["--delay" as string]: `${0.4 + i * 0.18}s` }}>{n}</text>)}
    </svg>);
  if (color === "white") return (    // 구름이 갈라지며 보름달
    <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: "-35%", width: "170%", height: "170%" }} aria-hidden>
      <defs><radialGradient id="gf-moon" cx=".4" cy=".4"><stop offset="0" stopColor="#ffffff" /><stop offset=".7" stopColor="#F5F1E6" /><stop offset="1" stopColor="#d9d3c2" /></radialGradient></defs>
      <circle cx="150" cy="105" r="70" fill="rgba(245,241,230,.18)" className="gf-moonrise" />
      <circle cx="150" cy="105" r="46" fill="url(#gf-moon)" className="gf-moonrise" />
      <g className="gf-cloudL"><ellipse cx="110" cy="120" rx="70" ry="24" fill="#8f9ab8" opacity=".9" /><ellipse cx="80" cy="108" rx="40" ry="20" fill="#a5afc9" /></g>
      <g className="gf-cloudR"><ellipse cx="190" cy="118" rx="70" ry="24" fill="#8f9ab8" opacity=".9" /><ellipse cx="222" cy="104" rx="40" ry="20" fill="#a5afc9" /></g>
    </svg>);
  if (color === "teal") return (     // 얼음 결정이 자라고 물결이 퍼짐
    <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: "-30%", width: "160%", height: "160%" }} aria-hidden>
      {[0, 0.35, 0.7].map((d) => <circle key={d} cx="150" cy="150" r="60" fill="none" stroke={hex} strokeWidth="4" className="gf-ripple" style={{ ["--delay" as string]: `${d}s` }} />)}
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a} 150 150)`}>
          <path d="M150 150 V40 M150 80 l-18 -18 M150 80 l18 -18 M150 105 l-12 -12 M150 105 l12 -12" stroke="#d9ecff" strokeWidth="5" strokeLinecap="round" fill="none"
            className="gf-draw" style={{ ["--len" as string]: 170, ["--dur" as string]: ".9s", ["--delay" as string]: ".25s" }} />
        </g>))}
    </svg>);
  return (                            // 소원별: 태극 날개 나비가 곡선을 따라 날아옴
    <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: "-30%", width: "160%", height: "160%", overflow: "visible" }} aria-hidden>
      <g className="gf-fly" style={{ offsetPath: "path('M-40 260 C 40 120, 120 300, 150 150 S 260 40, 330 90')" } as React.CSSProperties}>
        <g transform="scale(2.1) translate(-30,-26)">
          <g className="gf-flap"><path d="M30 26 C 6 0, -10 18, 8 34 C -6 50, 18 58, 30 30" fill="#E05A4E" stroke="#fff" strokeWidth="1.5" /><circle cx="14" cy="22" r="7" fill="#2F6FE4" />
            <path d="M30 26 C 54 0, 70 18, 52 34 C 66 50, 42 58, 30 30" fill="#2F6FE4" stroke="#fff" strokeWidth="1.5" /><circle cx="46" cy="22" r="7" fill="#E05A4E" /></g>
          <rect x="28" y="16" width="4" height="22" rx="2" fill="#2b1a10" />
        </g>
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={40 + i * 36} cy={200 - (i % 3) * 40} r="4" fill={hex} className="gf-note" style={{ ["--dx" as string]: "0px", ["--delay" as string]: `${0.3 + i * 0.2}s` }} />)}
    </svg>);
}

export default function StarWake({ color, name, onDone }: { color: string; name: string; onDone: () => void }) {
  const [stage, setStage] = useState<"sleep" | "wake">("sleep");
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const hex = COLOR_HEX[color] ?? "#F2C14E";
  const finish = () => { if (done.current) return; done.current = true; setLeaving(true); setTimeout(onDone, 420); };
  useEffect(() => {
    if (stage !== "wake") return;
    const a = setTimeout(() => sfx.motif(color), 450), b = setTimeout(finish, 3300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [stage]);   // eslint-disable-line
  const tap = () => { if (stage === "sleep") { setStage("wake"); sfx.wake(); } else finish(); };
  const size = "min(46vw, 210px)";
  return (
    <div className={`gf-stage ${leaving ? "gf-out" : ""}`} onPointerDown={tap} role="dialog" aria-label={`${name} 깨우기`} style={{ ["--c" as string]: hex }}>
      <style>{FX_CSS}</style>
      {FX.sky ? <div className="gf-sky" style={{ backgroundImage: `url(${FX.sky})` }} /> : null}
      <Twinkles />
      <SoundToggle />
      <div className="gf-hint gf-fadein" style={{ top: "11vh", fontSize: 26 }}>
        {stage === "sleep" ? <>{name}이<br />잠들어 있어요</> : <span style={{ color: color === "white" ? "#fff" : hex }}>{name}이 깨어났어요!</span>}
        <div style={{ fontSize: 14, fontWeight: 600, opacity: .8, marginTop: 6 }}>{COLOR_WORD[color]} 별</div>
      </div>
      {FX.motif[color] && stage === "sleep" ? <img src={FX.motif[color]!} alt="" style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} /> : null}{/* 미리 불러 두기 */}
      <div style={{ position: "absolute", left: "50%", top: "47%", width: size, height: size, transform: "translate(-50%,-50%)" }}>
        {stage === "wake" ? <Motif color={color} /> : null}
        {stage === "wake" ? (
          <svg viewBox="0 0 200 200" className="gf-rays" style={{ position: "absolute", inset: "-40%", width: "180%", height: "180%" }} aria-hidden>
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x="98" y="2" width="4" height="40" rx="2" fill={hex} transform={`rotate(${i * 22.5} 100 100)`} opacity=".8" />)}
          </svg>) : null}
        <div className={stage === "sleep" ? "gf-breath" : "gf-wakejolt"} style={{ width: "100%", height: "100%", position: "relative" }}>
          {stage === "sleep" && FX.starSleep
            ? <img src={FX.starSleep} alt="잠든 별" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : (
              <svg viewBox="0 0 24 24" style={{ width: "100%", height: "100%", overflow: "visible" }} className={stage === "wake" ? "gf-glow" : undefined}>
                <defs><radialGradient id="gf-sleep" cx=".4" cy=".35"><stop offset="0" stopColor="#e9edf6" /><stop offset="1" stopColor="#8d96ad" /></radialGradient></defs>
                <path d={STAR_PATH} fill={stage === "sleep" ? "url(#gf-sleep)" : hex} stroke={stage === "sleep" ? "#c9cfdf" : "#fff"} strokeWidth=".35"
                  style={{ transition: "fill .5s ease" }} strokeLinejoin="round" />
                {stage === "sleep" ? <path d="M9.2 11.6 q1 .8 2 0 M12.8 11.6 q1 .8 2 0" stroke="#5d6680" strokeWidth=".45" fill="none" strokeLinecap="round" /> : null}
              </svg>)}
          {stage === "sleep" ? [0, 0.8, 1.6].map((d, i) => <span key={i} className="gf-zzz" style={{ right: "-6%", top: "6%", fontSize: 18 + i * 6, animationDelay: `${d}s` }}>z</span>) : null}
        </div>
      </div>
      <div className="gf-hint" style={{ bottom: "8vh", fontSize: 19, padding: "0 24px" }}>
        {stage === "sleep" ? <span className="gf-pulse" style={{ display: "inline-block" }}>👆 별을 톡 건드려 깨워 보세요</span>
          : <span className="gf-fadein" style={{ display: "inline-block", fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{LINE[color]}<br /><span style={{ fontSize: 13, opacity: .7 }}>화면을 누르면 이야기로</span></span>}
      </div>
    </div>
  );
}

// 정답 — 깨어난 별이 하늘(별자리 칸)로 날아감
export function FlyStar({ color }: { color: string }) {
  const hex = COLOR_HEX[color] ?? "#F2C14E";
  return (
    <div className="gf-flystar" aria-hidden>
      <style>{FX_CSS}</style>
      <svg viewBox="0 0 24 24" width={120} height={120} style={{ filter: `drop-shadow(0 0 16px ${hex})`, overflow: "visible" }}><path d={STAR_PATH} fill={hex} stroke="#fff" strokeWidth=".4" /></svg>
    </div>
  );
}

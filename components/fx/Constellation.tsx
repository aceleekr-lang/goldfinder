"use client";
import { useEffect, useRef, useState } from "react";
import { FX_CSS } from "./fxCss";
import SoundToggle from "./SoundToggle";
import { Twinkles, } from "./GateIntro";
import { STAR_PATH } from "./StarWake";
import { sfx } from "@/lib/sfx";
import { FX } from "@/lib/fxAssets";
import { COLOR_HEX, COLOR_NAME, COLOR_ORDER } from "@/lib/copy";

// 「별자리 완성」 — 출구 표식. 깨운 별이 밤하늘에 하나씩 켜지고 금빛 선으로 이어져 별자리 → 뽑기권 리본 (2026-10-15)
//   미완성이면 깨운 별만 켜지고 빈자리는 점선 — 행운부적 안내
const PTS: [number, number][] = [[60, 250], [130, 150], [205, 205], [270, 95], [330, 175]];   // 영남루별→소원별 순

export default function Constellation({ stars, complete, onDone }: { stars: Record<string, string>; complete: boolean; onDone: () => void }) {
  const [lit, setLit] = useState(-1);
  const [joined, setJoined] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; setLeaving(true); setTimeout(onDone, 420); };
  const won = COLOR_ORDER.map((c) => stars?.[c] === "won");
  const n = won.filter(Boolean).length;
  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    COLOR_ORDER.forEach((_, i) => ts.push(setTimeout(() => { setLit(i); if (won[i]) sfx.starOn(i); }, 500 + i * 450)));
    ts.push(setTimeout(() => { setJoined(true); if (complete) sfx.constellation(); }, 500 + 5 * 450 + 150));
    ts.push(setTimeout(finish, complete ? 6200 : 4600));
    return () => ts.forEach(clearTimeout);
  }, []);   // eslint-disable-line
  const linePts = PTS.filter((_, i) => won[i]).map((p) => p.join(",")).join(" ");
  return (
    <div className={`gf-stage ${leaving ? "gf-out" : ""}`} onPointerDown={() => { if (joined) finish(); }} role="dialog" aria-label="별자리">
      <style>{FX_CSS}</style>
      {FX.sky ? <div className="gf-sky" style={{ backgroundImage: `url(${FX.sky})` }} /> : null}
      <Twinkles n={70} />
      <SoundToggle />
      <div className="gf-hint gf-fadein" style={{ top: "9vh", fontSize: 26 }}>
        {joined ? (complete ? <span style={{ color: "#F2C14E" }}>별자리 완성!</span> : <>{n}개의 별을 깨웠어요</>) : "오늘 깨운 별들이 모여요…"}
      </div>
      <svg viewBox="0 0 390 330" style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%)", width: "min(96vw, 460px)", overflow: "visible" }}>
        {joined && n > 1 ? <polyline points={linePts} fill="none" stroke="#F2C14E" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity=".9"
          className="gf-draw" style={{ ["--len" as string]: 900, ["--dur" as string]: "1.2s", filter: "drop-shadow(0 0 6px #F2C14E)" }} /> : null}
        {PTS.map(([x, y], i) => {
          const c = COLOR_ORDER[i], on = lit >= i && won[i], hex = COLOR_HEX[c];
          return (
            <g key={c}>
              {won[i] ? (
                <g transform={`translate(${x - 26},${y - 26})`} opacity={on ? 1 : 0.15} style={{ transition: "opacity .4s" }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" overflow="visible" className={on ? "gf-pop" : undefined}>
                    <path d={STAR_PATH} fill={hex} stroke="#fff" strokeWidth=".4" style={{ filter: on ? `drop-shadow(0 0 8px ${hex})` : undefined }} /></svg>
                </g>) : (
                <circle cx={x} cy={y} r="20" fill="none" stroke="rgba(245,241,230,.45)" strokeWidth="2" strokeDasharray="5 5" opacity={lit >= i ? 1 : 0} style={{ transition: "opacity .4s" }} />)}
              <text x={x} y={y + 44} textAnchor="middle" fontSize="14" fill={won[i] ? "#F5F1E6" : "rgba(245,241,230,.45)"} opacity={lit >= i ? 1 : 0} style={{ transition: "opacity .4s" }}>{COLOR_NAME[c]}</text>
            </g>);
        })}
      </svg>
      {joined && complete ? (
        <div style={{ position: "absolute", left: "50%", top: "62%", transform: "translateX(-50%)" }}>
          <div className="gf-ribbon"><div className="gf-swing" style={{ background: "linear-gradient(135deg,#fff6d6,#F2C14E 40%,#d99a2b)", color: "#3a2306", borderRadius: 12,
            padding: "14px 28px", fontWeight: 900, fontSize: 24, boxShadow: "0 8px 26px rgba(242,193,78,.55)", border: "3px dashed #8a5f17", whiteSpace: "nowrap" }}>🎟 뽑기권 도착!</div></div>
        </div>) : null}
      <div className="gf-hint" style={{ bottom: "7vh", fontSize: 16, padding: "0 24px" }}>
        {joined ? <span className="gf-fadein" style={{ display: "inline-block" }}>{complete ? "경품 수령소에서 뽑기를 해 보세요" : "출구 안내소에서 굿바비 행운부적을 받아 가세요"}<br /><span style={{ fontSize: 13, opacity: .7 }}>화면을 누르면 계속</span></span> : null}
      </div>
    </div>
  );
}

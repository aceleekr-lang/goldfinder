"use client";
import { useEffect, useRef, useState } from "react";
import { FX_CSS } from "./fxCss";
import SoundToggle from "./SoundToggle";
import { Twinkles } from "./GateIntro";
import { STAR_PATH } from "./StarWake";
import { sfx } from "@/lib/sfx";
import { FX } from "@/lib/fxAssets";
import { COLOR_HEX, COLOR_NAME, COLOR_ORDER } from "@/lib/copy";

// 「별이 떨어진 밤」 — 첫 링크(홈) 진입 연출 (2026-10-15)
//   밤하늘 → 다섯 빛깔 별똥별이 영남루 위로 흩어져 내려앉음 → 제목 → 화면 누르면 종소리와 함께 홈으로
//   링크(홈)를 열 때마다 나옴(2026-10-15 사용자 결정). 건너뛰기 가능. 소리는 브라우저 정책상 첫 터치 이후에만 남
// 별이 내려앉는 자리 (화면 % 기준) — 정원 위에 흩어진 느낌
const LAND: [number, number][] = [[18, 58], [36, 66], [52, 56], [68, 67], [84, 59]];

export default function HomeIntro() {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    setShow(true);
    const a = setTimeout(() => setTitle(true), 2600);
    return () => clearTimeout(a);
  }, []);

  const finish = (withSound: boolean) => {
    if (done.current) return; done.current = true;
    if (withSound) sfx.constellation();
    setLeaving(true); setTimeout(() => setShow(false), 700);
  };

  if (!show) return null;
  return (
    <div className={`gf-stage ${leaving ? "gf-out" : ""}`} onPointerDown={() => { if (title) finish(true); }} role="dialog" aria-label="영남루에 흩어진 별을 찾아라">
      <style>{FX_CSS + HOME_CSS}</style>
      {FX.sky ? <div className="gf-sky" style={{ backgroundImage: `url(${FX.sky})` }} /> : null}
      <Twinkles n={60} />
      <button className="gf-skip" onPointerDown={(e) => { e.stopPropagation(); finish(false); }}>건너뛰기</button>
      <SoundToggle />

      {/* 다섯 빛깔 별똥별 → 정원 위에 흩어져 내려앉음 */}
      {COLOR_ORDER.map((c, i) => {
        const [x, y] = LAND[i], hex = COLOR_HEX[c];
        return (
          <div key={c} className="gf-hfall" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.3 + i * 0.32}s`,
            ["--sx" as string]: `${(i - 2) * -14 + 30}vw`, ["--sy" as string]: "-70vh" }}>
            <div className="gf-htail" style={{ background: `linear-gradient(to top right, ${hex}, transparent)`, animationDelay: `${0.3 + i * 0.32}s` }} />
            <div className="gf-hstar" style={{ animationDelay: `${1.6 + i * 0.32}s` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" overflow="visible">
                <path d={STAR_PATH} fill={hex} stroke="#fff" strokeWidth=".5" style={{ filter: `drop-shadow(0 0 8px ${hex}) drop-shadow(0 0 16px ${hex})` }} /></svg>
            </div>
            {title ? <div className="gf-fadein" style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 12, fontWeight: 800, color: hex,
              textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>{COLOR_NAME[c]}</div> : null}
          </div>);
      })}

      {title ? (
        <div className="gf-hint" style={{ top: "13vh", padding: "0 20px" }}>
          <div className="gf-fadein" style={{ fontSize: 15, opacity: .85, letterSpacing: ".1em" }}>밀양 영남루 별빛정원</div>
          <div className="gf-htitle" style={{ fontSize: 30, lineHeight: 1.35, marginTop: 10, color: "#F2C14E" }}>영남루에 흩어진<br />별을 찾아라</div>
          <div className="gf-fadein" style={{ fontSize: 16, marginTop: 14, animationDelay: ".6s", fontWeight: 600 }}>다섯 빛깔 별이 정원에 내려앉았어요</div>
        </div>) : (
        <div className="gf-hint gf-fadein" style={{ top: "16vh", fontSize: 18, opacity: .8, animationDelay: ".2s" }}>밤하늘을 보세요…</div>)}

      <div className="gf-hint" style={{ bottom: "7vh", fontSize: 20 }}>
        {title ? <span className="gf-pulse" style={{ display: "inline-block", animationDelay: "1s" }}>✦ 화면을 눌러 별을 찾으러 가요 ✦</span> : null}
      </div>
    </div>
  );
}

const HOME_CSS = `
.gf-hfall { position: absolute; width: 0; height: 0; opacity: 0; animation: gf-hfall 1.3s cubic-bezier(.3,.6,.4,1) forwards; }
@keyframes gf-hfall { 0% { transform: translate(var(--sx), var(--sy)); opacity: 0 } 10% { opacity: 1 } 100% { transform: translate(0,0); opacity: 1 } }
.gf-htail { position: absolute; left: 0; bottom: 0; width: 140px; height: 4px; border-radius: 2px; transform-origin: 0 50%; transform: rotate(-38deg); filter: blur(1px);
  animation: gf-htail 1.3s ease-out forwards; }
@keyframes gf-htail { 0% { opacity: 0 } 15% { opacity: 1 } 80% { opacity: .6 } 100% { opacity: 0; width: 0 } }
.gf-hstar { position: absolute; left: -20px; top: -20px; transform: scale(.3); opacity: .6; animation: gf-hland .7s cubic-bezier(.2,1.6,.4,1) forwards, gf-pulse 1.8s ease-in-out 2.4s infinite; }
@keyframes gf-hland { to { transform: scale(1); opacity: 1 } }
.gf-htitle { animation: gf-htitle 1.1s cubic-bezier(.2,.8,.2,1) both; font-weight: 900; text-shadow: 0 0 18px rgba(242,193,78,.6), 0 2px 8px rgba(0,0,0,.7); }
@keyframes gf-htitle { from { opacity: 0; letter-spacing: .4em; filter: blur(6px) } to { opacity: 1; letter-spacing: .02em; filter: none } }
`;

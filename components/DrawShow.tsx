"use client";
import { useEffect, useMemo, useState } from "react";

// 뽑기 연출 (결과는 서버가 이미 확정 — 화면 연출만). 2026-10-14
//   ① spin  : 다섯 빛깔 별 고리가 빠르게 돌다 천천히 멈춤 (서버 응답과 별개로 최소 3초)
//   ② picked: 별 하나가 골라져 가운데 "별 캡슐"로 — "터치해서 열어 보세요"
//   ③ reveal: 터치 → 빛 터짐 + 별가루 (당첨은 금빛·화려, 참가상은 은은하게) → 결과 화면
// 돌림판처럼 칸에 등수를 그리지 않는다 (실제 결과는 서버 배출 엔진이 정하므로 칸 크기로 오해될 그림을 피함)
const COLORS = ["#F2C14E", "#E05A4E", "#E8E4D8", "#2F6FE4", "#F08A3C"];   // 5색 (밀양별 파랑)
const STAR = "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z";

export default function DrawShow({ result, onDone }: { result: string | null; onDone: () => void }) {
  const [stage, setStage] = useState<"spin" | "picked" | "reveal">("spin");
  const win = result === "g1" || result === "g2" || result === "g3";
  // 결과가 도착하고 최소 3.2초가 지나면 별 하나가 골라진다
  const [minDone, setMinDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMinDone(true), 3200); return () => clearTimeout(t); }, []);
  useEffect(() => { if (stage === "spin" && minDone && result) setStage("picked"); }, [minDone, result, stage]);
  useEffect(() => {
    if (stage !== "reveal") return;
    try { if (win && navigator.vibrate) navigator.vibrate([80, 60, 160]); } catch {}
    const t = setTimeout(onDone, win ? 1700 : 1100); return () => clearTimeout(t);
  }, [stage, win, onDone]);
  const bits = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2 + Math.random() * 0.3, r = 110 + Math.random() * 90;
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, c: COLORS[i % 5], d: Math.random() * 0.25, s: 10 + Math.random() * 12 };
  }), []);

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <style>{`
        @keyframes gfSpin { from { transform: rotate(0deg) } to { transform: rotate(1800deg) } }
        @keyframes gfTwinkle { 0%,100% { opacity: .55; transform: scale(.85) } 50% { opacity: 1; transform: scale(1.15) } }
        @keyframes gfPulse { 0%,100% { box-shadow: 0 0 18px 4px rgba(242,193,78,.55) } 50% { box-shadow: 0 0 42px 14px rgba(242,193,78,.95) } }
        @keyframes gfBob { 0%,100% { transform: translateY(0) rotate(-4deg) } 50% { transform: translateY(-10px) rotate(4deg) } }
        @keyframes gfIn { from { transform: scale(.2); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes gfBurst { from { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1 } to { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(.3) rotate(220deg); opacity: 0 } }
        @keyframes gfFlash { 0% { opacity: 0 } 25% { opacity: .95 } 100% { opacity: 0 } }
        @keyframes gfOpen { 0% { transform: scale(1) } 40% { transform: scale(1.35) rotate(12deg) } 100% { transform: scale(0); opacity: 0 } }
        .gf-ring { width: 260px; height: 260px; position: relative; animation: gfSpin 3.2s cubic-bezier(.12,.62,.18,1) forwards; }
        .gf-slot { position: absolute; width: 40px; height: 40px; left: 110px; top: 110px; }
        .gf-slot svg { width: 40px; height: 40px; display: block; animation: gfTwinkle .6s ease-in-out infinite; filter: drop-shadow(0 0 6px rgba(242,193,78,.8)); }
        .gf-halo { position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(circle, rgba(242,193,78,.28), rgba(242,193,78,0) 70%); animation: gfTwinkle 1s ease-in-out infinite; }
        .gf-core { width: 92px; height: 92px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff6d6, #F2C14E 45%, #b8862a); animation: gfPulse 1.1s ease-in-out infinite; }
        .gf-capsule { width: 168px; height: 168px; border-radius: 50%; border: 0; cursor: pointer; background: radial-gradient(circle at 35% 30%, #2a3566, #141B33 70%);
          display: flex; align-items: center; justify-content: center; animation: gfIn .5s cubic-bezier(.2,1.6,.4,1), gfPulse 1.4s ease-in-out .5s infinite; }
        .gf-capsule svg { width: 104px; height: 104px; animation: gfBob 1.6s ease-in-out infinite; filter: drop-shadow(0 0 10px rgba(242,193,78,.9)); }
        .gf-open svg { animation: gfOpen .7s ease-in forwards !important; }
        .gf-bit { position: absolute; left: 50%; top: 50%; animation: gfBurst 1.2s cubic-bezier(.1,.7,.3,1) forwards; }
        .gf-flash { position: fixed; inset: 0; background: radial-gradient(circle, #fff 0%, rgba(255,240,200,.9) 40%, rgba(242,193,78,0) 75%); pointer-events: none; animation: gfFlash .9s ease-out forwards; z-index: 40; }
      `}</style>

      {stage === "spin" ? (<>
        <div style={{ position: "relative", width: 260, height: 260 }}>
          <div className="gf-halo" />
          <div className="gf-ring">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (<div key={i} className="gf-slot" style={{ transform: `translate(${Math.cos(a) * 105}px, ${Math.sin(a) * 105}px)` }}>
                <svg viewBox="0 0 24 24" style={{ animationDelay: `${i * 0.06}s` }}><path d={STAR} fill={COLORS[i % 5]} /></svg></div>);
            })}
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="gf-core" /></div>
        </div>
        <p className="result" style={{ marginTop: 24 }}>별이 돌아가는 중…</p>
        <p className="muted">어떤 별이 골라질까요?</p>
      </>) : (
        <div style={{ position: "relative" }}>
          <button className={`gf-capsule ${stage === "reveal" ? "gf-open" : ""}`} onClick={() => stage === "picked" && setStage("reveal")} aria-label="별 캡슐 열기">
            <svg viewBox="0 0 24 24"><path d={STAR} fill="#F2C14E" stroke="#fff6d6" strokeWidth=".6" /></svg>
          </button>
          {stage === "reveal" ? (<>
            {(win ? bits : bits.slice(0, 12)).map((b, i) => (
              <svg key={i} className="gf-bit" viewBox="0 0 24 24" width={b.s} height={b.s}
                style={{ ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, animationDelay: `${b.d}s` }}>
                <path d={STAR} fill={win ? (i % 3 === 0 ? "#fff6d6" : "#F2C14E") : b.c} /></svg>))}
            {win ? <div className="gf-flash" /> : null}
          </>) : null}
        </div>
      )}
      {stage === "picked" ? (<>
        <p className="result" style={{ marginTop: 28 }}>별 하나가 골라졌어요!</p>
        <p style={{ fontSize: 18, fontWeight: 700 }}>별을 터치해서 열어 보세요 ✦</p>
      </>) : null}
      {stage === "reveal" ? <p className="result" style={{ marginTop: 28 }}>{win ? "두근두근…" : "열어 보는 중…"}</p> : null}
    </div>
  );
}

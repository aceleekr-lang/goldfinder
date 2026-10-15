"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import GardenMap from "./GardenMap";
import { RULES } from "./MapIntro";

// 참가자 화면 오른쪽 아래 [지도] 버튼 — 진행 중 언제든 지도·내 위치 확인 (관리자·현황판·홈에서는 숨김)
export default function MapFab() {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState<Record<string, string> | undefined>(undefined);
  if (!/^\/(t\/|s$|ticket|recover)/.test(path)) return null;
  const show = () => { setOpen(true); fetch("/api/session").then((r) => r.json()).then((j) => { if (j.ok) setStars(j.stars); }).catch(() => {}); };
  return (<>
    {!open ? <button onClick={show} aria-label="지도 열기"
      style={{ position: "fixed", right: 12, bottom: 14, zIndex: 60, width: 58, height: 58, borderRadius: "50%", border: "2px solid #F2C14E", background: "#141B33", color: "#fff",
        fontSize: 11, fontWeight: 800, lineHeight: 1.1, padding: 0, boxShadow: "0 4px 14px rgba(0,0,0,.35)" }}><span style={{ fontSize: 22, display: "block" }}>🗺</span>지도</button> : null}
    {open ? (
      <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(10,14,30,.9)", overflowY: "auto" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "12px 10px 24px" }}>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>별 지도</h2>
              <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "6px 14px", fontSize: 15 }} onClick={() => setOpen(false)}>닫기 ✕</button>
            </div>
            <p className="muted" style={{ margin: "6px 0" }}>깨운 구역은 ✓ 표시 · 흰 점선은 다음 구역 가는 길</p>
            <GardenMap stars={stars} height="60vh" />
            <p style={{ color: "#c62828", fontWeight: 700, fontSize: 14, margin: "10px 0 0" }}>⚠ {RULES[0]}</p>
          </div>
        </div>
      </div>) : null}
  </>);
}

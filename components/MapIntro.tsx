"use client";
import { useEffect, useState } from "react";
import GardenMap from "./GardenMap";
import { ZONES } from "@/lib/mapData";

// 시작 표식 화면 첫 안내 — 지도 + 한 방향 동선(역주행 금지). [동의합니다]를 눌러야 닫힌다 (2026-10-15)
//   동의는 그날 그 폰에 기억 (브라우저 저장소가 막힌 폰은 매번 표시)
const KEY = "gf_map_ok";
const today = () => new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
export function mapAgreed(): boolean { try { return localStorage.getItem(KEY) === today(); } catch { return false; } }

export const RULES = [
  "관람 동선은 한 방향(①→⑨)입니다. 역주행은 안 돼요 — 많은 분이 함께 걷는 길이라 위험합니다.",
  "별은 구역마다 한 가지 색으로 8개씩 있어요. 구역을 지나기 전에 그 색 별을 깨우세요. 지나간 구역으로 되돌아갈 수 없어요.",
  "5구역을 지나면 출구 표식과 경품 수령소가 있어요. 진행 중에도 화면의 [지도] 버튼으로 언제든 다시 볼 수 있어요.",
];

export default function MapIntro({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!mapAgreed()) setOpen(true); }, []);
  if (!open) return null;
  const agree = () => { try { localStorage.setItem(KEY, today()); } catch {} setOpen(false); onDone?.(); };
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(10,14,30,.88)", overflowY: "auto" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 12px 28px" }}>
        <div className="card" style={{ margin: 0 }}>
          <h2 style={{ marginTop: 0 }}>별빛정원 별 지도</h2>
          <GardenMap height="46vh" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", margin: "10px 0 4px", fontSize: 14 }}>
            {ZONES.map((z) => (<span key={z.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: z.hex, border: "1px solid #888", flex: "none" }} />{z.n}구역 {z.name}({z.word})</span>))}
          </div>
          <div style={{ background: "#fdecea", border: "2px solid #c62828", borderRadius: 12, padding: "10px 12px", margin: "10px 0" }}>
            <p style={{ margin: "0 0 6px", fontWeight: 900, color: "#c62828", fontSize: 18 }}>⚠ 역주행 금지 — 한 방향으로만 이동해요</p>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6, fontSize: 15 }}>{RULES.map((r) => <li key={r}>{r}</li>)}</ol>
          </div>
          <button className="btn" onClick={agree}>동의합니다</button>
        </div>
      </div>
    </div>
  );
}

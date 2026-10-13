"use client";
import { useEffect, useState } from "react";
type W = { id: number; body: string; created_at: string; visible: boolean; join_code: string | null; op_date: string | null };
// 소원 목록·숨김 (부적절 내용). 금칙어는 입력 시 차단되고, 걸러지지 않은 건 여기서 숨긴다
export default function Wishes() {
  const [d, setD] = useState<{ wishes: W[]; total: number; hidden: number } | null>(null);
  const load = () => fetch("/api/admin/wishes").then((r) => r.json()).then(setD).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = async (w: W) => { await fetch("/api/admin/wishes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: w.id, visible: !w.visible }) }); load(); };
  if (!d) return <div className="spin">불러오는 중…</div>;
  return (<>
    <h1>소원별 메시지 <span className="muted" style={{ fontSize: 13 }}>전체 {d.total} · 숨김 {d.hidden}</span></h1>
    <div className="card">{d.wishes.map((w) => (
      <div key={w.id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0", opacity: w.visible ? 1 : 0.45, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>{w.body}<div className="muted">{w.op_date} · {w.join_code ?? "-"} · {new Date(w.created_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })}</div></div>
        <button className="btn secondary" style={{ margin: 0, padding: "4px 8px", fontSize: 12, width: "auto" }} onClick={() => set(w)}>{w.visible ? "숨김" : "복원"}</button>
      </div>))}</div>
  </>);
}

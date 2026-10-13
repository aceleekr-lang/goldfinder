"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Day = { op_date: string; open_at: string; last_entry: string; close_at: string; grace_min: number; active: boolean; slots: number;
  alloc: Record<string, number>; remaining: Record<string, number>; sessions: number };

// 운영일 목록 + 새 운영일 추가
export default function OpDayList() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [today, setToday] = useState("");
  const [newDate, setNewDate] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/admin/opdays").then((r) => r.json()).then((j) => { setDays(j.days ?? []); setToday(j.today ?? ""); });
  useEffect(() => { load(); }, []);
  const add = async () => {
    setMsg(null);
    const r = await fetch("/api/admin/opdays", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ op_date: newDate, open_at: "19:30", last_entry: "22:00", close_at: "23:00", grace_min: 0, active: true }) });
    const j = await r.json();
    if (j.ok) { setNewDate(""); load(); } else setMsg(j.code === "FORBIDDEN" ? "총괄 계정만 변경할 수 있어요." : `저장 실패 (${j.code})`);
  };
  if (!days) return <div className="spin">불러오는 중…</div>;
  return (<>
    <h1>운영일</h1>
    <div className="card">
      <p className="muted">날짜를 누르면 운영시간·시간대·경품·배정을 바꿀 수 있어요. 오늘: {today}</p>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
        <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}><th>날짜</th><th>시간</th><th>slot</th><th>1등</th><th>2등</th><th>3등</th><th>참여</th></tr></thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.op_date} style={{ borderTop: "1px solid var(--line)", opacity: d.active ? 1 : 0.5 }}>
              <td style={{ padding: "8px 0" }}><Link href={`/admin/day/${d.op_date}`}><b>{d.op_date}</b>{d.op_date === today ? " ●" : ""}{d.active ? "" : " (비활성)"}</Link></td>
              <td>{d.open_at.slice(0, 5)}~{d.close_at.slice(0, 5)}</td>
              <td>{d.slots}</td>
              <td>{d.remaining.g1 ?? 0}/{d.alloc.g1 ?? 0}</td><td>{d.remaining.g2 ?? 0}/{d.alloc.g2 ?? 0}</td><td>{d.remaining.g3 ?? 0}/{d.alloc.g3 ?? 0}</td>
              <td>{d.sessions}</td>
            </tr>))}
        </tbody>
      </table>
      <p className="muted">잔여/배정. 배정이 0인 날은 관리자 대시보드에 경고가 뜹니다.</p>
    </div>
    <div className="card">
      <p><b>새 운영일 추가</b> (기본 19:30~23:00, 최종입장 22:00 — 2·3등 기본 창 자동 생성, 금 창은 상세에서 직접 추가)</p>
      <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ fontSize: 18, padding: 10, width: "100%" }} />
      {msg ? <p>{msg}</p> : null}
      <button className="btn" onClick={add} disabled={!newDate}>추가</button>
    </div>
  </>);
}

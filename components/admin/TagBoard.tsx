"use client";
import { useEffect, useState } from "react";
import { COLOR_NAME } from "@/lib/copy";

type Tag = { id: string; role: string; color: string | null; label: string; zone: string | null; active: boolean; is_spare: boolean; cooldown_left: number; url: string;
  attempts_today: number; quiz_today: number; correct_today: number; cooldown_hits_today: number; last_attempt_at: string | null; sessions_today: number };
const hhmm = (s?: string | null) => (s ? new Date(s).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }) : "-");

// 태그 상태판 (상세): 태그별 인증수·정답·쿨다운 충돌·마지막 인증·on/off. 파손 시 여기서 끄고 예비를 켠다 (F-3-5)
export default function TagBoard() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/admin/tags").then((r) => r.json()).then((j) => setTags(j.tags ?? [])).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);
  const toggle = async (t: Tag) => {
    const reason = prompt(`${t.label}을(를) ${t.active ? "비활성" : "활성"}합니다. 사유:`); if (!reason) return;
    const r = await fetch("/api/admin/tags", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId: t.id, active: !t.active, reason }) });
    const j = await r.json(); setMsg(j.ok ? `${t.label} ${t.active ? "비활성" : "활성"} 처리됨` : `실패 (${j.code})`); load();
  };
  if (!tags) return <div className="spin">불러오는 중…</div>;
  const list = tags.filter((t) => filter === "all" || t.color === filter || t.role === filter);
  const btn = { padding: "4px 8px", fontSize: 12, margin: "0 4px 0 0", width: "auto", display: "inline-block" } as const;
  return (<>
    <h1>태그 상태판 <span className="muted" style={{ fontSize: 13 }}>15초 갱신</span></h1>
    {msg ? <div className="banner">{msg}</div> : null}
    <div style={{ marginBottom: 8 }}>
      {[["all", "전체"], ["start", "시작"], ["exit", "출구"], ...Object.entries(COLOR_NAME)].map(([k, v]) => (
        <button key={k} className="btn secondary" style={{ ...btn, fontWeight: filter === k ? 800 : 400 }} onClick={() => setFilter(k)}>{v}</button>))}
    </div>
    <div className="card" style={{ overflowX: "auto", padding: 8 }}>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", whiteSpace: "nowrap" }}>
        <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}><th>표식</th><th>구역</th><th>상태</th><th>접촉</th><th>출제</th><th>정답</th><th>쿨다운충돌</th><th>마지막</th><th>ID</th><th /></tr></thead>
        <tbody>{list.map((t) => (
          <tr key={t.id} style={{ borderTop: "1px solid var(--line)", opacity: t.active ? 1 : 0.5 }}>
            <td style={{ padding: "6px 4px" }}><b>{t.label}</b></td>
            <td>{t.zone ?? ""}</td>
            <td>{!t.active ? "비활성" : t.cooldown_left > 0 ? `쿨다운 ${t.cooldown_left}s` : "대기"}</td>
            <td>{t.role === "star" ? t.attempts_today : t.sessions_today}</td>
            <td>{t.role === "star" ? t.quiz_today : "-"}</td>
            <td>{t.role === "star" ? (t.quiz_today ? `${t.correct_today} (${Math.round((t.correct_today / t.quiz_today) * 100)}%)` : "0") : "-"}</td>
            <td>{t.role === "star" ? t.cooldown_hits_today : "-"}</td>
            <td>{hhmm(t.last_attempt_at)}</td>
            <td className="muted">{t.id}</td>
            <td><button className="btn secondary" style={btn} onClick={() => toggle(t)}>{t.active ? "끄기" : "켜기"}</button></td>
          </tr>))}</tbody>
      </table>
    </div>
    <p className="muted">파손·도난 시: 해당 별 끄기 → 같은 색 예비(라벨 "(예비)") 켜기 → 예비 표식을 그 자리에 설치. 정답률이 낮은 별은 콘텐츠 화면에서 문항을 점검하세요.</p>
  </>);
}

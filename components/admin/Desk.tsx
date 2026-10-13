"use client";
import { useEffect, useState } from "react";
import { PRIZE_NAME } from "@/lib/copy";

type Draw = { ticket_id: string; join_code: string; round: number; result: string; prize_name: string | null; status: string; drawn_at: string; redeemed_at: string | null; redeemed_by_name: string | null };
type D = { ok: boolean; code?: string; seconds_left?: number; window_sec?: number; draws?: Draw[]; pending_count?: number };
const hhmm = (s?: string | null) => (s ? new Date(s).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Seoul" }) : "");

// 수령소 전용 화면 (태블릿·노트북): 공용 코드 크게 + 오늘 뽑기 결과 목록(대조용). 지급은 참가자 폰의 [사용]+직원 PIN으로
export default function Desk() {
  const [d, setD] = useState<D | null>(null);
  const [left, setLeft] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/admin/desk").then((r) => r.json()).then((j: D) => { setD(j); if (j.seconds_left != null) setLeft(j.seconds_left); }).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setLeft((x) => (x > 0 ? x - 1 : 0)), 1000); return () => clearInterval(i); }, []);
  const manual = async (t: Draw) => {
    if (!confirm(`참여번호 ${t.join_code} · ${t.prize_name ?? PRIZE_NAME[t.result]}\n참가자 폰 없이 수동으로 지급 처리할까요?`)) return;
    const checks = t.result === "g1" ? { id_verified: confirm("1등: 신분 확인을 마쳤나요?"), docs_received: confirm("1등: 개인정보 동의서·원천징수 서류를 받았나요?") } : {};
    const r = await fetch("/api/admin/desk", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "redeem", ticketId: t.ticket_id, checks }) });
    const j = await r.json(); setMsg(j.ok ? "수동 지급 처리됨 (ops_log 기록)" : `실패 (${j.code})`); load();
  };
  if (!d) return <div className="spin">불러오는 중…</div>;
  if (!d.ok) return <div className="card"><p>코드를 불러올 수 없어요 ({d.code}). 로그인 상태를 확인하세요.</p></div>;
  return (<>
    <div className="card" style={{ textAlign: "center", padding: 24 }}>
      <p className="muted" style={{ margin: 0 }}>뽑기권 사용 코드 · <b>{left}초</b> 후 새 코드 (이전 코드도 3분간 유효)</p>
      <div className="bigcode" style={{ fontSize: 96, letterSpacing: 14, lineHeight: 1.2 }}>{d.code}</div>
      <p className="muted">참가자: 폰 뽑기권 화면에 이 코드 입력 → 뽑기 → 결과 화면을 직원에게 보여주고 [사용] → 직원 PIN 입력 → 경품 수령</p>
    </div>
    {msg ? <div className="banner">{msg}</div> : null}
    <div className="card">
      <h2 style={{ marginTop: 0 }}>오늘 뽑기 결과 <span className="muted" style={{ fontSize: 14 }}>지급 대기 {d.pending_count ?? 0}건 · 참가자 폰 화면과 대조하세요</span></h2>
      <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
        <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}><th>시각</th><th>참여번호</th><th>경품</th><th>상태</th><th /></tr></thead>
        <tbody>{(d.draws ?? []).map((t) => (
          <tr key={t.ticket_id} style={{ borderTop: "1px solid var(--line)", background: t.status === "drawn" ? "#fff8e1" : undefined }}>
            <td style={{ padding: "8px 0" }}>{hhmm(t.drawn_at)}</td>
            <td><b>{t.join_code}</b>{t.round > 1 ? ` (${t.round}R)` : ""}</td>
            <td style={{ fontWeight: t.result === "g1" ? 800 : 400 }}>{t.prize_name ?? PRIZE_NAME[t.result]}</td>
            <td>{t.status === "redeemed" ? `지급됨 ${hhmm(t.redeemed_at)} · ${t.redeemed_by_name ?? ""}` : "지급 대기"}</td>
            <td>{t.status === "drawn" ? <button className="btn secondary" style={{ padding: "4px 8px", fontSize: 12, margin: 0, width: "auto" }} onClick={() => manual(t)}>수동 지급</button> : null}</td>
          </tr>))}</tbody>
      </table>
    </div>
  </>);
}

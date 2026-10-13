"use client";
import { useState } from "react";
import StarSlots from "@/components/StarSlots";
import { COLOR_NAME, PRIZE_NAME } from "@/lib/copy";

type S = { ok: boolean; code?: string; session_id: string; join_code: string; session_status: string; stars: Record<string, string>; star_count: number; round?: number;
  retry_used: boolean; started_at: string; last_tag_at: string | null; recover_count: number; ticket: { id: string; status: string; result?: string } | null };
const ERR: Record<string, string> = { NOT_FOUND: "오늘 참여 중 이 번호는 없어요.", REASON_REQUIRED: "사유를 적어 주세요.", ALREADY_ISSUED: "이미 뽑기권이 있는 세션이에요.", NOT_ACTIVE: "진행 중인 세션이 아니에요.", NOT_DRAWN: "아직 뽑기가 실행되지 않았어요.", G1_CHECKS_REQUIRED: "1등은 확인 2종이 필요해요." };

// 수기 대체 (참여번호 조회 → 별 수동 적립 / 뽑기권 수동 발급 / 경품 수동 지급 / 세션 강제 종료). 전부 사유 필수 → ops_log
export default function SessionTools() {
  const [code, setCode] = useState("");
  const [s, setS] = useState<S | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [color, setColor] = useState("yellow");
  const find = async (c = code) => { setMsg(null); const j = await fetch(`/api/admin/session?code=${c}`).then((r) => r.json()); setS(j); if (!j.ok) setMsg(ERR[j.code] ?? j.code); };
  const act = async (action: string, extra: Record<string, unknown> = {}, ask = true) => {
    if (!s?.ok) return;
    const reason = ask ? prompt("사유 (필수, 이력에 남습니다):") : "manual";
    if (ask && !reason) return;
    const r = await fetch("/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, sessionId: s.session_id, reason, ...extra }) });
    const j = await r.json(); setMsg(j.ok ? "처리됨" : ERR[j.code] ?? `실패 (${j.code})`); find(s.join_code);
  };
  const redeem = () => {
    if (!s?.ticket) return;
    const checks = s.ticket.result === "g1" ? { id_verified: confirm("1등: 신분 확인을 마쳤나요?"), docs_received: confirm("1등: 개인정보 동의서·원천징수 서류를 받았나요?") } : {};
    act("redeem", { ticketId: s.ticket.id, checks }, false);
  };
  return (<>
    <h1>참가자 조회 · 수기 처리</h1>
    <div className="card">
      <input className="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && code.length === 6 && find()} placeholder="참여번호" autoFocus />
      <button className="btn" onClick={() => find()} disabled={code.length !== 6}>조회</button>
      {msg ? <p>{msg}</p> : null}
    </div>
    {s?.ok ? (<>
      <div className="card">
        <p style={{ margin: 0 }}><b>{s.join_code}</b> · {s.round ?? 1}라운드 · 상태 <b>{({ active: "진행 중", completed: "종료(출구)", expired: "만료", force_ended: "강제 종료" } as Record<string, string>)[s.session_status] ?? s.session_status}</b> · 재도전권 {s.retry_used ? "사용" : "남음"}{s.recover_count ? ` · 복구 ${s.recover_count}회` : ""}</p>
        <p className="muted">시작 {new Date(s.started_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })} · 마지막 태그 {s.last_tag_at ? new Date(s.last_tag_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"} · 세션 {s.session_id}</p>
        <StarSlots stars={s.stars} />
        {s.ticket ? <p>뽑기권 {s.ticket.id} · <b>{({ issued: "발급(미뽑기)", drawn: "뽑기 완료·지급 대기", redeemed: "지급 완료", void: "무효" } as Record<string, string>)[s.ticket.status] ?? s.ticket.status}</b>{s.ticket.result ? ` · ${PRIZE_NAME[s.ticket.result]}` : ""}</p> : <p className="muted">뽑기권 없음</p>}
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>수기 처리</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select value={color} onChange={(e) => setColor(e.target.value)} style={{ fontSize: 16, padding: 8 }}>{Object.entries(COLOR_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <button className="btn secondary" style={{ margin: 0 }} onClick={() => act("star", { color })} disabled={s.stars[color] === "won"}>별 수동 적립</button>
        </div>
        <button className="btn secondary" onClick={() => act("ticket")} disabled={!!s.ticket}>뽑기권 수동 발급</button>
        <button className="btn secondary" onClick={redeem} disabled={s.ticket?.status !== "drawn"}>경품 수동 지급 (참가자 폰 없이)</button>
        <button className="btn secondary" onClick={() => act("end")} disabled={!["active", "expired"].includes(s.session_status)}>세션 강제 종료</button>
        <p className="muted">태그 인식 불가·음영지역 구제용. 모든 처리는 사유와 함께 기록되고 대시보드에 건수가 표시됩니다. 이탈 일괄 종료는 대시보드에 있어요.</p>
      </div>
    </>) : null}
  </>);
}

"use client";
import { useState } from "react";
import StarSlots from "@/components/StarSlots";
import { COLOR_NAME, PRIZE_NAME } from "@/lib/copy";

type S = { ok: boolean; code?: string; session_id: string; join_code: string; phone?: string | null; phone_last4?: string | null; gender?: string | null; age_band?: string | null; region?: string | null; session_status: string; stars: Record<string, string>; star_count: number; round?: number;
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
    const j = await r.json(); setMsg(j.ok ? "처리됨" : ERR[j.code] ?? `실패 (${j.code})`); if (action !== "reset") find(s.join_code); else { setS(null); setMsg(j.ok ? `참여 초기화 완료 — 종료 ${j.ended}건${j.rsv_released ? " · 예약 사용 처리 취소됨" : " · (예약앱 미연동: 예약 관리에서 입장 취소 필요)"}. 본인이 시작 표식에서 다시 시작하면 돼요.` : ERR[j.code] ?? `실패 (${j.code})`); }
  };
  const reset = () => {
    if (!s?.ok) return;
    if (!confirm(`이 참여를 초기화할까요?\n· 지금 진행(별 ${s.star_count}개)과 뽑기권이 무효가 되고\n· 예약 사용 처리가 취소돼 본인이 시작 표식에서 다시 시작할 수 있어요.`)) return;
    act("reset", { key: s.phone || s.join_code });
  };
  const okPhone = (c: string) => /^01[0-9][0-9]{7,8}$/.test(c) || c.length === 6;
  const redeem = () => {
    if (!s?.ticket) return;
    const checks = s.ticket.result === "g1" ? { id_verified: confirm("1등: 신분 확인을 마쳤나요?"), docs_received: confirm("1등: 개인정보 동의서·원천징수 서류를 받았나요?") } : {};
    act("redeem", { ticketId: s.ticket.id, checks }, false);
  };
  return (<>
    <h1>참가자 조회 · 수기 처리</h1>
    <p className="muted" style={{ margin: "0 0 8px" }}>본인 휴대폰번호로 찾아요. 안내 요원용 6자리 참여번호로도 돼요.</p>
    <div className="card">
      <input className="code" type="tel" inputMode="numeric" maxLength={13} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 11))} onKeyDown={(e) => e.key === "Enter" && okPhone(code) && find()} placeholder="휴대폰번호 (또는 참여번호)" autoFocus style={{ letterSpacing: 1 }} />
      <button className="btn" onClick={() => find()} disabled={!okPhone(code)}>조회</button>
      {msg ? <p>{msg}</p> : null}
    </div>
    {s?.ok ? (<>
      <div className="card">
        <p style={{ margin: 0 }}><b>{s.phone ? `${s.phone.slice(0, 3)}-${s.phone.slice(3, 7)}-${s.phone.slice(7)}` : "(번호 없음)"}</b> · 참여번호 {s.join_code}{s.gender || s.age_band || s.region ? <span className="muted"> · {[s.gender === "M" ? "남" : s.gender === "F" ? "여" : null, s.age_band, s.region].filter(Boolean).join("·")}</span> : null} · {s.round ?? 1}라운드 · 상태 <b>{({ active: "진행 중", completed: "종료(출구)", expired: "만료", force_ended: "강제 종료" } as Record<string, string>)[s.session_status] ?? s.session_status}</b> · 재도전권 {s.retry_used ? "사용" : "남음"}{s.recover_count ? ` · 복구 ${s.recover_count}회` : ""}</p>
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
        <button className="btn secondary" style={{ borderColor: "#c62828", color: "#c62828" }} onClick={reset} disabled={s.session_status === "force_ended"}>참여 초기화 (남이 먼저 시작했을 때 — 처음부터 다시)</button>
        <p className="muted">태그 인식 불가·음영지역 구제용. 모든 처리는 사유와 함께 기록되고 대시보드에 건수가 표시됩니다. 이탈 일괄 종료는 대시보드에 있어요.</p>
      </div>
    </>) : null}
  </>);
}

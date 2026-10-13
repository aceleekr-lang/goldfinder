"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRIZE_NAME, VOUCHER_NOTE, errText } from "@/lib/copy";

type T = { ok: boolean; code?: string; ticket_id?: string; join_code?: string; round?: number; status?: string; result?: string | null;
  prize_name?: string | null; drawn_at?: string | null; redeemed_at?: string | null; redeemed_by_name?: string | null };

// P5 뽑기권: 수령소 화면의 공용 코드 입력 → 뽑기(2초 연출) → 결과 → [사용] (직원이 PIN 입력, 1등은 확인 2종) → 사용 완료
export default function Ticket() {
  const [t, setT] = useState<T | null>(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"idle" | "drawing" | "result" | "redeem" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [checks, setChecks] = useState({ id_verified: false, docs_received: false });
  const [opName, setOpName] = useState<string | null>(null);

  const load = async () => {
    try { const j: T = await (await fetch("/api/ticket")).json(); setT(j); if (j.ok && j.status === "redeemed") setPhase("done"); else if (j.ok && j.status === "drawn") setPhase("result"); }
    catch { setT({ ok: false, code: "SERVER_ERROR" }); }
  };
  useEffect(() => { load(); }, []);

  const draw = async () => {
    if (!t?.ticket_id) return;
    setErr(null); setPhase("drawing");
    const r = await fetch("/api/draw/execute", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ticketId: t.ticket_id, code }) });
    const j = await r.json();
    if (j.ok) { setTimeout(() => { setT({ ...t, status: "drawn", result: j.result, prize_name: j.prize_name }); setPhase("result"); }, 2000); }   // 결과는 서버 확정 후 2초 연출
    else { setErr(errText(j.code)); setPhase("idle"); if (j.code === "ALREADY_USED") load(); }
  };
  const redeem = async () => {
    if (!t?.ticket_id) return;
    setErr(null);
    const r = await fetch("/api/ticket/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ticketId: t.ticket_id, pin, checks }) });
    const j = await r.json();
    if (j.ok) { setOpName(j.operator ?? null); setPin(""); setPhase("done"); load(); } else setErr(errText(j.code));
  };

  if (!t) return <div className="spin">뽑기권을 불러오는 중…</div>;
  if (!t.ok) {
    return (<><h1>뽑기권</h1><div className="card"><p>{t.code === "NO_TICKET" ? "아직 뽑기권이 없어요. 5가지 별을 모두 깨우고 출구 표식을 태그해 주세요." : errText(t.code)}</p></div>
      <Link className="btn secondary" href="/s">내 별자리</Link></>);
  }
  const prize = t.prize_name ?? PRIZE_NAME[t.result ?? "card"];
  const head = <p className="muted" style={{ textAlign: "center" }}>참여번호 <b>{t.join_code}</b>{t.round && t.round > 1 ? ` · ${t.round}라운드` : ""} · 뽑기권 {t.ticket_id}</p>;

  if (phase === "drawing") return <div className="spin"><div className="result">별이 돌아가는 중…</div></div>;

  if (phase === "done") {
    return (<>
      <h1>사용 완료 ✓</h1>
      <div className="card" style={{ textAlign: "center" }}>
        <p className="result">{prize}</p>
        <p>경품 지급이 완료됐어요. {opName ?? t.redeemed_by_name ?? ""}</p>
        <p className="muted">{t.redeemed_at ? new Date(t.redeemed_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" }) : ""}</p>
        {head}
      </div>
      <Link className="btn secondary" href="/">처음으로</Link>
    </>);
  }

  if (phase === "result" || phase === "redeem") {
    return (<>
      <h1>뽑기 결과</h1>
      <div className="card" style={{ textAlign: "center" }}>
        <p className="result" style={{ fontSize: 32 }}>{prize}</p>
        {head}
        <p>이 화면을 <b>수령소 직원</b>에게 보여 주세요. 직원이 아래 [사용]을 눌러 경품을 드려요.</p>
        {t.result === "g2" || t.result === "g3" ? <p className="muted">{VOUCHER_NOTE}</p> : null}
        {t.result === "card" ? <p className="muted">굿바비 행운부적을 받아 가세요 — 완주를 축하해요!</p> : null}
      </div>
      {phase === "result" ? (
        <button className="btn" onClick={() => setPhase("redeem")}>사용 (직원용)</button>
      ) : (
        <div className="card" style={{ borderColor: "#888" }}>
          <p><b>사용 처리합니다.</b> 되돌릴 수 없어요. 직원 PIN을 입력해 주세요.</p>
          {t.result === "g1" ? (<>
            <label style={{ display: "block" }}><input type="checkbox" checked={checks.id_verified} onChange={(e) => setChecks({ ...checks, id_verified: e.target.checked })} /> 신분 확인 완료</label>
            <label style={{ display: "block" }}><input type="checkbox" checked={checks.docs_received} onChange={(e) => setChecks({ ...checks, docs_received: e.target.checked })} /> 개인정보 동의서·원천징수 서류 수령</label>
          </>) : null}
          <input className="code" type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="직원 PIN" />
          {err ? <p>{err}</p> : null}
          <button className="btn" onClick={redeem} disabled={pin.length < 4 || (t.result === "g1" && !(checks.id_verified && checks.docs_received))}>사용합니다</button>
          <button className="btn secondary" onClick={() => { setPhase("result"); setErr(null); setPin(""); }}>취소</button>
        </div>
      )}
    </>);
  }

  // idle: issued / expired / void
  return (<>
    <h1>뽑기권</h1>
    <div className="card">
      {t.status === "expired" || t.status === "void" ? <p>{errText("TICKET_EXPIRED")}</p> : (<>
        {head}
        <p><b>경품 수령소</b>로 오세요. 수령소 화면에 있는 <b>6자리 코드</b>를 입력하면 뽑기가 시작돼요.</p>
        <input className="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
        {err ? <p>{err}</p> : null}
        <button className="btn" onClick={draw} disabled={code.length !== 6}>뽑기</button>
        <p className="muted">뽑기권은 오늘 23:00까지 유효해요. 코드는 3분마다 바뀌니 화면의 코드를 그대로 입력하세요.</p>
      </>)}
    </div>
    <Link className="btn secondary" href="/s">내 별자리</Link>
  </>);
}

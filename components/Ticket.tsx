"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRIZE_NAME, VOUCHER_NOTE, errText } from "@/lib/copy";
import DrawShow from "./DrawShow";

type T = { ok: boolean; code?: string; is_test?: boolean; ticket_id?: string; join_code?: string; round?: number; status?: string; result?: string | null;
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
  const [force, setForce] = useState<string>("");   // 테스트 뽑기권 전용: "" = 모의(실제 엔진 결과, 차감 없음) / g1·g2·g3·card = 결과 지정
  const [mode, setMode] = useState<string | null>(null);
  const [drawn, setDrawn] = useState<{ result: string; prize_name: string | null } | null>(null);   // 서버 확정 결과 (연출이 끝나면 화면에 반영)
  const [fresh, setFresh] = useState(false);   // 방금 연 결과 → 결과 카드 등장 효과

  const load = async () => {
    try { const j: T = await (await fetch("/api/ticket")).json(); setT(j); if (j.ok && j.status === "redeemed") setPhase("done"); else if (j.ok && j.status === "drawn") setPhase("result"); }
    catch { setT({ ok: false, code: "SERVER_ERROR" }); }
  };
  useEffect(() => { load(); }, []);

  const draw = async () => {
    if (!t?.ticket_id) return;
    setErr(null); setDrawn(null); setPhase("drawing");
    let j: { ok: boolean; code?: string; result?: string; prize_name?: string | null; test_mode?: string };
    try {
      const r = await fetch("/api/draw/execute", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ticketId: t.ticket_id, code, force: t.is_test && force ? force : undefined }) });
      j = await r.json();
    } catch { j = { ok: false, code: "SERVER_ERROR" }; }
    if (j.ok && j.result) { setMode(j.test_mode ?? null); setDrawn({ result: j.result, prize_name: j.prize_name ?? null }); }   // 결과는 서버 확정 — 연출(DrawShow)이 끝나면 결과 화면으로
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
  // 테스트 뽑기권 표시 (실제 경품과 혼동 방지 — 수령소 직원이 한눈에 구분)
  const testMark = t.is_test ? (
    <div style={{ background: "#c62828", color: "#fff", textAlign: "center", fontWeight: 900, fontSize: 22, letterSpacing: 4, borderRadius: 10, padding: "6px 0", margin: "8px 0" }}>
      TEST · 실제 경품 아님{mode ? <div style={{ fontSize: 12, letterSpacing: 0, fontWeight: 400 }}>{mode === "forced" ? "결과 지정 뽑기" : "모의 뽑기 (실제 엔진 결과, 수량 차감 없음)"}</div> : null}
    </div>) : null;
  const head = <p className="muted" style={{ textAlign: "center" }}>참여번호 <b>{t.join_code}</b>{t.round && t.round > 1 ? ` · ${t.round}라운드` : ""} · 뽑기권 {t.ticket_id}</p>;

  if (phase === "drawing") return <DrawShow result={drawn?.result ?? null} onDone={() => {
    if (drawn) { setT({ ...t, status: "drawn", result: drawn.result, prize_name: drawn.prize_name }); setFresh(true); setPhase("result"); }
  }} />;

  if (phase === "done") {
    return (<>
      <h1>사용 완료 ✓</h1>
      {testMark}
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
      <style>{`@keyframes gfPop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.06); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes gfGlow { 0%,100% { box-shadow: 0 0 0 rgba(242,193,78,0) } 50% { box-shadow: 0 0 34px 8px rgba(242,193,78,.75) } }`}</style>
      <h1>뽑기 결과</h1>
      {testMark}
      <div className="card" style={{ textAlign: "center", animation: fresh ? `gfPop .6s cubic-bezier(.2,1.4,.4,1)${t.result && t.result !== "card" ? ", gfGlow 1.6s ease-in-out .6s 3" : ""}` : undefined,
        borderColor: t.result && t.result !== "card" ? "#F2C14E" : undefined, borderWidth: t.result && t.result !== "card" ? 3 : undefined }}>
        {fresh && t.result && t.result !== "card" ? <p style={{ fontSize: 20, fontWeight: 800, color: "#b8862a", margin: "0 0 4px" }}>{t.result === "g1" ? "★ 축하합니다! 금빛 별이 떴어요 ★" : "★ 축하합니다! ★"}</p> : null}
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
        {testMark}
        {t.is_test ? (<div style={{ margin: "8px 0" }}>
          <p style={{ margin: "4px 0", fontWeight: 700 }}>테스트 뽑기 방식</p>
          {([["", "자동 (모의 — 지금 진짜로 뽑으면 나올 결과)"], ["g1", "금(1등) 지정"], ["g2", "2등 지정"], ["g3", "3등 지정"], ["card", "꽝(참가상) 지정"]] as const).map(([v, l]) => (
            <label key={v} style={{ display: "block", padding: "4px 0" }}><input type="radio" name="force" checked={force === v} onChange={() => setForce(v)} /> {l}</label>))}
          <p className="muted">모의 뽑기는 운영시간 밖이면 대부분 참가상이 나와요. 각 결과 화면을 보려면 지정을 쓰세요.</p>
        </div>) : null}
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

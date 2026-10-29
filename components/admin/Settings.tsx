"use client";
import { useEffect, useState } from "react";

type Op = { id: string; name: string; role: string; active: boolean };
type D = { ok: boolean; code?: string; settings: Record<string, { value: string; updated_at: string; updated_by: string | null }>; desk_secret_updated_at: string; operators: Op[] };
const LABEL: Record<string, string> = { walkin: "현장 접수 허용 (1 = 예약 없이도 본인 휴대폰번호로 시작, 0 = 사전예약자만)", daily_cap: "일일 선착순 상한(명) — 예약+현장 시작 인원, 도달 시 '오늘 참여 마감' 안내", cooldown_sec: "별 태그 쿨다운(초)", entry_cap: "입장 상한(세션 수)", min_session_min: "최소 세션 시간(분) — 미만이면 뽑기권 보류", min_tag_interval_sec: "별 태그 최소 간격(초)",
  stale_min: "이탈 추정(분)", expire_min: "자동 만료(분)", desk_code_sec: "수령소 코드 갱신 주기(초)",
  start_rate: "배출 사전값 — 예약자 중 시작하는 비율(%) · 실적이 쌓이면 자동 대체", finish_rate: "배출 사전값 — 시작한 사람 중 뽑기까지 오는 비율(%) · 실적으로 자동 보정",
  purge_after: "개인정보(휴대폰번호·성별·연령대·지역) 자동 삭제일 YYYYMMDD — 행사 종료+60일" };
const ERR: Record<string, string> = { PIN_FORMAT: "PIN은 4~8자리 숫자.", PIN_IN_USE: "다른 계정이 쓰는 PIN이에요 (PIN으로 직원을 식별하므로 중복 불가).", PIN_REQUIRED: "새 계정은 PIN이 필요해요.", ID_INVALID: "아이디는 영문 소문자·숫자·_ 2~20자.", LAST_ADMIN: "마지막 총괄 계정은 바꿀 수 없어요.", CANNOT_DEACTIVATE_SELF: "본인 계정은 비활성할 수 없어요.", VALUE_INVALID: "값을 확인하세요.", KEY_INVALID: "없는 설정 키." };

// 총괄 전용: 운영 설정 + 수령소 코드 비밀키 + 계정·PIN
export default function Settings() {
  const [d, setD] = useState<D | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [op, setOp] = useState<{ id: string; name: string; pin: string; role: string; active: boolean }>({ id: "", name: "", pin: "", role: "staff", active: true });
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/admin/settings").then((r) => r.json()).then((j: D) => { setD(j); if (j.ok) setVals(Object.fromEntries(Object.entries(j.settings).map(([k, v]) => [k, v.value]))); });
  useEffect(() => { load(); }, []);
  const post = async (body: unknown, ok: string) => {
    const r = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); setMsg(j.ok ? ok : ERR[j.code] ?? `실패 (${j.code})`); load(); return j;
  };
  if (!d) return <div className="spin">불러오는 중…</div>;
  if (!d.ok) return <div className="card"><p>총괄 계정만 볼 수 있어요.</p></div>;
  const inp = { fontSize: 16, padding: 8, border: "1px solid var(--line)", borderRadius: 8, width: "100%" } as const;
  return (<>
    <h1>운영 설정</h1>
    {msg ? <div className="banner">{msg}</div> : null}
    <div className="card">
      {Object.keys(LABEL).filter((k) => d.settings[k]).map((k) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px", gap: 6, alignItems: "center", margin: "6px 0" }}>
          <span>{LABEL[k]}<br /><span className="muted">{d.settings[k].updated_by ? `${d.settings[k].updated_by} · ${new Date(d.settings[k].updated_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}` : "초기값"}</span></span>
          <input style={inp} value={vals[k] ?? ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
          <button className="btn secondary" style={{ margin: 0, padding: 8, fontSize: 14 }} disabled={vals[k] === d.settings[k].value} onClick={() => post({ action: "setting", key: k, value: vals[k] }, `${LABEL[k]} 저장됨`)}>저장</button>
        </div>))}
      <p className="muted">쿨다운·입장 상한은 즉시 반영돼요. 입장 상한은 세션 수 기준(실인원 ≈ 세션 × 2~3).</p>
    </div>
    <div className="card" style={{ border: d.settings.rsv_key?.value === "phone" ? undefined : "2px solid #c62828" }}>
      <h2 style={{ marginTop: 0 }}>예약 확인 열쇠</h2>
      <p className="muted">시작 표식에서 참가자가 넣는 번호. <b>phone</b> = 본인 휴대폰번호(예약앱에 rsv_claim_phone·rsv_release가 설치된 뒤 켜기) / <b>code</b> = 예약번호 6자리(이전 방식).</p>
      <p style={{ margin: "4px 0" }}>지금: <b style={{ fontSize: 18 }}>{d.settings.rsv_key?.value === "phone" ? "휴대폰번호 (phone)" : "예약번호 6자리 (code)"}</b></p>
      {d.settings.rsv_key?.value === "phone"
        ? <button className="btn secondary" onClick={() => confirm("예약번호 6자리 방식으로 되돌릴까요? (예약앱이 예약번호를 발급하는 경우에만)") && post({ action: "setting", key: "rsv_key", value: "code" }, "예약번호 방식으로 전환됨")}>예약번호 방식으로 되돌리기</button>
        : <button className="btn" onClick={() => confirm("휴대폰번호 방식으로 전환할까요?\n예약앱에 rsv_claim_phone·rsv_release 함수가 설치돼 있어야 시작이 됩니다.") && post({ action: "setting", key: "rsv_key", value: "phone" }, "휴대폰번호 방식으로 전환됨")}>휴대폰번호 방식으로 전환</button>}
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>개인정보 삭제</h2>
      <p className="muted">참여 기록의 휴대폰번호·성별·연령대·지역을 전부 지워요. 위 '자동 삭제일'이 지나면 저절로 실행되고, 그 전에 지우려면 여기서. <b>지우기 전에 일별 통계 CSV를 먼저 받아 두세요</b> (성별·연령대·지역 집계가 빈칸이 돼요).</p>
      <button className="btn secondary" style={{ borderColor: "#c62828", color: "#c62828" }} onClick={() => confirm("되돌릴 수 없어요. 참여 기록의 개인정보를 지금 전부 삭제할까요?") && post({ action: "purge", }, "개인정보 삭제 완료")}>지금 개인정보 삭제</button>
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>수령소 코드 비밀키</h2>
      <p className="muted">마지막 재발급 {new Date(d.desk_secret_updated_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}. 재발급하면 지금 떠 있는 코드가 즉시 무효가 되니 수령소가 한가할 때만.</p>
      <button className="btn secondary" onClick={() => confirm("현재 수령소 코드가 즉시 무효가 됩니다. 재발급할까요?") && post({ action: "rotate_secret" }, "비밀키 재발급됨 — 수령소 화면이 3초 안에 새 코드로 바뀝니다")}>비밀키 재발급</button>
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>관리자 계정·PIN</h2>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
        <tbody>{d.operators.map((o) => (
          <tr key={o.id} style={{ borderTop: "1px solid var(--line)", opacity: o.active ? 1 : 0.5 }}>
            <td style={{ padding: "6px 0" }}><b>{o.id}</b> · {o.name}</td><td>{o.role === "admin" ? "총괄" : "진행요원"}</td><td>{o.active ? "활성" : "비활성"}</td>
            <td><button className="btn secondary" style={{ margin: 0, padding: "4px 8px", fontSize: 12, width: "auto" }} onClick={() => setOp({ id: o.id, name: o.name, pin: "", role: o.role, active: o.active })}>수정</button></td>
          </tr>))}</tbody>
      </table>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
        <input style={inp} placeholder="아이디 (영문·숫자)" value={op.id} onChange={(e) => setOp({ ...op, id: e.target.value })} />
        <input style={inp} placeholder="이름" value={op.name} onChange={(e) => setOp({ ...op, name: e.target.value })} />
        <input style={inp} placeholder="PIN 4~8자리 (비우면 유지)" inputMode="numeric" value={op.pin} onChange={(e) => setOp({ ...op, pin: e.target.value.replace(/\D/g, "") })} />
        <select style={inp} value={op.role} onChange={(e) => setOp({ ...op, role: e.target.value })}><option value="staff">진행요원</option><option value="admin">총괄</option></select>
      </div>
      <label style={{ display: "block", margin: "6px 0" }}><input type="checkbox" checked={op.active} onChange={(e) => setOp({ ...op, active: e.target.checked })} /> 활성</label>
      <button className="btn" onClick={() => post({ action: "operator", ...op, pin: op.pin || null }, "계정 저장됨").then((j) => j.ok && setOp({ id: "", name: "", pin: "", role: "staff", active: true }))} disabled={!op.id || !op.name}>계정 저장</button>
      <p className="muted">진행요원 PIN = 참가자 폰 [사용] 확인창에 입력하는 번호. 총괄 PIN = 관리자 로그인. <b>운영 전 초기 PIN(000000/1111/2222)을 반드시 바꾸세요.</b></p>
    </div>
  </>);
}

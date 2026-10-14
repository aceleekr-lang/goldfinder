"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Dev = { id: string; label: string; created_by: string; created_at: string; expires_at: string; fast: boolean; check_mode: boolean; rsv_real: boolean; me: boolean };
type D = { ok: boolean; code?: string; me: string | null; devices: Dev[];
  records: { sessions: number; sessions_today: number; tickets: number; results: Record<string, number>; redeemed: number; wishes: number };
  checks: { total: number; today: number; missing: string[] } };
const t = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

// 총괄 전용 [테스트] — 테스트폰 등록·스위치·해제, 테스트 기록 삭제, 태그 점검 현황
export default function TestAdmin() {
  const [d, setD] = useState<D | null>(null);
  const [label, setLabel] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/admin/test").then((r) => r.json()).then(setD).catch(() => setD({ ok: false, code: "SERVER_ERROR" } as D));
  useEffect(() => { load(); }, []);
  const post = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true);
    try {
      const j = await (await fetch("/api/admin/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
      setMsg(j.ok ? ok : `실패 (${j.code})`); await load(); return j;
    } finally { setBusy(false); }
  };
  if (!d) return <div className="spin">불러오는 중…</div>;
  if (!d.ok) return <div className="card"><p>총괄 계정만 볼 수 있어요.</p></div>;
  const me = d.devices.find((x) => x.me);
  const sw = (dev: Dev, key: "fast" | "check" | "rsv_real", on: boolean, name: string) =>
    post({ action: "set", id: dev.id, [key]: on }, `${dev.label}: ${name} ${on ? "켜짐" : "꺼짐"}`);
  const Toggle = ({ dev, k, v, name, desc }: { dev: Dev; k: "fast" | "check" | "rsv_real"; v: boolean; name: string; desc: string }) => (
    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
      <input type="checkbox" checked={v} disabled={busy} onChange={(e) => sw(dev, k, e.target.checked, name)} style={{ width: 22, height: 22, marginTop: 2 }} />
      <span><b>{name}</b><br /><span className="muted">{desc}</span></span>
    </label>);
  const res = d.records.results;
  return (<>
    <h1>테스트 모드</h1>
    {msg ? <div className="banner">{msg}</div> : null}

    <div className="card" style={{ borderColor: me ? "#c62828" : undefined }}>
      <h2 style={{ marginTop: 0 }}>이 폰</h2>
      {me ? (<>
        <p><b style={{ color: "#c62828" }}>테스트폰으로 등록됨</b> — {me.label} · {t(me.expires_at)}까지</p>
        <Toggle dev={me} k="fast" v={me.fast} name="빠른 테스트" desc="별 사이 30초 간격·최소 참여 시간을 생략해요. 끄면 관람객과 똑같은 조건으로 체험해요." />
        <Toggle dev={me} k="check" v={me.check_mode} name="태그 점검 모드" desc="태그를 찍으면 게임 대신 '영남루별 3번 · 정상 ✓'처럼 태그 정보만 보여 주고 점검 시각을 기록해요. 설치·순찰 점검용." />
        <Toggle dev={me} k="rsv_real" v={me.rsv_real} name="실제 예약번호로 시작" desc="예약앱에서 만든 진짜 예약번호로 시작해 연동을 확인해요 (번호 1개가 사용 처리됨). 끄면 아무 6자리로 시작." />
        <button className="btn secondary" disabled={busy} onClick={async () => { await fetch("/api/test/reset", { method: "POST" }); setMsg("이 폰의 테스트 참가를 초기화했어요. 시작 표식을 찍으면 새로 시작돼요."); }}>이 폰 새 테스트 시작 (참가 초기화)</button>
        <button className="btn secondary" disabled={busy} onClick={() => confirm("이 폰의 테스트폰 등록을 해제할까요?") && post({ action: "revoke", id: me.id }, "이 폰 테스트폰 해제됨")}>이 폰 테스트폰 해제</button>
      </>) : (<>
        <p>이 폰은 <b>일반 폰</b>이에요. 관람객과 똑같이 동작합니다.</p>
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={30} placeholder="폰 이름 (예: 에이스 갤럭시)" style={{ fontSize: 16, padding: 10, width: "100%", border: "1px solid var(--line)", borderRadius: 8 }} />
        <button className="btn" disabled={busy} onClick={() => post({ action: "register", label }, "이 폰을 테스트폰으로 등록했어요 (12시간)")}>이 폰을 테스트폰으로 등록</button>
        <p className="muted">등록은 12시간 뒤 자동으로 풀려요. 다른 폰(직원 폰)도 그 폰에서 관리자로 로그인해 등록하면 돼요.</p>
      </>)}
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>테스트폰에서 달라지는 것</h2>
      <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, fontSize: 15 }}>
        <li>운영일·시간과 관계없이 언제든 시작 (관람객 폰은 그대로 "운영일 아님")</li>
        <li>예약번호는 아무 6자리 — 예약앱을 호출하지 않아요 (실제 예약번호 스위치를 켜면 진짜 번호)</li>
        <li>입장 상한에서 빠지고, 별 태그 쿨다운을 걸지 않아 관람객을 방해하지 않아요</li>
        <li>뽑기는 수령소 코드까지 실제와 같고, 결과는 <b>모의</b>(지금 진짜로 뽑으면 나올 결과) 또는 <b>지정</b>(금·2등·3등·꽝). 실제 경품 수량은 줄지 않아요</li>
        <li>모든 화면 위에 빨간 띠, 뽑기 결과에 <b>TEST</b> 표시 · 수령소 목록에도 TEST</li>
        <li>통계·결과보고·현황판 수량에서 빠져요. 아래에서 한 번에 지울 수 있어요</li>
      </ul>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>현황판 금 당첨 연출 테스트</h2>
      <p>현황판 모니터에서 <a href="/board?test=1" target="_blank">/board?test=1</a> 을 열어 두고, 테스트폰에서 <b>금(1등) 지정</b> 뽑기를 하면 5초 안에 축하 연출이 나와요. 공개 현황판(/board)은 반응하지 않아요.</p>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>오늘 태그 점검 {d.checks.today} / {d.checks.total}</h2>
      {d.checks.missing.length ? <p className="muted">아직: {d.checks.missing.slice(0, 60).join(", ")}{d.checks.missing.length > 60 ? " …" : ""}</p> : <p style={{ color: "#2e7d32", fontWeight: 700 }}>전부 점검 완료 ✓</p>}
      <p className="muted">태그 점검 모드를 켠 테스트폰으로 찍으면 올라가요. 태그별 시각은 <Link href="/admin/nfc">NFC 태그</Link> 화면에서 볼 수 있어요.</p>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>테스트 기록</h2>
      <p>세션 {d.records.sessions}건 (오늘 {d.records.sessions_today}) · 뽑기권 {d.records.tickets}장 · 결과 금 {res.g1 ?? 0} · 2등 {res.g2 ?? 0} · 3등 {res.g3 ?? 0} · 꽝 {res.card ?? 0} · 사용 처리 {d.records.redeemed} · 소원 {d.records.wishes}</p>
      <button className="btn secondary" disabled={busy || d.records.sessions === 0} onClick={() => confirm("테스트 세션·뽑기권·소원을 모두 지울까요? 실제 관람객 기록은 지워지지 않아요.") && post({ action: "purge" }, "테스트 기록을 모두 지웠어요")}>테스트 기록 전체 삭제</button>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>등록된 테스트폰 {d.devices.length}대</h2>
      {d.devices.length === 0 ? <p className="muted">없음</p> : d.devices.map((x) => (
        <div key={x.id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
          <span><b>{x.label}</b>{x.me ? " (이 폰)" : ""}<br /><span className="muted">{x.created_by} 등록 · {t(x.expires_at)}까지 · {[x.fast && "빠른", x.check_mode && "점검", x.rsv_real && "실제예약"].filter(Boolean).join("·") || "기본"}</span></span>
          <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "6px 10px", fontSize: 13 }} disabled={busy} onClick={() => post({ action: "revoke", id: x.id }, `${x.label} 해제됨`)}>해제</button>
        </div>))}
      {d.devices.length > 0 ? <button className="btn secondary" disabled={busy} onClick={() => confirm("모든 테스트폰을 해제할까요? (개장 전 권장)") && post({ action: "revoke" }, "모든 테스트폰 해제됨")}>전체 해제</button> : null}
    </div>
  </>);
}

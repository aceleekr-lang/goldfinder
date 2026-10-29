"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type D = { ok: boolean; kst_now: string; op_day: { op_date: string; open_at: string; close_at: string; last_entry: string } | null; slot?: number;
  entry_cap: number; cooldown_sec: number; stale_min: number;
  tags: { total: number; active: number; cooling: number; inactive: string[]; spare_on: string[]; gates_off: string[]; checked_today?: number }; test_today?: number;
  active_raw?: number; active_fresh?: number; stale?: number; stale_list?: { session_id: string; join_code: string; minutes: number; stars: number }[];
  started_today?: number; walkin_status?: { reserved: number; walkin: number; cap: number; full: boolean; enabled: boolean }; completed?: number; expired?: number; tickets?: Record<string, number>; draws_today?: number; results_today?: Record<string, number>;
  quota_now?: Record<string, { allocated: number; remaining: number }>; quota_day?: Record<string, { allocated: number; remaining: number }>; left_total?: Record<string, number>; quota_missing?: boolean; rsv_missing?: boolean; forecast?: { rsv: number; started: number; in_progress: number; stale: number; drawn: number; expected_remaining: number; join_rate: number | null } | null;
  wishes_today?: number; manual_ops_today?: number };

const Num = ({ label, v, warn }: { label: string; v: number | string | undefined; warn?: boolean }) => (
  <div style={{ textAlign: "center", padding: 8 }}><div style={{ fontSize: 28, fontWeight: 800, color: warn ? "#c62828" : undefined }}>{v ?? 0}</div><div className="muted">{label}</div></div>);

// 관리자 대시보드: 꼭 필요한 숫자만. 30초 갱신 (브리핑 Phase 4-2)
export default function Dashboard() {
  const [d, setD] = useState<D | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/admin/dashboard").then((r) => r.json()).then(setD).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, []);
  const endStale = async () => {
    const reason = prompt(`이탈 추정 ${d?.stale ?? 0}건을 일괄 종료합니다. 사유:`); if (!reason) return;
    const r = await fetch("/api/admin/dashboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "end_stale", reason }) });
    const j = await r.json(); setMsg(j.ok ? `${j.count}건 종료됨` : `실패 (${j.code})`); load();
  };
  if (!d) return <div className="spin">불러오는 중…</div>;
  const q = d.quota_now ?? {}, qd = d.quota_day ?? {}, tk = d.tickets ?? {};
  return (<>
    <h1>대시보드 <span className="muted" style={{ fontSize: 13 }}>{d.kst_now?.replace("T", " ").slice(0, 19)} KST · 30초 갱신</span></h1>
    {msg ? <div className="banner">{msg}</div> : null}
    {!d.op_day ? <div className="banner">오늘은 운영일이 아닙니다 — 모든 태그가 비운영 안내를 표시합니다. <Link href="/admin/opdays">운영일 관리</Link></div> : (<>
      {d.rsv_missing ? <div className="banner" style={{ background: "#fde0e0", borderColor: "#c62828" }}>오늘 예상 참여자 수(예약+현장)가 입력되지 않았어요 — 행사 시작 전에 입력해 주세요 (경품 자동 배분 기준). <Link href={`/admin/day/${d.op_day.op_date}`}>입력하기</Link></div> : null}
      {d.walkin_status ? <div className="banner" style={d.walkin_status.full ? { background: "#fde0e0", borderColor: "#c62828" } : undefined}>
        오늘 참여 인원 <b>{d.walkin_status.reserved + d.walkin_status.walkin} / {d.walkin_status.cap}</b> (사전예약 {d.walkin_status.reserved} + 현장 {d.walkin_status.walkin})
        {d.walkin_status.full ? <b> — 현장 참여 마감</b> : null}{!d.walkin_status.enabled ? " · 현장 접수 꺼짐(설정)" : null} <Link href="/admin/settings">상한 바꾸기</Link></div> : null}
      {d.forecast ? <p className="muted">오늘 예약 {d.forecast.rsv} · 시작 {d.forecast.started} · 진행 중 {d.forecast.in_progress}(이탈 추정 {d.forecast.stale}) · 뽑기 {d.forecast.drawn} · 예상 남은 뽑기 {Math.ceil(d.forecast.expected_remaining)} · 참여율 추정 {d.forecast.join_rate == null ? "-" : Math.round(d.forecast.join_rate * 100) + "%"}</p> : null}
      {d.quota_missing ? <div className="banner" style={{ background: "#fde0e0", borderColor: "#c62828" }}>오늘 당첨 수량 배정이 없습니다 — 뽑기가 전부 참가상으로 나갑니다. <Link href={`/admin/day/${d.op_day.op_date}`}>배정하기</Link></div> : null}
      <div className="card">
        <p style={{ margin: 0 }}><b>{d.op_day.op_date}</b> {d.op_day.open_at.slice(0, 5)}~{d.op_day.close_at.slice(0, 5)} · 현재 {d.slot}구간 · 입장 상한 {d.entry_cap} · 쿨다운 {d.cooldown_sec}초</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Num label="참가 중" v={d.active_fresh} warn={(d.active_fresh ?? 0) >= d.entry_cap} />
          <Num label={`이탈 추정 (${d.stale_min}분+)`} v={d.stale} warn={(d.stale ?? 0) > 0} />
          <Num label="오늘 시작" v={d.started_today} />
          <Num label="완주(뽑기권)" v={(tk.issued ?? 0) + (tk.drawn ?? 0) + (tk.redeemed ?? 0) + (tk.void ?? 0)} />
          <Num label="지급 대기" v={tk.drawn} warn={(tk.drawn ?? 0) > 0} />
          <Num label="지급 완료" v={tk.redeemed} />
        </div>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>당첨 수량 (현재 창 잔여/배정 · 오늘 전체)</h2>
        <p className="muted">당일 잔여(이월 포함): 1등 {d.left_total?.g1 ?? 0} · 2등 {d.left_total?.g2 ?? 0} · 3등 {d.left_total?.g3 ?? 0} — 현황판과 같은 값</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {(["g1", "g2", "g3"] as const).map((g) => <Num key={g} label={{ g1: "1등", g2: "2등", g3: "3등" }[g] + ` · 오늘 ${qd[g]?.remaining ?? 0}/${qd[g]?.allocated ?? 0}`} v={`${q[g]?.remaining ?? 0}/${q[g]?.allocated ?? 0}`} warn={g === "g1" && (q.g1?.remaining ?? 0) === 0} />)}
        </div>
        <p className="muted">오늘 뽑기 {d.draws_today ?? 0}건 (1등 {d.results_today?.g1 ?? 0} · 2등 {d.results_today?.g2 ?? 0} · 3등 {d.results_today?.g3 ?? 0} · 참가상 {d.results_today?.card ?? 0}) · 소원 {d.wishes_today ?? 0} · 수기 처리 {d.manual_ops_today ?? 0}건</p>
      </div>
      {(d.stale_list?.length ?? 0) > 0 ? (<div className="card">
        <h2 style={{ marginTop: 0 }}>이탈 추정 {d.stale}건</h2>
        <p className="muted">{d.stale_list!.map((s) => `${s.join_code}(${s.minutes}분·별${s.stars})`).join(" · ")}{(d.stale ?? 0) > 20 ? " …" : ""}</p>
        <button className="btn secondary" onClick={endStale}>이탈 추정 일괄 종료</button>
      </div>) : null}
    </>)}
    <div className="card">
      <h2 style={{ marginTop: 0 }}>태그 <Link href="/admin/tags" style={{ fontSize: 14, fontWeight: 400 }}>자세히 보기 →</Link></h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Num label="별 태그 활성" v={`${d.tags.active}/${d.tags.total}`} warn={d.tags.active < d.tags.total} />
        <Num label="쿨다운 중" v={d.tags.cooling} />
        <Num label="예비 투입" v={d.tags.spare_on.length} />
      </div>
      {d.tags.inactive.length ? <p className="muted">비활성: {d.tags.inactive.join(", ")}</p> : null}
      {d.tags.gates_off.length ? <p style={{ color: "#c62828" }}>시작·출구 표식 비활성: {d.tags.gates_off.join(", ")}</p> : null}
      <p className="muted">오늘 태그 점검 {d.tags.checked_today ?? 0}개{d.test_today ? ` · 오늘 테스트 세션 ${d.test_today}건(통계 제외)` : ""} · <Link href="/admin/test">테스트 모드</Link></p>
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>현황판 금 당첨 연출</h2>
      <p className="muted"><a href="/board?preview=1" target="_blank">연출 미리보기 (새 창)</a> — 현황판 화면에서 키보드 <b>G</b>를 눌러도 재생됩니다. 개장 전 현황판의 [▶ 현황판 시작] 버튼을 한 번 눌러야 소리가 납니다.</p>
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>결과보고용 CSV</h2>
      <p className="muted"><a href="/api/admin/export?kind=days">일별 참가·지급 집계</a> · <a href="/api/admin/export?kind=tags">태그별 인증 현황</a> · <a href="/api/admin/export?kind=draws">배출 로그</a></p>
    </div>
  </>);
}

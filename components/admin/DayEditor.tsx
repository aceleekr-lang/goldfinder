"use client";
import { useEffect, useState } from "react";

type Slot = { slot: number; starts_at: string; label: string | null; forecast: number };
type W = { id: number; grade: string; start: string; end: string; quota: number; drawn: number; final_gold: boolean; final_day: boolean };
type Detail = { ok: boolean; code?: string; day: { op_date: string; open_at: string; last_entry: string; close_at: string; grace_min: number; active: boolean } | null;
  slots: Slot[]; prizes: Record<string, string>; windows: W[]; draws: number };

const GRADES = ["g1", "g2", "g3"] as const;
const GRADE_KO: Record<string, string> = { g1: "1등", g2: "2등", g3: "3등", card: "참가상" };
const hm = (t: string) => (t ?? "").slice(0, 5);

// 운영일 상세: 운영시간 / 시간대 라벨(표시용) / 경품 이름 / 경품 창(배출 엔진) / 다른 날 복사
export default function DayEditor({ date }: { date: string }) {
  const [d, setD] = useState<Detail | null>(null);
  const [day, setDay] = useState({ open_at: "19:00", last_entry: "21:00", close_at: "22:00", grace_min: 10, active: true });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [prizes, setPrizes] = useState<Record<string, string>>({});
  const [wins, setWins] = useState<W[]>([]);
  const [reason, setReason] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const apply = (j: Detail) => {
    setD(j);
    if (j.day) setDay({ open_at: hm(j.day.open_at), last_entry: hm(j.day.last_entry), close_at: hm(j.day.close_at), grace_min: j.day.grace_min, active: j.day.active });
    setSlots((j.slots ?? []).map((s) => ({ ...s, starts_at: hm(s.starts_at) })));
    setPrizes(j.prizes ?? {});
    setWins(j.windows ?? []);
  };
  const load = () => fetch(`/api/admin/opdays/${date}`).then((r) => r.json()).then(apply);
  useEffect(() => { load(); }, [date]);   // eslint-disable-line

  const post = async (url: string, body: unknown, okMsg: string) => {
    setMsg(null);
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = (await r.json()) as Detail;
    if (j.ok) { apply(j); setMsg(okMsg); }
    else setMsg({ FORBIDDEN: "총괄 계정만 변경할 수 있어요.", TIME_ORDER: "시간 순서가 맞지 않아요 (개장 < 최종입장 < 마감).", SLOT_TIME_ORDER: "slot 시작 시각은 앞 slot보다 늦고 마감 전이어야 해요.",
      SLOT_NUMBERING: "slot 번호는 1부터 순서대로여야 해요.", REASON_REQUIRED: "변경 사유를 적어 주세요.", WINDOW_TIME_ORDER: "창 시작이 끝보다 빨라야 해요.",
      WINDOW_OVERLAP: "같은 등급의 창이 서로 겹칠 수 없어요.", DAY_HAS_DRAWS: "이 날은 이미 배출 기록이 있어요 — 창 전체 교체 대신 창별 수량을 조정해 주세요." }[j.code ?? ""] ?? `저장 실패 (${j.code})`);
  };

  if (!d) return <div className="spin">불러오는 중…</div>;
  if (!d.day) return <><h1>{date}</h1><div className="card"><p>운영일이 아니에요. 목록에서 추가해 주세요.</p></div></>;

  const saveDay = () => post("/api/admin/opdays", { op_date: date, ...day, grace_min: Number(day.grace_min) }, "운영시간 저장됨");
  const saveSlots = () => post(`/api/admin/opdays/${date}`, { action: "slots", slots: slots.map((s, i) => ({ ...s, slot: i + 1, forecast: Number(s.forecast) })) }, "시간대 저장됨");
  const savePrizes = () => post(`/api/admin/opdays/${date}`, { action: "prizes", prizes }, "경품 이름 저장됨");
  const saveWindows = () => post(`/api/admin/opdays/${date}`, { action: "windows", reason,
    windows: wins.map((w) => ({ grade: w.grade, start: w.start, end: w.end, quota: Number(w.quota), final_gold: w.final_gold, final_day: w.final_day })) }, "경품 창 저장됨 (이력 기록)");
  const saveOneQuota = (w: W) => post(`/api/admin/opdays/${date}`, { action: "window_quota", id: w.id, quota: Number(w.quota), reason }, "창 수량 변경됨 (이력 기록)");
  const copy = () => post(`/api/admin/opdays/${date}`, { action: "copy", from: copyFrom }, `${copyFrom} 설정을 복사했어요`);
  const total = (g: string) => wins.filter((w) => w.grade === g).reduce((n, w) => n + Number(w.quota), 0);
  const inp = { fontSize: 16, padding: 8, border: "1px solid var(--line)", borderRadius: 8, width: "100%" } as const;

  return (<>
    <h1>{date} {day.active ? "" : "(비활성)"}</h1>
    {msg ? <div className="banner">{msg}</div> : null}
    {d.draws > 0 ? <p className="muted">이 날 뽑기 {d.draws}건 진행됨 — 시간대·배정 변경은 신중히.</p> : null}

    <div className="card">
      <h2 style={{ marginTop: 0 }}>운영시간</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label>개장<input type="time" style={inp} value={day.open_at} onChange={(e) => setDay({ ...day, open_at: e.target.value })} /></label>
        <label>최종 입장<input type="time" style={inp} value={day.last_entry} onChange={(e) => setDay({ ...day, last_entry: e.target.value })} /></label>
        <label>마감(별 태그)<input type="time" style={inp} value={day.close_at} onChange={(e) => setDay({ ...day, close_at: e.target.value })} /></label>
        <label>출구·뽑기 유예(분)<input type="number" min={0} max={60} style={inp} value={day.grace_min} onChange={(e) => setDay({ ...day, grace_min: Number(e.target.value) })} /></label>
      </div>
      <label style={{ display: "block", marginTop: 8 }}><input type="checkbox" checked={day.active} onChange={(e) => setDay({ ...day, active: e.target.checked })} /> 운영일 활성 (끄면 모든 태그가 비운영 안내)</label>
      <button className="btn" onClick={saveDay}>운영시간 저장</button>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>시간대 라벨 (표시용)</h2>
      <p className="muted">현황 라벨('1구간' 등)에만 쓰여요. 경품 배출은 아래 '경품 창'이 전담합니다.</p>
      {slots.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 40px", gap: 6, alignItems: "center", margin: "6px 0" }}>
          <b>{i + 1}</b>
          <input type="time" style={inp} value={s.starts_at} disabled={i === 0} onChange={(e) => setSlots(slots.map((x, k) => k === i ? { ...x, starts_at: e.target.value } : x))} />
          <input style={inp} value={s.label ?? ""} placeholder="이름" onChange={(e) => setSlots(slots.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} />
          <button className="btn secondary" style={{ padding: 6, margin: 0, fontSize: 14 }} disabled={i === 0} onClick={() => setSlots(slots.filter((_, k) => k !== i))}>×</button>
        </div>))}
      <button className="btn secondary" onClick={() => setSlots([...slots, { slot: slots.length + 1, starts_at: "", label: "", forecast: 0 }])}>시간대 추가</button>
      <button className="btn" onClick={saveSlots}>시간대 저장</button>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>경품 이름 (이 날짜 전용)</h2>
      {["g1", "g2", "g3", "card"].map((g) => (
        <label key={g} style={{ display: "block", margin: "6px 0" }}>{GRADE_KO[g]}<input style={inp} value={prizes[g] ?? ""} onChange={(e) => setPrizes({ ...prizes, [g]: e.target.value })} /></label>))}
      <button className="btn" onClick={savePrizes}>경품 이름 저장</button>
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>경품 창 (배출 엔진)</h2>
      <p className="muted">창 길이를 (수량+1)로 나눠 경계 시각마다 1개씩 순서대로 열려요 · 마감 15분 전 잔여 전량 개방 · 2·3등 잔여는 다음 창(익일 1구간 포함)으로 자동 이월 · 금은 최종일 창에만 과거 미배출 합산.</p>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse", textAlign: "center" }}>
        <thead><tr style={{ color: "var(--muted)" }}><th style={{ textAlign: "left" }}>등급</th><th>시작</th><th>끝</th><th>수량</th><th>배출</th><th>표시</th><th /></tr></thead>
        <tbody>{wins.map((w, i) => (
          <tr key={w.id ?? i} style={{ borderTop: "1px solid var(--line)" }}>
            <td style={{ textAlign: "left", padding: "6px 0" }}>{w.id ? <b>{GRADE_KO[w.grade]}</b> :
              <select style={inp} value={w.grade} onChange={(e) => setWins(wins.map((x, k) => k === i ? { ...x, grade: e.target.value } : x))}>{GRADES.map((g) => <option key={g} value={g}>{GRADE_KO[g]}</option>)}</select>}</td>
            <td><input type="time" style={{ ...inp, width: 96 }} value={w.start} disabled={d.draws > 0} onChange={(e) => setWins(wins.map((x, k) => k === i ? { ...x, start: e.target.value } : x))} /></td>
            <td><input type="time" style={{ ...inp, width: 96 }} value={w.end} disabled={d.draws > 0} onChange={(e) => setWins(wins.map((x, k) => k === i ? { ...x, end: e.target.value } : x))} /></td>
            <td><input type="number" min={0} style={{ ...inp, width: 64, textAlign: "center" }} value={w.quota} onChange={(e) => setWins(wins.map((x, k) => k === i ? { ...x, quota: Number(e.target.value) } : x))} /></td>
            <td className="muted">{w.drawn}</td>
            <td className="muted">{w.final_gold ? "최종금 " : ""}{w.final_day ? "재배분" : ""}</td>
            <td>{d.draws > 0 ? <button className="btn secondary" style={{ padding: 6, margin: 0, fontSize: 13 }} onClick={() => saveOneQuota(w)} disabled={reason.trim().length < 2}>수량만 저장</button>
                             : <button className="btn secondary" style={{ padding: 6, margin: 0, fontSize: 13 }} onClick={() => setWins(wins.filter((_, k) => k !== i))}>×</button>}</td>
          </tr>))}</tbody>
      </table>
      <p className="muted">합계 — 1등 {total("g1")} · 2등 {total("g2")} · 3등 {total("g3")}</p>
      {d.draws === 0 ? <button className="btn secondary" onClick={() => setWins([...wins, { id: 0, grade: "g2", start: "19:50", end: "21:00", quota: 0, drawn: 0, final_gold: false, final_day: false } as W])}>창 추가 </button> : null}
      {wins.some((w) => !["g1","g2","g3"].includes(w.grade)) ? <p>등급 값이 잘못된 창이 있어요.</p> : null}
      <input style={inp} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="변경 사유 (필수, 이력에 남습니다)" />
      {d.draws > 0 ? <p className="muted">이 날은 배출 기록이 있어 창 전체 교체는 막혀 있어요 — 각 줄의 [수량만 저장]으로 조정하세요.</p>
                   : <button className="btn" onClick={saveWindows} disabled={reason.trim().length < 2}>경품 창 전체 저장</button>}
    </div>

    <div className="card">
      <h2 style={{ marginTop: 0 }}>다른 운영일 설정 복사</h2>
      <p className="muted">시간·시간대·경품 이름·배정 수량을 가져와 이 날짜에 덮어써요. 뽑기 기록이 있는 날에는 불가.</p>
      <input type="date" style={inp} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} />
      <button className="btn secondary" onClick={copy} disabled={!copyFrom}>복사해 오기</button>
    </div>
  </>);
}

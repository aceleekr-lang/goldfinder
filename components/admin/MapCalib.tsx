"use client";
import { useEffect, useState } from "react";
import GardenMap from "@/components/GardenMap";
import { fitAffine, type CalPoint } from "@/lib/mapData";

type P = CalPoint & { id: number; acc: number | null; label: string | null };
const SUGGEST = ["시작 표식 (매표소 옆)", "③ 별의 물결 앞", "⑥ 빛의 화원 앞", "⑦ 오로라의 숲 앞", "⑨ 빛의 터널 입구"];

// 총괄 전용 [지도 보정] — 현장에서 안내도 위 지점을 탭하고 그 자리의 GPS를 10초 측정해 기록. 4곳 이상 권장
export default function MapCalib() {
  const [pts, setPts] = useState<P[] | null>(null);
  const [mark, setMark] = useState<{ x: number; y: number } | null>(null);
  const [label, setLabel] = useState(SUGGEST[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const load = () => fetch("/api/map", { cache: "no-store" }).then((r) => r.json()).then((j) => setPts((j.points ?? []).map((p: Record<string, string | number | null>) => ({ id: +p.id!, px: +p.px!, py: +p.py!, lat: +p.lat!, lng: +p.lng!, acc: p.acc == null ? null : +p.acc, label: (p.label as string) ?? null }))));
  useEffect(() => { load(); }, []);
  const fit = pts ? fitAffine(pts) : null;

  const measure = () => {
    if (!mark) { setMsg("먼저 지도에서 지금 서 있는 곳을 탭하세요."); return; }
    if (!("geolocation" in navigator)) { setMsg("이 기기는 위치 기능이 없어요."); return; }
    setBusy(true); setMsg("GPS 측정 중… 10초 동안 제자리에 서 있어 주세요.");
    const got: GeolocationCoordinates[] = [];
    const w = navigator.geolocation.watchPosition((p) => { got.push(p.coords); setMsg(`GPS 측정 중… ${got.length}회 · 현재 오차 ${Math.round(p.coords.accuracy)}m`); },
      (e) => setMsg(e.code === 1 ? "위치 권한을 허용해 주세요." : "위치를 찾지 못했어요."), { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    setTimeout(async () => {
      navigator.geolocation.clearWatch(w);
      if (got.length === 0) { setBusy(false); setMsg("GPS를 받지 못했어요. 하늘이 트인 곳에서 다시 시도하세요."); return; }
      const best = Math.min(...got.map((c) => c.accuracy));
      const use = got.filter((c) => c.accuracy <= best * 1.5);
      const wsum = use.reduce((s, c) => s + 1 / (c.accuracy ** 2), 0);
      const lat = use.reduce((s, c) => s + c.latitude / (c.accuracy ** 2), 0) / wsum, lng = use.reduce((s, c) => s + c.longitude / (c.accuracy ** 2), 0) / wsum;
      const r = await fetch("/api/admin/map", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "add", px: mark.x, py: mark.y, lat, lng, acc: Math.round(best * 10) / 10, label }) });
      const j = await r.json(); setBusy(false);
      setMsg(j.ok ? `기록됨: ${label} (오차 약 ${Math.round(best)}m${best > 15 ? " — 오차가 커요. 지우고 다시 재는 걸 권장" : ""})` : `실패 (${j.code})`);
      setMark(null); const next = SUGGEST[(SUGGEST.indexOf(label) + 1) % SUGGEST.length]; setLabel(next); load();
    }, 10000);
  };
  const del = async (id: number) => {
    if (!confirm("이 보정점을 지울까요?")) return;
    const j = await (await fetch("/api/admin/map", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "del", id }) })).json();
    setMsg(j.ok ? "삭제됨" : `실패 (${j.code})`); load();
  };

  if (!pts) return <div className="spin">불러오는 중…</div>;
  return (<>
    <h1>지도 위치 보정</h1>
    {msg ? <div className="banner">{msg}</div> : null}
    <div className="card">
      <p style={{ marginTop: 0 }}><b>현장에서 한 번만</b> 하면 됩니다. 참가자 지도의 "내 위치"가 이 보정점으로 계산돼요.</p>
      <ol style={{ paddingLeft: 20, lineHeight: 1.7, margin: 0 }}>
        <li>아래 지점 중 한 곳에 실제로 가서 섭니다.</li>
        <li>지도를 확대해 <b>지금 서 있는 곳을 정확히 탭</b> (빨간 십자).</li>
        <li><b>[이 위치 기록]</b> → 10초 동안 제자리에 서 있기.</li>
        <li>정원 네 귀퉁이처럼 <b>서로 멀리 떨어진 4곳 이상</b> 반복하세요.</li>
      </ol>
      <p className="muted">추천 지점: {SUGGEST.join(" · ")}</p>
    </div>
    <GardenMap gps onTap={(x, y) => setMark({ x, y })} mark={mark} calib={pts} height="55vh" />
    <div className="card">
      <label style={{ display: "block", fontWeight: 700 }}>지점 이름</label>
      <select value={label} onChange={(e) => setLabel(e.target.value)} style={{ fontSize: 16, padding: 8, width: "100%", margin: "6px 0" }}>
        {SUGGEST.map((s) => <option key={s}>{s}</option>)}<option>기타 지점</option>
      </select>
      <p className="muted" style={{ margin: "4px 0" }}>{mark ? `선택한 지도 위치: (${mark.x}, ${mark.y})` : "아직 지도 위치를 선택하지 않았어요."}</p>
      <button className="btn" onClick={measure} disabled={busy || !mark}>{busy ? "측정 중…" : "이 위치 기록 (10초)"}</button>
    </div>
    <div className="card">
      <h2 style={{ marginTop: 0 }}>보정점 {pts.length}곳 {pts.length >= 4 && fit ? <span className="muted" style={{ fontSize: 14 }}>· 평균 어긋남 약 {Math.round(fit.rmsMeters)}m {fit.rmsMeters > 10 ? "(큼 — 오차 큰 점을 지우고 다시)" : "(양호)"}</span> : null}</h2>
      {pts.length < 3 ? <p style={{ color: "#c62828" }}>3곳 이상 기록해야 참가자 지도에 내 위치가 보여요 (권장 4곳 이상).</p> : null}
      {pts.map((p) => (
        <div key={p.id} style={{ borderTop: "1px solid var(--line)", padding: "6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span>{p.label ?? "지점"} <span className="muted">· 지도({Math.round(p.px)}, {Math.round(p.py)}) · 오차 {p.acc ?? "?"}m</span></span>
          <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "4px 10px", fontSize: 13 }} onClick={() => del(p.id)}>삭제</button>
        </div>))}
      <p className="muted">확인: 위 지도에서 [📍 내 위치]를 켜고 걸어 보면서 파란 점이 실제 위치와 맞는지 보세요.</p>
    </div>
  </>);
}

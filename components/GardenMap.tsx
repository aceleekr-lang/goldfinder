"use client";
import { useEffect, useRef, useState } from "react";
import { MAP_W, MAP_H, MAP_IMG, ZONES, SPOTS, LINKS, MAP_CENTER, fitAffine, type Fit, type CalPoint } from "@/lib/mapData";

// 별빛정원 안내도 위에 별 구역·동선·시작/출구/수령소·내 위치(GPS)를 겹쳐 그린다 (2026-10-15)
//   stars: 깨운 색은 구역에 ✓ / gps: [내 위치] 버튼 표시 / onTap: 관리자 보정 화면에서 지도 좌표 선택
type Props = { stars?: Record<string, string>; gps?: boolean; onTap?: (x: number, y: number) => void; mark?: { x: number; y: number } | null;
  calib?: CalPoint[] | null; height?: number | string };
const ZOOMS = [1, 1.6, 2.4, 3.4];

export function useCalib(given?: CalPoint[] | null) {
  const [pts, setPts] = useState<CalPoint[] | null>(given ?? null);
  useEffect(() => {
    if (given !== undefined) { setPts(given); return; }
    fetch("/api/map").then((r) => r.json()).then((j) => setPts((j.points ?? []).map((p: Record<string, string>) => ({ px: +p.px, py: +p.py, lat: +p.lat, lng: +p.lng })))).catch(() => setPts([]));
  }, [given]);
  return pts;
}

export default function GardenMap({ stars, gps = true, onTap, mark, calib, height = "62vh" }: Props) {
  const box = useRef<HTMLDivElement | null>(null);
  const [zi, setZi] = useState(2);
  const pts = useCalib(calib);
  const fit: Fit | null = pts ? fitAffine(pts) : null;
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const watch = useRef<number | null>(null);

  const centerOn = (x: number, y: number) => {
    const el = box.current; if (!el) return;
    const w = el.clientWidth * ZOOMS[zi];
    el.scrollLeft = (x / MAP_W) * w - el.clientWidth / 2;
    el.scrollTop = (y / MAP_H) * (w * MAP_H / MAP_W) - el.clientHeight / 2;
  };
  useEffect(() => { const t = setTimeout(() => centerOn(MAP_CENTER.x, MAP_CENTER.y), 30); return () => clearTimeout(t); }, [zi]);   // eslint-disable-line
  useEffect(() => () => { if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current); }, []);

  const toggleGps = () => {
    if (on) { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); watch.current = null; setOn(false); setPos(null); setMsg(null); return; }
    if (!("geolocation" in navigator)) { setMsg("이 휴대폰은 위치 기능을 쓸 수 없어요."); return; }
    setOn(true); setMsg("위치 확인 중… (하늘이 트인 곳에서 더 정확해요)");
    watch.current = navigator.geolocation.watchPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }); setMsg(null); },
      (e) => { setMsg(e.code === 1 ? "위치 권한이 꺼져 있어요. 브라우저 설정에서 위치를 허용해 주세요." : "위치를 찾지 못했어요. 잠시 후 다시 눌러 주세요."); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  };
  const me = pos && fit ? fit.toPx(pos.lat, pos.lng) : null;
  const inside = me && me.x > -200 && me.x < MAP_W + 200 && me.y > -200 && me.y < MAP_H + 200;
  const tap = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onTap) return;
    const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    onTap(Math.round(((e.clientX - r.left) / r.width) * MAP_W), Math.round(((e.clientY - r.top) / r.height) * MAP_H));
  };
  const zone = (z: (typeof ZONES)[number]) => {
    const done = stars?.[z.color] === "won";
    const d = "M" + z.pts.map((p) => p.join(",")).join(" L");
    const last = z.pts[z.pts.length - 1], prev = z.pts[z.pts.length - 2];
    const ang = Math.atan2(last[1] - prev[1], last[0] - prev[0]) * 180 / Math.PI;
    const [lx, ly] = z.label;
    return (
      <g key={z.n} opacity={done ? 0.55 : 1}>
        <path d={d} stroke="#141B33" strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
        <path d={d} stroke={z.hex} strokeWidth={48} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${last[0]},${last[1]}) rotate(${ang})`}><path d="M-6,-20 L22,0 L-6,20 Z" fill="#141B33" /></g>
        <g transform={`translate(${lx},${ly})`}>
          <rect x={0} y={0} width={230} height={86} rx={18} fill="#141B33" stroke={z.hex} strokeWidth={6} opacity={0.94} />
          <circle cx={40} cy={43} r={22} fill={z.hex} stroke="#fff" strokeWidth={3} />
          <text x={40} y={53} textAnchor="middle" fontSize={30} fontWeight={900} fill={z.color === "white" || z.color === "yellow" ? "#141B33" : "#fff"}>{done ? "✓" : z.n}</text>
          <text x={74} y={38} fontSize={30} fontWeight={800} fill="#fff">{z.name}</text>
          <text x={74} y={72} fontSize={26} fill={z.color === "white" ? "#ddd" : z.hex}>{z.n}구역 · {z.word}</text>
        </g>
      </g>);
  };
  const spot = (x: number, y: number, t: string, fill: string, label: string, dx: number, dy: number) => (
    <g>
      <circle cx={x} cy={y} r={26} fill={fill} stroke="#fff" strokeWidth={5} />
      <text x={x} y={y + 10} textAnchor="middle" fontSize={28} fontWeight={900} fill="#fff">{t}</text>
      <g transform={`translate(${x + dx},${y + dy})`}>
        <rect x={0} y={-30} width={label.length * 30 + 24} height={44} rx={10} fill="#141B33" opacity={0.92} />
        <text x={12} y={2} fontSize={28} fontWeight={800} fill="#fff">{label}</text>
      </g>
    </g>);

  return (
    <div>
      <div ref={box} style={{ height, overflow: "auto", borderRadius: 12, border: "1px solid var(--line)", background: "#3d5a8a", WebkitOverflowScrolling: "touch" }}>
        <div style={{ position: "relative", width: `${ZOOMS[zi] * 100}%`, aspectRatio: `${MAP_W} / ${MAP_H}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MAP_IMG} alt="영남루 별빛정원 안내도" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} draggable={false} />
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: onTap ? "crosshair" : "default" }} onClick={tap}>
            {LINKS.map((l, i) => <path key={i} d={"M" + l.map((p) => p.join(",")).join(" L")} stroke="#fff" strokeWidth={9} strokeDasharray="18 14" fill="none" opacity={0.9} strokeLinecap="round" />)}
            {ZONES.map(zone)}
            {spot(SPOTS.start.x, SPOTS.start.y, "S", "#2e7d32", "시작 표식", -260, 70)}
            {spot(SPOTS.exit.x + 18, SPOTS.exit.y, "E", "#c62828", "출구", -60, -48)}
            {spot(SPOTS.prize.x - 30, SPOTS.prize.y - 4, "★", "#b8862a", "경품 수령소", -230, 62)}
            {mark ? <g><circle cx={mark.x} cy={mark.y} r={30} fill="none" stroke="#ff1744" strokeWidth={8} /><path d={`M${mark.x - 45},${mark.y} H${mark.x + 45} M${mark.x},${mark.y - 45} V${mark.y + 45}`} stroke="#ff1744" strokeWidth={5} /></g> : null}
            {me && inside ? (<g>
              <circle cx={me.x} cy={me.y} r={Math.max(24, (pos?.acc ?? 0) * (fit?.pxPerMeter ?? 0))} fill="rgba(33,150,243,.18)" stroke="rgba(33,150,243,.7)" strokeWidth={4} />
              <circle cx={me.x} cy={me.y} r={20} fill="#2196F3" stroke="#fff" strokeWidth={7} />
            </g>) : null}
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "6px 14px", fontSize: 18 }} onClick={() => setZi(Math.max(0, zi - 1))} disabled={zi === 0} aria-label="축소">－</button>
        <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "6px 14px", fontSize: 18 }} onClick={() => setZi(Math.min(ZOOMS.length - 1, zi + 1))} disabled={zi === ZOOMS.length - 1} aria-label="확대">＋</button>
        {gps ? <button className="btn" style={{ width: "auto", margin: 0, padding: "8px 14px", fontSize: 15, marginLeft: "auto", background: on ? "#2196F3" : undefined, borderColor: on ? "#2196F3" : undefined }}
          onClick={toggleGps}>{on ? "내 위치 끄기" : "📍 내 위치"}</button> : null}
        {gps && me && inside ? <button className="btn secondary" style={{ width: "auto", margin: 0, padding: "8px 12px", fontSize: 14 }} onClick={() => centerOn(me.x, me.y)}>내 위치로</button> : null}
      </div>
      {gps && on ? (
        <p className="muted" style={{ margin: "6px 0 0" }}>
          {msg ?? (!fit ? "지도 위치 보정 전이라 아직 내 위치를 지도에 표시할 수 없어요." : !inside ? "지금은 정원 밖에 있어요." : `파란 점이 내 위치예요 (오차 약 ${Math.round(pos?.acc ?? 0)}m${(pos?.acc ?? 0) > 25 ? " — 정확도가 낮아요. 잠시 기다리면 좋아져요" : ""}).`)}
        </p>) : null}
    </div>
  );
}

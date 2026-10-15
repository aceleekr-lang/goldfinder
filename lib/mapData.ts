// 별빛정원 안내도 지도 데이터 (2026-10-15 확정). 좌표는 안내도 원본 그림(2048×1447) 픽셀 기준
//   구역: 한 구역에 한 색 별 8개 — 동선 ①→⑨ 한 방향 (역주행 금지)
//   시작 표식 J8-19 · 출구 표식 K7-5 · 경품 수령소 K7-4 (사용자가 격자 지도에서 지정)
export const MAP_W = 2048, MAP_H = 1447;
export const MAP_IMG = "/img/garden-map.webp";

export type Zone = { n: number; color: string; name: string; word: string; hex: string; place: string; pts: [number, number][]; label: [number, number] };
export const ZONES: Zone[] = [
  { n: 1, color: "yellow", name: "영남루별", word: "노랑", hex: "#F2C14E", place: "① 별의 마당 · ② 별의 선율", pts: [[1044, 913], [1072, 911], [1137, 906], [1208, 908], [1239, 913]] , label: [1097, 956] },
  { n: 2, color: "red", name: "아리랑별", word: "빨강", hex: "#E05A4E", place: "③ 별의 물결 → ④ 숲 속의 별빛", pts: [[1434, 922], [1454, 881], [1495, 835], [1520, 788], [1528, 717], [1536, 660]] , label: [1200, 760] },
  { n: 3, color: "white", name: "달빛별", word: "흰색", hex: "#F4F1E8", place: "④ 숲 속의 별빛 → ⑥ 빛의 화원", pts: [[1539, 609], [1551, 568], [1559, 512], [1572, 456], [1551, 404], [1536, 381]] , label: [1622, 426] },
  { n: 4, color: "teal", name: "밀양별", word: "파랑", hex: "#2F6FE4", place: "⑥ 빛의 화원 → ⑦ 오로라의 숲", pts: [[1507, 338], [1475, 309], [1439, 326], [1395, 350]] , label: [1415, 189] },
  { n: 5, color: "orange", name: "소원별", word: "주황", hex: "#F08A3C", place: "⑦ 오로라의 숲 → ⑧ 이터널 밀양", pts: [[1354, 394], [1323, 440], [1282, 512], [1234, 561], [1208, 582]] , label: [1270, 600] },
];
export const SPOTS = {
  start: { x: 970, y: 770, label: "시작 표식" },
  exit: { x: 1090, y: 610, label: "출구 표식" },
  prize: { x: 1070, y: 610, label: "경품 수령소" },
};
// 구역 사이 이동 (점선 화살표) — 시작 → 1구역 → ③ → 2구역 … → 5구역 → 출구 → ⑨
export const LINKS: [number, number][][] = [
  [[970, 770], [1000, 840], [1044, 913]],
  [[1239, 913], [1330, 935], [1423, 965], [1434, 922]],
  [[1536, 660], [1539, 609]],
  [[1536, 381], [1529, 360], [1507, 338]],
  [[1395, 350], [1369, 364], [1354, 394]],
  [[1208, 582], [1150, 600], [1090, 610]],
];
// 처음 보여 줄 중심 (정원 가운데)
export const MAP_CENTER = { x: 1290, y: 640 };

// ---------- GPS ↔ 지도 보정 (관리자가 현장에서 찍은 보정점으로 최소제곱 아핀 변환) ----------
export type CalPoint = { px: number; py: number; lat: number; lng: number };
export type Fit = { toPx: (lat: number, lng: number) => { x: number; y: number }; pxPerMeter: number; rmsMeters: number };

function solve3(A: number[][], b: number[]): number[] | null {
  // 3×3 가우스 소거
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

export function fitAffine(pts: CalPoint[]): Fit | null {
  if (pts.length < 3) return null;
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length, lng0 = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  const mLat = 111320, mLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  // 미터 단위 지역 좌표 (동 e, 북 n) → 픽셀: x = a·e + b·n + c
  const rows = pts.map((p) => [(p.lng - lng0) * mLng, (p.lat - lat0) * mLat, 1]);
  const AtA = [0, 1, 2].map((i) => [0, 1, 2].map((j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
  const Atx = [0, 1, 2].map((i) => rows.reduce((s, r, k) => s + r[i] * pts[k].px, 0));
  const Aty = [0, 1, 2].map((i) => rows.reduce((s, r, k) => s + r[i] * pts[k].py, 0));
  const cx = solve3(AtA, Atx), cy = solve3(AtA, Aty);
  if (!cx || !cy) return null;
  const toPx = (lat: number, lng: number) => {
    const e = (lng - lng0) * mLng, n = (lat - lat0) * mLat;
    return { x: cx[0] * e + cx[1] * n + cx[2], y: cy[0] * e + cy[1] * n + cy[2] };
  };
  const pxPerMeter = (Math.hypot(cx[0], cy[0]) + Math.hypot(cx[1], cy[1])) / 2;
  const rmsPx = Math.sqrt(pts.reduce((s, p) => { const q = toPx(p.lat, p.lng); return s + (q.x - p.px) ** 2 + (q.y - p.py) ** 2; }, 0) / pts.length);
  return { toPx, pxPerMeter, rmsMeters: pxPerMeter > 0 ? rmsPx / pxPerMeter : 0 };
}

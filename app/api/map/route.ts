import { rpc } from "@/lib/db";
import { json, serverError } from "@/lib/session";

// 지도 위치 보정점 (공개) — 참가자 폰이 GPS 좌표를 안내도 위치로 바꿀 때 사용. 개인정보 없음
export async function GET() {
  try {
    const r = await rpc("map_points_get", []);
    return json(r);   // no-store (보정 직후 바로 반영)
  } catch (e) { return serverError(e); }
}

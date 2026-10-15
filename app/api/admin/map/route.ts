import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// 총괄 전용: 지도 위치 보정점 기록·삭제
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    let r;
    if (b.action === "add") r = await rpc("admin_map_point_add", [Number(b.px), Number(b.py), Number(b.lat), Number(b.lng), b.acc == null ? null : Number(b.acc), String(b.label ?? ""), op.id]);
    else if (b.action === "del") r = await rpc("admin_map_point_del", [Number(b.id), op.id]);
    else return json({ ok: false, code: "ACTION_INVALID" }, 400);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

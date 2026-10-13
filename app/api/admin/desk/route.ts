import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// 수령소 화면 데이터: GET → 공용 코드 + 오늘 최근 뽑기 목록 / POST {action:'redeem', ticketId, checks} → 수동 지급 (총괄, 참가자 폰이 죽었을 때)
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const [c, d] = await Promise.all([rpc("desk_code_now", []), rpc("desk_recent_draws", [40])]);
    return withAdminCookie(json({ ...c, ...d, ok: true }), op);
  } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    if (b.action !== "redeem") return json({ ok: false, code: "ACTION_INVALID" }, 400);
    const r = await rpc("draw_redeem", [String(b.ticketId ?? ""), op.id, JSON.stringify(b.checks ?? {})]);
    return withAdminCookie(json(r, r.ok ? 200 : 409), op);
  } catch (e) { return serverError(e); }
}

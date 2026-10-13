import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// GET 대시보드 / POST {action:'end_stale', reason} 이탈 일괄 종료
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try { return withAdminCookie(json(await rpc("admin_dashboard", [])), op); } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const b = await readJson(req);
    if (b.action !== "end_stale") return json({ ok: false, code: "ACTION_INVALID" }, 400);
    const r = await rpc("admin_end_stale", [op.id, String(b.reason ?? "")]);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// GET 운영일 목록 / POST 운영일 생성·수정 {op_date, open_at, last_entry, close_at, grace_min, active}
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try { return withAdminCookie(json(await rpc("admin_opday_list", [])), op); } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    const r = await rpc("admin_opday_set", [b.op_date, b.open_at, b.last_entry, b.close_at, Number(b.grace_min ?? 10), b.active !== false, op.id]);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

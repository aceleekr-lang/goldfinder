import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// 총괄 전용: GET 설정+계정 / POST {action:'setting', key, value} | {action:'rotate_secret'} | {action:'operator', id, name, pin?, role, active}
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const [s, o] = await Promise.all([rpc("admin_settings_get", []), rpc("admin_operators_list", [])]);
    return withAdminCookie(json({ ...s, ...o, ok: true }), op);
  } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    let r;
    if (b.action === "setting") r = await rpc("settings_set", [String(b.key ?? ""), String(b.value ?? ""), op.id]);
    else if (b.action === "rotate_secret") r = await rpc("admin_desk_secret_rotate", [op.id]);
    else if (b.action === "purge") r = await rpc("admin_purge_personal", [op.id]);
    else if (b.action === "operator") r = await rpc("admin_operator_set", [String(b.id ?? "").toLowerCase(), String(b.name ?? ""), b.pin ? String(b.pin) : null, String(b.role ?? "staff"), b.active !== false, op.id]);
    else return json({ ok: false, code: "ACTION_INVALID" }, 400);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

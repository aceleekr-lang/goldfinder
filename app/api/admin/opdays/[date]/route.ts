import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// GET 운영일 상세 / POST {action: slots|prizes|windows|window_quota|rsv|copy, ...}
export async function GET(req: NextRequest, ctx: { params: Promise<{ date: string }> }) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try { const { date } = await ctx.params; return withAdminCookie(json(await rpc("admin_opday_get", [date])), op); } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ date: string }> }) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const { date } = await ctx.params;
    const b = await readJson(req);
    let r;
    switch (b.action) {
      case "slots":  r = await rpc("admin_slots_set", [date, JSON.stringify(b.slots ?? []), op.id]); break;
      case "prizes": r = await rpc("admin_prizes_set", [date, JSON.stringify(b.prizes ?? {}), op.id]); break;
      case "windows":      r = await rpc("admin_windows_set_day", [date, JSON.stringify(b.windows ?? []), op.id, String(b.reason ?? "")]); break;
      case "window_quota": r = await rpc("admin_window_quota_set", [Number(b.id), Number(b.quota), op.id, String(b.reason ?? "")]);
                           if (r.ok) r = await rpc("admin_opday_get", [date]); break;
      case "rsv":    r = await rpc("admin_rsv_set", [date, b.rsv_count === null || b.rsv_count === "" ? null : Number(b.rsv_count), op.id]); break;
      case "adjust":       r = await rpc("admin_day_adjust_set", [date, JSON.stringify(b.adjust ?? {}), op.id, String(b.reason ?? "")]); break;
      case "adjust_clear": r = await rpc("admin_day_adjust_clear", [date, op.id, String(b.reason ?? "")]); break;
      case "copy":   r = await rpc("admin_opday_copy", [b.from, date, op.id]); break;
      default: return json({ ok: false, code: "ACTION_INVALID" }, 400);
    }
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// 수기 대체: GET ?code=휴대폰번호|참여번호 조회 / POST {action: star|ticket|redeem|end, sessionId, ...reason}
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "");
    if (!(code.length === 6 || /^01[0-9][0-9]{7,8}$/.test(code))) return json({ ok: false, code: "NOT_FOUND" }, 400);   // 휴대폰번호 또는 참여번호
    const r = await rpc("admin_session_find", [code]);
    return withAdminCookie(json(r, r.ok ? 200 : 404), op);
  } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const b = await readJson(req);
    const sid = String(b.sessionId ?? ""), reason = String(b.reason ?? "");
    let r;
    switch (b.action) {
      case "star":   r = await rpc("admin_manual_star", [sid, String(b.color ?? ""), op.id, reason]); break;
      case "ticket": r = await rpc("admin_manual_ticket", [sid, op.id, reason]); break;
      case "redeem": r = await rpc("draw_redeem", [String(b.ticketId ?? ""), op.id, JSON.stringify(b.checks ?? {})]); break;
      case "end":    r = await rpc("admin_force_end", [sid, op.id, reason]); break;
      case "reset":  r = await rpc("admin_session_reset", [String(b.key ?? ""), op.id, reason]); break;   // 참여 초기화 (휴대폰번호/참여번호)
      default: return json({ ok: false, code: "ACTION_INVALID" }, 400);
    }
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

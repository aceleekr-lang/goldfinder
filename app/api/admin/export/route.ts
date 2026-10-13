import { NextRequest, NextResponse } from "next/server";
import { rpc } from "@/lib/db";
import { json, serverError } from "@/lib/session";
import { requireOperator } from "@/lib/admin";

// 결과보고용 CSV 내보내기 (운영 데이터 = 발주기관 귀속)
// GET /api/admin/export?kind=days|tags|draws
function toCsv(rows: Record<string, unknown>[], cols: string[]): string {
  const esc = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return "\uFEFF" + [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const kind = req.nextUrl.searchParams.get("kind") ?? "days";
    let rows: Record<string, unknown>[]; let cols: string[];
    if (kind === "days") {
      const r = await rpc("admin_export_days", []);
      rows = (r.rows as Record<string, unknown>[]) ?? [];
      cols = ["op_date", "started", "completed", "tickets", "draws", "g1", "g2", "g3", "card", "redeemed", "wishes"];
    } else if (kind === "draws") {
      const r = await rpc("admin_export_draws", []);
      rows = (r.rows as Record<string, unknown>[]) ?? [];
      cols = ["id", "op_date", "drawn_at", "ticket_id", "grade_result", "window_id", "redeemed_at", "redeemed_by"];
    } else if (kind === "tags") {
      const r = await rpc("admin_tags", []);
      rows = ((r.tags as Record<string, unknown>[]) ?? []).map((t) => ({
        id: t.id, role: t.role, color: t.color, label: t.label, zone: t.zone, active: t.active,
        attempts_today: t.attempts_today, quiz_today: t.quiz_today, correct_today: t.correct_today,
        cooldown_hits_today: t.cooldown_hits_today, last_attempt_at: t.last_attempt_at,
      }));
      cols = ["id", "role", "color", "label", "zone", "active", "attempts_today", "quiz_today", "correct_today", "cooldown_hits_today", "last_attempt_at"];
    } else return json({ ok: false, code: "KIND_INVALID" }, 400);
    return new NextResponse(toCsv(rows, cols), { headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="goldfinder_${kind}.csv"`,
      "cache-control": "no-store" } });
  } catch (e) { return serverError(e); }
}

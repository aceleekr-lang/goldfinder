import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// GET 스토리·퀴즈 전체 / POST {action:'story'|'quiz', ...} (총괄만)
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try { return withAdminCookie(json(await rpc("admin_content_get", [])), op); } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    const id = b.id == null ? null : Number(b.id);
    let r;
    if (b.action === "story") r = await rpc("admin_story_set", [id, b.color, b.title, b.body, b.image_url ?? null, Number(b.sort ?? 0), b.active !== false, op.id]);
    else if (b.action === "quiz") r = await rpc("admin_quiz_set", [id, Number(b.story_id), b.question, JSON.stringify(b.choices ?? []), Number(b.answer_idx), b.active !== false, op.id]);
    else return json({ ok: false, code: "ACTION_INVALID" }, 400);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

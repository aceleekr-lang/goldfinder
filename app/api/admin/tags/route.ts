import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";

// GET 태그 상태판 / POST {tagId, active, reason} 활성 토글 (진행요원 가능 — 파손 시 예비 활성)
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const t = await rpc("admin_tags", []);
    return withAdminCookie(json({ ...t, base: (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "") }), op);   // base: NFC·QR에 쓸 태그 URL 앞부분
  } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  try {
    const b = await readJson(req);
    if (typeof b.encoded === "boolean") {   // NFC 인코딩 완료 체크 (진행 표시)
      const r2 = await rpc("admin_tag_encoded", [String(b.tagId ?? ""), b.encoded, op.id]);
      return withAdminCookie(json(r2, r2.ok ? 200 : 400), op);
    }
    const r = await rpc("tag_toggle", [String(b.tagId ?? ""), b.active === true, op.id, String(b.reason ?? "")]);
    return withAdminCookie(json(r, r.ok ? 200 : 400), op);
  } catch (e) { return serverError(e); }
}

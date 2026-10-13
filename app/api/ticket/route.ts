import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { getToken, json, serverError } from "@/lib/session";

// 뽑기권 상태 폴링 (3초). 승인되면 코드가 함께 온다 — 세션 소유자에게만.
export async function GET(req: NextRequest) {
  try {
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const r = await rpc("ticket_status", [t]);
    return json(r, r.ok ? 200 : 404);
  } catch (e) { return serverError(e); }
}

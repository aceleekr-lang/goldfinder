import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";

// 뽑기 실행 — 등급 결정·차감은 전부 DB 함수(단일 트랜잭션). 여기서는 전달만.
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { ticketId, code } = await readJson(req);
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    if (typeof ticketId !== "string" || typeof code !== "string") return json({ ok: false, code: "CODE_INVALID" }, 400);
    const r = await rpc("draw_execute", [t, ticketId, code.replace(/\D/g, "")]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";

// 참가자 폰의 [사용]: 직원이 자기 PIN을 입력 → 지급 처리. 세션당 10분 5회 (DB에서 제한)
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { ticketId, pin, checks } = await readJson(req);
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    if (typeof ticketId !== "string" || typeof pin !== "string") return json({ ok: false, code: "PIN_INVALID" }, 400);
    const r = await rpc("draw_redeem_by_pin", [t, ticketId, pin.replace(/\D/g, ""), JSON.stringify(checks ?? {})]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

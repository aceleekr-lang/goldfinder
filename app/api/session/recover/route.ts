import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, clientIp, json, readJson, serverError, withSessionCookie } from "@/lib/session";

// 참여번호로 복구 — 토큰 회전, IP당 10분 5회
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { joinCode } = await readJson(req);
    if (typeof joinCode !== "string") return json({ ok: false, code: "NOT_FOUND" }, 400);
    const r = await rpc("session_recover", [joinCode.replace(/\D/g, ""), clientIp(req)]);
    const res = json(r, r.ok ? 200 : 409);
    return r.ok && typeof r.token === "string" ? withSessionCookie(res, r.token) : res;
  } catch (e) { return serverError(e); }
}

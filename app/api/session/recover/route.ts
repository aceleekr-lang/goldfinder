import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, clientIp, json, readJson, serverError, withSessionCookie } from "@/lib/session";

// 이어하기 — 휴대폰번호(또는 안내 요원용 참여번호). [2026-10-19] 토큰을 바꾸지 않아 다른 폰도 계속 유효
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { joinCode } = await readJson(req);
    if (typeof joinCode !== "string") return json({ ok: false, code: "NOT_FOUND" }, 400);
    const r = await rpc("session_recover", [joinCode.replace(/\D/g, "").slice(0, 11), clientIp(req)]);   // 휴대폰번호 또는 참여번호 6자리
    const res = json(r, r.ok ? 200 : 409);
    return r.ok && typeof r.token === "string" ? withSessionCookie(res, r.token) : res;
  } catch (e) { return serverError(e); }
}

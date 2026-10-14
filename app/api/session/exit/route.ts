import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";
import { getTester } from "@/lib/tester";

// 출구 표식: 완주 판정 (확인 단계·보류·멱등은 DB 함수가 처리)
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { tagId, confirm } = await readJson(req);
    const t = getToken(req);
    if (typeof tagId !== "string") return json({ ok: false, code: "TAG_INVALID" }, 400);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const r = await rpc("session_exit", [tagId, t, confirm === true, getTester(req)]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

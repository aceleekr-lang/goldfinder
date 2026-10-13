import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError, withSessionCookie } from "@/lib/session";

// 시작 표식: 세션 생성 (멱등 — 오늘 세션 쿠키가 있으면 재사용, 예약번호 불필요·차감 없음)
// 새 시작은 본인 예약번호 6자리 필수 → DB 함수가 같은 트랜잭션에서 rsv_claim 호출 (v4)
// gf_rid: 시작 화면 식별 쿠키 — 예약번호 5회 오류 5분 차단 키 (세션 생성 전이라 gf_sid 대신 사용)
const RID = "gf_rid";
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { tagId, rsvCode } = await readJson(req);
    if (typeof tagId !== "string") return json({ ok: false, code: "TAG_INVALID" }, 400);
    let rid = req.cookies.get(RID)?.value ?? null; let newRid = false;
    if (!rid || !/^[a-f0-9]{32}$/.test(rid)) { rid = crypto.randomUUID().replace(/-/g, ""); newRid = true; }
    const code = typeof rsvCode === "string" ? rsvCode.replace(/\D/g, "").slice(0, 6) : null;
    const r = await rpc("session_start", [tagId, getToken(req), code || null, rid]);
    let res = json(r, r.ok ? 200 : 409);
    if (r.ok && typeof r.token === "string") res = withSessionCookie(res, r.token);
    if (newRid) res.cookies.set(RID, rid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 3 });
    return res;
  } catch (e) { return serverError(e); }
}

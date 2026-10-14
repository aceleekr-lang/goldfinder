import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";
import { getTester } from "@/lib/tester";

// 별 태그 인증 → 판정 → 퀴즈 출제 (판정 순서는 DB 함수 tag_attempt에 고정)
export async function POST(req: NextRequest, ctx: { params: Promise<{ tagId: string }> }) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { tagId } = await ctx.params;
    const { useRetry } = await readJson(req);
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const r = await rpc("tag_attempt", [tagId, t, useRetry === true, getTester(req)]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

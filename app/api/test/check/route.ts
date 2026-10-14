import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, json, readJson, serverError } from "@/lib/session";
import { getTester } from "@/lib/tester";

// [태그 점검 모드] 테스트폰으로 태그를 찍으면 태그 정보 확인 + 점검 시각 기록 (게임 진행 없음)
export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { tagId } = await readJson(req);
    const k = getTester(req);
    if (!k) return json({ ok: false, code: "TESTER_REQUIRED" }, 403);
    const r = await rpc("tag_check", [String(tagId ?? ""), k]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

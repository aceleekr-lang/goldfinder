import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { attemptId, answerIdx } = await readJson(req);
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const a = Number(attemptId), i = Number(answerIdx);
    if (!Number.isInteger(a) || !Number.isInteger(i)) return json({ ok: false, code: "ANSWER_INVALID" }, 400);
    const r = await rpc("quiz_answer", [t, a, i]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { ipLimited, getToken, json, readJson, serverError } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const limited = await ipLimited(req, rpc); if (limited) return limited;
    const { body } = await readJson(req);
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const r = await rpc("wish_submit", [t, typeof body === "string" ? body.slice(0, 200) : ""]);
    return json(r, r.ok ? 200 : 409);
  } catch (e) { return serverError(e); }
}

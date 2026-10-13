import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { getToken, json, serverError } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const t = getToken(req);
    if (!t) return json({ ok: false, code: "NO_SESSION" }, 401);
    const r = await rpc("session_get", [t]);
    return json(r, r.ok ? 200 : 401);
  } catch (e) { return serverError(e); }
}

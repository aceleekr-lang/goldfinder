import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError } from "@/lib/session";
import { withAdminCookie } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const { id, pin } = await readJson(req);
    if (typeof id !== "string" || typeof pin !== "string") return json({ ok: false, code: "LOGIN_FAILED" }, 400);
    const r = await rpc("admin_login", [id.trim(), pin]);
    if (!r.ok) return json(r, 401);
    return withAdminCookie(json({ ok: true, id: r.id, name: r.name, role: r.role }), { id: r.id as string, name: r.name as string, role: r.role as "staff" | "admin" });
  } catch (e) { return serverError(e); }
}

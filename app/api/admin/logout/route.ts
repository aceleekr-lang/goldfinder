import { json } from "@/lib/session";
import { withAdminCookie } from "@/lib/admin";
export async function POST() { return withAdminCookie(json({ ok: true }), null); }

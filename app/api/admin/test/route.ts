import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, readJson, serverError, COOKIE } from "@/lib/session";
import { requireOperator, withAdminCookie } from "@/lib/admin";
import { getTester, setTesterCookies, clearTesterCookies, markOf, type Dev } from "@/lib/tester";

// 총괄 전용 [테스트] 화면
// GET → 테스트폰 목록·이 폰 여부·테스트 기록·태그 점검 현황
// POST {action}: register {label} | set {id, fast?, check?, rsv_real?} | revoke {id?} (없으면 전체) | forget (이 폰 쿠키만 삭제) | purge (테스트 기록 전체 삭제)
const HOURS = 12;
export async function GET(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const k = getTester(req);
    const r = await rpc("test_admin_get", [k]);
    let res = json(r);
    // 화면 표식 쿠키를 DB 상태와 맞춘다 (만료·해제된 폰은 표식 제거)
    const me = (r.devices as Array<Record<string, unknown>> | undefined)?.find((d) => d.me);
    if (me) res = setTesterCookies(res, null, markOf(me as Dev), Math.max(60, Math.floor((new Date(String(me.expires_at)).getTime() - Date.now()) / 1000)));
    else if (k || req.cookies.get("gf_tmark")) res = clearTesterCookies(res);
    return withAdminCookie(res, op);
  } catch (e) { return serverError(e); }
}
export async function POST(req: NextRequest) {
  const op = requireOperator(req); if (!op) return json({ ok: false, code: "UNAUTHORIZED" }, 401);
  if (op.role !== "admin") return json({ ok: false, code: "FORBIDDEN" }, 403);
  try {
    const b = await readJson(req);
    const k = getTester(req);
    const opt = (v: unknown) => (typeof v === "boolean" ? v : null);
    if (b.action === "register") {
      const r = await rpc("test_device_register", [String(b.label ?? ""), op.id, HOURS]);
      if (!r.ok) return withAdminCookie(json(r, 400), op);
      const res = setTesterCookies(json({ ok: true, id: r.id, label: r.label, expires_at: r.expires_at }), String(r.key), "t", HOURS * 3600);
      res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });   // 이 폰의 이전 참가 쿠키 정리 → 새 테스트로 시작
      return withAdminCookie(res, op);
    }
    if (b.action === "set") {
      const r = await rpc("test_device_set", [String(b.id ?? ""), opt(b.fast), opt(b.check), opt(b.rsv_real), op.id]);
      let res = json(r, r.ok ? 200 : 400);
      const st = k ? await rpc("tester_status", [k]) : null;
      if (r.ok && st?.tester && st.id === b.id) res = setTesterCookies(res, null, markOf(r as Dev), Math.max(60, Math.floor((new Date(String(st.expires_at)).getTime() - Date.now()) / 1000)));
      return withAdminCookie(res, op);
    }
    if (b.action === "revoke") {
      const r = await rpc("test_device_revoke", [typeof b.id === "string" ? b.id : null, op.id]);
      let res = json(r, r.ok ? 200 : 400);
      const st = k ? await rpc("tester_status", [k]) : null;
      if (k && !st?.tester) res = clearTesterCookies(res);
      return withAdminCookie(res, op);
    }
    if (b.action === "forget") return withAdminCookie(clearTesterCookies(json({ ok: true })), op);
    if (b.action === "purge") {
      const r = await rpc("admin_test_purge", [op.id]);
      return withAdminCookie(json(r, r.ok ? 200 : 400), op);
    }
    return withAdminCookie(json({ ok: false, code: "ACTION_INVALID" }, 400), op);
  } catch (e) { return serverError(e); }
}

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// 관리자 쿠키: HMAC 서명된 {id, name, role, exp}. 10분 무활동 만료 (F-6-4) — 매 요청마다 재발급(슬라이딩)
export const ADMIN_COOKIE = "gf_admin";
const TTL_SEC = 10 * 60;
export type Operator = { id: string; name: string; role: "staff" | "admin"; exp: number };

function secret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_COOKIE_SECRET missing");
  return s;
}
const sig = (b: string) => crypto.createHmac("sha256", secret()).update(b).digest("base64url");

export function signOperator(op: Omit<Operator, "exp">): string {
  const body = Buffer.from(JSON.stringify({ ...op, exp: Math.floor(Date.now() / 1000) + TTL_SEC })).toString("base64url");
  return `${body}.${sig(body)}`;
}
export function verifyOperator(cookie: string | undefined | null): Operator | null {
  if (!cookie) return null;
  const [body, s] = cookie.split(".");
  if (!body || !s) return null;
  const expect = sig(body);
  if (expect.length !== s.length || !crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(s))) return null;
  try {
    const op = JSON.parse(Buffer.from(body, "base64url").toString()) as Operator;
    return op.exp > Math.floor(Date.now() / 1000) ? op : null;
  } catch { return null; }
}
export function withAdminCookie(res: NextResponse, op: Omit<Operator, "exp"> | null): NextResponse {
  if (op) res.cookies.set(ADMIN_COOKIE, signOperator(op), { httpOnly: true, sameSite: "lax", path: "/", maxAge: TTL_SEC, secure: process.env.NODE_ENV === "production" });
  else res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
// API 라우트용: 검증 실패 시 null. 성공 시 응답에 쿠키를 재발급해 만료를 연장할 것
export function requireOperator(req: NextRequest): Operator | null {
  return verifyOperator(req.cookies.get(ADMIN_COOKIE)?.value);
}

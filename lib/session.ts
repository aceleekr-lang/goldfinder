import { NextRequest, NextResponse } from "next/server";
import type { RpcResult } from "./db";

export const COOKIE = "gf_sid";

export function getToken(req: NextRequest): string | null {
  return req.cookies.get(COOKIE)?.value ?? null;
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function json(data: RpcResult, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function withSessionCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

// 내부 오류는 상세를 숨긴다 (Phase 6: 에러 응답에 내부 정보 노출 금지)
export function serverError(e: unknown): NextResponse {
  console.error("[api]", e instanceof Error ? e.message : e);
  return json({ ok: false, code: "SERVER_ERROR" }, 500);
}

// 참가자 API IP 속도 제한 — 통신사 CGNAT(여러 참가자가 IP 공유)를 고려해 기본 600회/분. 초과 시 429 응답을 돌려준다
export async function ipLimited(req: NextRequest, rpcFn: (fn: string, args: unknown[]) => Promise<RpcResult>): Promise<NextResponse | null> {
  const max = Number(process.env.IP_RATE_LIMIT_PER_MIN ?? 600);
  const hit = await rpcFn("api_rate_limit", [clientIp(req), max, 60]);
  return (hit as unknown) === true ? json({ ok: false, code: "RATE_LIMITED" }, 429) : null;
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try { return (await req.json()) as Record<string, unknown>; } catch { return {}; }
}

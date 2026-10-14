import { NextRequest, NextResponse } from "next/server";

// 테스트폰 쿠키 (관리자 [테스트] 화면에서 등록한 기기만). 판정은 항상 DB(_tester)가 한다 — 쿠키만으로는 아무 권한 없음
//   gf_tester: 원문 키(httpOnly, 서버만 읽음) / gf_tmark: 화면 표시용 표식(JS가 읽음, 권한 없음) — t + f(빠른)·c(점검)·r(실제 예약번호)
export const TESTER_COOKIE = "gf_tester";
export const MARK_COOKIE = "gf_tmark";

export function getTester(req: NextRequest): string | null {
  const v = req.cookies.get(TESTER_COOKIE)?.value ?? null;
  return v && /^[a-f0-9]{32,128}$/.test(v) ? v : null;
}

export type Dev = { fast?: boolean; check_mode?: boolean; rsv_real?: boolean };
export const markOf = (d: Dev) => "t" + (d.fast ? "f" : "") + (d.check_mode ? "c" : "") + (d.rsv_real ? "r" : "");

const secure = () => process.env.NODE_ENV === "production";
export function setTesterCookies(res: NextResponse, key: string | null, mark: string, maxAgeSec: number): NextResponse {
  if (key) res.cookies.set(TESTER_COOKIE, key, { httpOnly: true, sameSite: "lax", path: "/", maxAge: maxAgeSec, secure: secure() });
  res.cookies.set(MARK_COOKIE, mark, { httpOnly: false, sameSite: "lax", path: "/", maxAge: maxAgeSec, secure: secure() });
  return res;
}
export function clearTesterCookies(res: NextResponse): NextResponse {
  res.cookies.set(TESTER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(MARK_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

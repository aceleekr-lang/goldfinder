import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/session";

// 테스트폰 [새 테스트 시작]: 이 폰의 참가 쿠키만 지운다 (기록은 남음 — 지우려면 관리자 [테스트] → 테스트 기록 전체 삭제)
export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("gf_rid", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

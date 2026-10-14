import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { json, serverError } from "@/lib/session";

// 입구 현황판 데이터 (공개, 5초 갱신). 잔여 수량 외 정보 없음. ?test=1 → 금 당첨 연출을 테스트 뽑기로 감지(리허설용)
export async function GET(req: NextRequest) {
  try { return json(await rpc("board_data", [req.nextUrl.searchParams.get("test") === "1"])); } catch (e) { return serverError(e); }
}

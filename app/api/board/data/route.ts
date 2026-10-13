import { rpc } from "@/lib/db";
import { json, serverError } from "@/lib/session";

// 입구 현황판 데이터 (공개, 30초 갱신). 잔여 수량 외 정보 없음
export async function GET() {
  try { return json(await rpc("board_data", [])); } catch (e) { return serverError(e); }
}

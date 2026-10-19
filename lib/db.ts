import { Pool } from "pg";

// 서버리스: 인스턴스당 작은 풀. Supabase는 트랜잭션 풀러(6543) 사용 — 모든 호출이 단일 문장(SELECT fn(...))이라 안전.
declare global { var __starPool: Pool | undefined }
function pool(): Pool {
  if (!global.__starPool) {
    global.__starPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10_000,
      ssl: process.env.DATABASE_SSL === "1" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return global.__starPool;
}

// 호출 가능한 DB 함수 화이트리스트 (라우트 코드에서만 쓰지만 이중 안전장치)
const FN = new Set([
  "session_start", "session_recover", "session_get", "tag_attempt", "quiz_answer", "session_exit",
  "wish_submit", "ticket_status", "draw_execute",
  "admin_login", "admin_session_find", "draw_redeem", "draw_redeem_by_pin", "desk_code_now", "desk_recent_draws", "admin_manual_star", "admin_manual_ticket",
  "admin_force_end", "admin_end_stale", "tag_toggle", "settings_set", "admin_dashboard", "board_data",
  "admin_opday_list", "admin_opday_get", "admin_opday_set", "admin_slots_set", "admin_prizes_set", "admin_windows_set_day", "admin_window_quota_set", "admin_opday_copy", "admin_rsv_set", "admin_session_reset", "admin_day_adjust_set", "admin_day_adjust_clear", "admin_purge_personal",
  "admin_export_days", "admin_export_draws",
  "admin_content_get", "admin_story_set", "admin_quiz_set", "admin_ticket_get",
  "admin_tags", "admin_tag_encoded", "admin_settings_get", "admin_desk_secret_rotate", "admin_operators_list", "admin_operator_set",
  "admin_wishes", "admin_wish_set", "api_rate_limit",
  // 테스트 모드 (2026-10-14)
  "tester_status", "test_device_register", "test_device_set", "test_device_revoke", "test_admin_get", "tag_check", "admin_test_purge",
  "map_points_get", "admin_map_point_add", "admin_map_point_del",
]);

export type RpcResult = { ok: boolean; status?: string; code?: string; [k: string]: unknown };

export async function rpc(fn: string, args: unknown[]): Promise<RpcResult> {
  if (!FN.has(fn)) throw new Error("unknown function");
  const ph = args.map((_, i) => `$${i + 1}`).join(",");
  const { rows } = await pool().query(`SELECT ${fn}(${ph}) AS r`, args);
  return rows[0].r as RpcResult;
}

export async function query<T = Record<string, unknown>>(sql: string, args: unknown[] = []): Promise<T[]> {
  const { rows } = await pool().query(sql, args);
  return rows as T[];
}

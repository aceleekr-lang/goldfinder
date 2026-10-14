import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { query, rpc } from "@/lib/db";
import TagFlow from "@/components/TagFlow";
import TagCheck from "@/components/TagCheck";
import { COLOR_NAME } from "@/lib/copy";
import { TESTER_COOKIE } from "@/lib/tester";

export const dynamic = "force-dynamic";

// GET /t/:tagId — 화면만 렌더. 상태 변경은 페이지 JS의 POST에서만 (S-5: 프리페치·링크 프리뷰 대비)
// 테스트폰이 [태그 점검 모드]면 게임 대신 점검 화면 (관람객 폰은 쿠키가 없어 영향 없음)
export default async function TagPage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params;
  if (!/^[a-z0-9]{6,16}$/.test(tagId)) notFound();
  const rows = await query<{ id: string; role: "start" | "star" | "exit"; color: string | null }>(
    "SELECT id, role, color FROM tags WHERE id = $1", [tagId]);
  if (rows.length === 0) notFound();
  const t = rows[0];
  const k = (await cookies()).get(TESTER_COOKIE)?.value;
  if (k && /^[a-f0-9]{32,128}$/.test(k)) {
    const st = await rpc("tester_status", [k]);
    if (st.tester && st.check_mode) return <TagCheck tagId={t.id} />;
  }
  return <TagFlow tagId={t.id} role={t.role} color={t.color} colorName={t.color ? COLOR_NAME[t.color] : undefined} />;
}

import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import TagFlow from "@/components/TagFlow";
import { COLOR_NAME } from "@/lib/copy";

export const dynamic = "force-dynamic";

// GET /t/:tagId — 화면만 렌더. 상태 변경은 페이지 JS의 POST에서만 (S-5: 프리페치·링크 프리뷰 대비)
export default async function TagPage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params;
  if (!/^[a-z0-9]{6,16}$/.test(tagId)) notFound();
  const rows = await query<{ id: string; role: "start" | "star" | "exit"; color: string | null }>(
    "SELECT id, role, color FROM tags WHERE id = $1", [tagId]);
  if (rows.length === 0) notFound();
  const t = rows[0];
  return <TagFlow tagId={t.id} role={t.role} color={t.color} colorName={t.color ? COLOR_NAME[t.color] : undefined} />;
}

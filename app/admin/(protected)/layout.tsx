import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE, verifyOperator } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

// 관리자 영역 보호: 쿠키 검증 실패 시 로그인으로
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const op = verifyOperator((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!op) redirect("/admin/login");
  return (
    <>
      <AdminNav name={op.name} role={op.role} />
      {children}
      <p className="muted" style={{ marginTop: 24 }}><Link href="/admin">대시보드</Link></p>
    </>
  );
}

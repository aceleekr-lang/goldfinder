"use client";
import { useRouter } from "next/navigation";
export default function AdminNav({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); };
  return (
    <div className="banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eef", borderColor: "#bbc" }}>
      <span>관리자 · {name} ({role === "admin" ? "총괄" : "진행요원"}) &nbsp;<a href="/admin">대시보드</a> · <a href="/admin/session">참가자</a> · <a href="/admin/desk">수령소</a> · <a href="/admin/opdays">운영일</a> · <a href="/admin/nfc">NFC 태그</a> · <a href="/admin/content">콘텐츠</a> · <a href="/admin/wishes">소원</a> · <a href="/admin/settings">설정</a> · <a href="/board" target="_blank">현황판↗</a></span>
      <button className="btn secondary" style={{ width: "auto", padding: "6px 12px", fontSize: 14, margin: 0 }} onClick={logout}>로그아웃</button>
    </div>
  );
}

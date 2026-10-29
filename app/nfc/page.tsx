import { redirect } from "next/navigation";
// NFC 안내 폐지 (2026-10-29, QR 전용 운영) — 옛 QR·링크로 들어오면 홈으로
export default function Page() { redirect("/"); }

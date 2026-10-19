import type { Metadata } from "next";
import PrintSheet from "@/components/NfcPrintSheet";

// A4 인쇄용 안내판 — 브라우저 인쇄(Ctrl+P)로 세로 A4 한 장. QR → /nfc (2026-10-18)
export const metadata: Metadata = { title: "NFC 켜는 법 — A4 안내판" };
export const dynamic = "force-static";
export default function Page() { return <PrintSheet />; }

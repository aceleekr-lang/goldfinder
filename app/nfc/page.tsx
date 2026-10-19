import type { Metadata } from "next";
import NfcHelpContent from "@/components/NfcHelpContent";
import { NFC_HELP } from "@/lib/nfcHelp";

// 공개 'NFC 켜는 법' 안내 페이지 — 로그인·예약번호 없이 누구나. 세션·참여 기록과 무관 (2026-10-18)
export const metadata: Metadata = { title: "휴대폰 NFC 켜는 법 — 영남루에 흩어진 별을 찾아라", description: "별 표식에 휴대폰을 대도 반응이 없을 때, 내 휴대폰에 맞는 NFC 켜는 방법" };
export const dynamic = "force-static";

export default function Page() {
  return (
    <>
      <style>{`body { background: #141B33; } main.wrap > footer { color: #F5F1E6; }`}</style>
      <NfcHelpContent top={NFC_HELP.pageTop} bottom={NFC_HELP.pageBottom} />
    </>
  );
}

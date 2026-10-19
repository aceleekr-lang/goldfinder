"use client";
import { NFC_HELP, NFC_PAGE_URL, NFC_IMG_VER } from "@/lib/nfcHelp";

// A4 세로 한 장 안내판 — 남색 바탕이 인쇄에도 그대로 나오게(print-color-adjust). 화면에서는 [인쇄] 버튼, 인쇄물에는 버튼 없음
const GOLD = "#F2C14E", INK = "#F5F1E6", NAVY = "#141B33";
export default function NfcPrintSheet() {
  const P = NFC_HELP.print;
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        html, body { background: #e9e7df; }
        main.wrap { max-width: none !important; padding: 0 !important; min-height: auto !important; }
        main.wrap > footer { display: none !important; }
        .nfc-sheet { width: 210mm; height: 297mm; margin: 0 auto; background: ${NAVY}; color: ${INK}; box-sizing: border-box; padding: 16mm 14mm 14mm; display: flex; flex-direction: column;
          -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif; }
        @media screen { .nfc-sheet { box-shadow: 0 6px 30px rgba(0,0,0,.35); margin: 16px auto; } }
        @media print { .noprint { display: none !important; } html, body { background: ${NAVY}; } .nfc-sheet { margin: 0; box-shadow: none; page-break-after: avoid; } }
      `}</style>
      <div className="noprint" style={{ textAlign: "center", padding: "12px 0 0" }}>
        <button onClick={() => window.print()} style={{ fontSize: 18, fontWeight: 800, padding: "12px 28px", borderRadius: 12, border: "2px solid #F2C14E", background: "#141B33", color: "#F2C14E", cursor: "pointer" }}>🖨 A4로 인쇄하기</button>
        <p style={{ fontSize: 14, color: "#555", margin: "8px 0 0" }}>인쇄 창에서 용지 A4 · 세로 · 여백 '없음' · '배경 그래픽' 켜기</p>
      </div>
      <div className="nfc-sheet">
        <div style={{ fontSize: "14pt", color: GOLD, letterSpacing: ".06em" }}>영남루에 흩어진 별을 찾아라</div>
        <h1 style={{ fontSize: "40pt", lineHeight: 1.15, margin: "4mm 0 5mm", color: INK, fontWeight: 900 }}>{P.title}</h1>
        <p style={{ fontSize: "16pt", lineHeight: 1.5, margin: "0 0 7mm" }}>{P.lead}</p>
        <div style={{ textAlign: "center", margin: "0 0 5mm" }}>
          <img src={`/nfc/nfc-qr.png?v=${NFC_IMG_VER}`} alt={`QR: ${NFC_PAGE_URL}`} style={{ width: "100mm", height: "100mm", display: "block", margin: "0 auto", background: "#fff", borderRadius: "4mm", padding: "3mm", boxSizing: "border-box" }} />
          <div style={{ fontSize: "18pt", fontWeight: 900, color: GOLD, margin: "5mm 0 1.5mm" }}>📷 {P.scan}</div>
          <div style={{ fontSize: "15pt", letterSpacing: ".02em" }}>{NFC_PAGE_URL.replace(/^https?:\/\//, "")}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6mm", marginTop: "auto" }}>
          {P.boxes.map((b) => (
            <div key={b.title} style={{ border: `0.7mm solid ${GOLD}`, borderRadius: "5mm", padding: "6mm 6mm" }}>
              <div style={{ fontSize: "17pt", fontWeight: 900, color: GOLD, marginBottom: "3mm" }}>{b.title}</div>
              <div style={{ fontSize: "14pt", lineHeight: 1.55 }}>{b.body}</div>
            </div>))}
        </div>
        <div style={{ fontSize: "11pt", opacity: .75, textAlign: "center", marginTop: "6mm" }}>주최 밀양시 · 사전예약자만 참여 · 1인 1일 1회</div>
      </div>
    </>
  );
}

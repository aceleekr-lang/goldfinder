"use client";
import { useEffect, useState } from "react";

// 테스트폰 표시 띠 — 화면 표식 쿠키(gf_tmark)만 읽는다(권한 없음). 관람객 폰에는 쿠키가 없어 아무것도 그리지 않음
export function readMark(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)gf_tmark=([a-z]+)/);
  return m ? m[1] : null;
}
export default function TestBanner() {
  const [mark, setMark] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setMark(readMark()); }, []);
  if (!mark) return null;
  const flags = [mark.includes("f") ? "빠른 테스트" : null, mark.includes("c") ? "태그 점검 모드" : null, mark.includes("r") ? "실제 예약번호" : "예약번호 아무 6자리"].filter(Boolean).join(" · ");
  const reset = async () => {
    if (!confirm("이 폰의 테스트 참가를 끝내고 처음부터 다시 시작할까요? (기록은 남아요)")) return;
    setBusy(true); await fetch("/api/test/reset", { method: "POST" }).catch(() => {}); window.location.href = "/";
  };
  return (
    <div style={{ background: "#c62828", color: "#fff", borderRadius: 10, padding: "8px 12px", margin: "0 0 12px", fontSize: 14, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
      <span><b>테스트 모드 — 실제 경품 아님</b><br /><span style={{ opacity: 0.9, fontSize: 12 }}>{flags}</span></span>
      <button onClick={reset} disabled={busy} style={{ background: "#fff", color: "#c62828", border: 0, borderRadius: 8, padding: "6px 8px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>새 테스트 시작</button>
    </div>
  );
}

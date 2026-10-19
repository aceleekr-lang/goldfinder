"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NfcHelpContent from "./NfcHelpContent";

// 참가자 화면 오른쪽 위 [📶 NFC 켜는 법] 버튼 → 아래에서 올라오는 도움말 창 (2026-10-18)
//   보이는 곳: 시작 태그(예약번호 입력 포함)·별·출구 화면(/t/…), 별자리·완료 화면(/s), 이어하기(/recover). 뽑기 결과(/ticket)·관리자·현황판·홈에는 없음
//   화면 흐름 안에 넣어(고정 띄우기 아님) 제목·별 진행 표시를 가리지 않는다. 열고 닫아도 세션·진행에 영향 없음(서버 호출 없음)
export default function NfcHelpFab() {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);   // 올라오는 동작용
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const t = setTimeout(() => setShown(true), 10);
    return () => { document.body.style.overflow = prev; clearTimeout(t); setShown(false); };
  }, [open]);
  if (!/^\/(t\/|s$|recover)/.test(path)) return null;
  const close = () => setOpen(false);
  const closeBtn = (extra?: React.CSSProperties) => (
    <button onClick={close} aria-label="도움말 닫기" style={{ minHeight: 48, padding: "8px 22px", fontSize: 20, fontWeight: 900, borderRadius: 14, border: "2px solid #F2C14E",
      background: "#F2C14E", color: "#141B33", cursor: "pointer", ...extra }}>닫기 ✕</button>);
  return (<>
    <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 2px" }}>
      <button onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}
        style={{ minHeight: 44, minWidth: 44, padding: "8px 14px", fontSize: 15, fontWeight: 800, borderRadius: 22, border: "1.5px solid #F2C14E", background: "#141B33", color: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,.25)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span aria-hidden style={{ fontSize: 17 }}>📶</span>NFC 켜는 법</button>
    </div>
    {open ? (
      <div role="dialog" aria-modal="true" aria-label="NFC 켜는 법" style={{ position: "fixed", inset: 0, zIndex: 75, background: "rgba(0,0,0,.55)" }} onClick={close}>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: "4vh", background: "#141B33", borderRadius: "22px 22px 0 0",
          boxShadow: "0 -8px 30px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", transform: shown ? "translateY(0)" : "translateY(100%)", transition: "transform .3s ease-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(245,241,230,.2)", flex: "none" }}>
            <span style={{ color: "#F2C14E", fontWeight: 800, fontSize: 16 }}>📶 도움말</span>
            {closeBtn()}
          </div>
          <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 16px 28px", flex: 1 }}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <NfcHelpContent />
              <div style={{ textAlign: "center", marginTop: 8 }}>{closeBtn({ width: "100%", maxWidth: 360, minHeight: 56 })}</div>
            </div>
          </div>
        </div>
      </div>) : null}
  </>);
}

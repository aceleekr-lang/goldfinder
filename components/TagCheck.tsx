"use client";
import { useEffect, useRef, useState } from "react";

type R = { ok: boolean; code?: string; status?: string; today?: number; total?: number;
  tag?: { id: string; role: string; color: string | null; color_name: string | null; label: string; zone: string | null; active: boolean; is_spare: boolean; encoded: boolean } };
import { COLOR_HEX as HEX, COLOR_WORD } from "@/lib/copy";

// [태그 점검 모드] 테스트폰 전용 — 태그를 찍으면 이 태그가 무엇인지 보여 주고 점검 시각을 기록 (게임은 진행하지 않음)
export default function TagCheck({ tagId }: { tagId: string }) {
  const [r, setR] = useState<R | null>(null);
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return; once.current = true;
    fetch("/api/test/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId }) })
      .then((x) => x.json()).then(setR).catch(() => setR({ ok: false, code: "SERVER_ERROR" }));
  }, [tagId]);
  if (!r) return <div className="spin">태그 확인 중…</div>;
  if (!r.ok || !r.tag) return (<><h1>태그 점검</h1><div className="card"><p>확인 실패 ({r.code}). 테스트폰 등록이 만료됐을 수 있어요.</p></div></>);
  const t = r.tag;
  const kind = t.role === "start" ? "시작 표식 (입구)" : t.role === "exit" ? "출구 표식" : `${t.color_name ?? ""} · ${COLOR_WORD[t.color ?? ""] ?? ""} 스티커`;
  return (<>
    <h1>태그 점검 ✓</h1>
    <div className="card" style={{ borderLeft: `10px solid ${t.color ? HEX[t.color] : "#777"}` }}>
      <p style={{ fontSize: 26, fontWeight: 800, margin: "4px 0" }}>{t.label}</p>
      <p style={{ fontSize: 18, margin: "4px 0" }}>{kind}{t.zone ? ` · ${t.zone}` : ""}</p>
      <p className="muted">태그 번호 {t.id}</p>
      {!t.active ? <p style={{ color: "#c62828", fontWeight: 700 }}>⚠ 이 태그는 지금 비활성이에요{t.is_spare ? " (예비 태그)" : ""}. 관람객이 찍으면 안내만 나옵니다.</p> : <p style={{ color: "#2e7d32", fontWeight: 700 }}>정상 — 주소가 올바르게 기록돼 있어요.</p>}
      {!t.encoded ? <p className="muted">관리자 NFC 화면에서 [완료] 체크가 아직 안 돼 있어요.</p> : null}
    </div>
    <div className="card"><p style={{ margin: 0 }}><b>오늘 점검 {r.today} / {r.total}개</b> (설치용 별·시작·출구 기준)</p>
      <p className="muted">다음 태그로 이동해 폰을 대세요. 점검을 끝내면 관리자 [테스트] 화면에서 점검 모드를 끄세요.</p></div>
  </>);
}

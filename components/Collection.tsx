"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import StarSlots from "./StarSlots";
import { COLOR_NAME, errText, withColor } from "@/lib/copy";

type S = { ok: boolean; code?: string; join_code?: string; stars?: Record<string, string>; star_count?: number;
  retry_used?: boolean; retry_available?: boolean; session_status?: string; is_today?: boolean;
  needed?: { color: string; name: string; state: string }[]; ticket?: { id: string; status: string; result?: string } | null };

export default function Collection() {
  const [s, setS] = useState<S | null>(null);
  const [showCode, setShowCode] = useState(false);
  useEffect(() => { fetch("/api/session").then((r) => r.json()).then(setS).catch(() => setS({ ok: false, code: "SERVER_ERROR" })); }, []);
  if (!s) return <div className="spin">불러오는 중…</div>;
  if (!s.ok || s.is_today === false) {
    return (<>
      <h1>내 별자리</h1>
      <div className="card"><p>{s.ok ? "오늘 참여 기록이 없어요." : errText(s.code)}</p></div>
      <Link className="btn" href="/recover">참여번호로 이어서 하기</Link>
      <p className="muted">처음이라면 입구의 시작 표식을 태그해 주세요.</p>
    </>);
  }
  const stars = s.stars ?? {};
  const failed = Object.values(stars).filter((v) => v === "failed").length;
  const won = s.star_count ?? 0;
  const maxReachable = 5 - failed + (s.retry_available ? 1 : 0);   // 재도전권으로 되살릴 수 있는 1개 포함
  const cannotComplete = maxReachable < 5 && won < 5;
  return (
    <>
      <h1>내 별자리</h1>
      <StarSlots stars={stars} />
      <div className="card">
        <p><b>{won}</b> / 5 개의 별을 깨웠어요.</p>
        {s.session_status === "completed" && s.ticket ? (
          <Link className="btn" href="/ticket">뽑기권 보기</Link>
        ) : won === 5 ? (
          <p>별자리 완성! <b>출구 표식</b>을 태그하면 뽑기권이 나와요.</p>
        ) : cannotComplete ? (
          <p>오늘은 <b>{maxReachable}개까지!</b> 남은 별을 마저 깨우고 출구에서 <b>굿바비 행운부적</b>를 받아가세요.</p>
        ) : (
          <p>아직 {s.needed?.filter((n) => n.state !== "won").map((n) => withColor(n.color)).join("·")}이 잠들어 있어요. <b>같은 색 스티커</b>가 붙은 별 표식을 찾아가세요.</p>
        )}
        <p className="muted">재도전권: {s.retry_used ? "사용함" : "1회 남음"}{!s.retry_used && failed > 0 ? " — 틀린 색의 다른 별을 태그하면 쓸 수 있어요" : ""}</p>
      </div>
      <div className="card">
        <p className="muted">화면이 사라지거나 다른 폰으로 옮길 때 필요한 번호예요. 다른 사람에게 보이지 않게 해 주세요.</p>
        {showCode ? <div className="bigcode">{s.join_code}</div> : <button className="btn secondary" onClick={() => setShowCode(true)}>참여번호 보기</button>}
      </div>
    </>
  );
}

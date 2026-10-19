"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { errText } from "@/lib/copy";

// P6 세션 복구
export default function Recover() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fmt = (d: string) => d.length <= 6 ? d : d.length <= 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  const go = async () => {
    setBusy(true); setErr(null);
    const r = await fetch("/api/session/recover", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ joinCode: code }) });
    const j = await r.json();
    setBusy(false);
    if (j.ok) router.replace("/s"); else setErr(errText(j.code));
  };
  return (<>
    <h1>이어서 하기</h1>
    <div className="card">
      <p className="muted">예약할 때 적은 <b>본인 휴대폰번호</b>를 입력하세요. 폰이 바뀌었거나 화면이 사라졌을 때 오늘 진행 중인 참여로 돌아가요. 다른 폰에서 보던 화면도 그대로 쓸 수 있어요.</p>
      <input className="code" type="tel" inputMode="numeric" autoComplete="tel" maxLength={13} value={fmt(code)} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="010-0000-0000" style={{ letterSpacing: 2 }} />
      {err ? <p>{err}</p> : null}
      <button className="btn" onClick={go} disabled={!(/^01[0-9][0-9]{7,8}$/.test(code) || code.length === 6) || busy}>{busy ? "확인 중…" : "이어서 하기"}</button>
      <p className="muted" style={{ fontSize: 13 }}>안내 요원이 알려 준 6자리 참여번호로도 이어서 할 수 있어요. 시작 표식에 휴대폰을 다시 대고 본인 번호를 넣어도 같아요.</p>
    </div>
  </>);
}

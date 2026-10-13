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
  const go = async () => {
    setBusy(true); setErr(null);
    const r = await fetch("/api/session/recover", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ joinCode: code }) });
    const j = await r.json();
    setBusy(false);
    if (j.ok) router.replace("/s"); else setErr(errText(j.code));
  };
  return (<>
    <h1>참여번호로 이어서 하기</h1>
    <div className="card">
      <p className="muted">시작할 때 받은 6자리 <b>참여번호</b>를 입력하세요. (<b>예약번호와 다른 번호입니다</b> — 참여번호는 시작 후 내 별자리 화면에 표시돼요.) 이어서 하면 이전 화면(다른 브라우저)은 더 이상 쓸 수 없어요.</p>
      <input className="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
      {err ? <p>{err}</p> : null}
      <button className="btn" onClick={go} disabled={code.length !== 6 || busy}>{busy ? "확인 중…" : "이어서 하기"}</button>
    </div>
  </>);
}

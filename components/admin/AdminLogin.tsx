"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogin() {
  const router = useRouter();
  const [id, setId] = useState(""); const [pin, setPin] = useState(""); const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, pin }) });
    if (r.ok) router.replace("/admin"); else setErr("아이디 또는 PIN이 맞지 않아요.");
  };
  return (<>
    <h1>관리자 로그인</h1>
    <div className="card">
      <input className="code" style={{ letterSpacing: 1, fontSize: 18 }} value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디" autoCapitalize="none" />
      <input className="code" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" style={{ marginTop: 8 }} />
      {err ? <p>{err}</p> : null}
      <button className="btn" onClick={go} disabled={!id || !pin}>로그인</button>
      <p className="muted">10분 동안 조작이 없으면 자동 로그아웃돼요.</p>
    </div>
  </>);
}

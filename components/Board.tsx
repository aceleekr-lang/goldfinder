"use client";
import { useEffect, useRef, useState } from "react";

type B = { ok: boolean; op_day: boolean; kst_now?: string; close_at?: string; quota?: Record<string, number>; prizes?: Record<string, string>; gold_today?: number; gold_last_id?: number };
const ORD = ["", "첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째", "여섯 번째", "일곱 번째"];
const hm = (t?: string) => (t ?? "").slice(0, 5);

// 입구 현황판 — 1920×1080 가로 모니터, 5초 갱신(금 당첨 축하 연출 감지).
// 당일 잔여 총량(이월 포함)만 보여준다. 구간·개방 규칙은 노출하지 않고 "순서대로 배정됩니다"로 안내 (12차 ⑥·⑦ 확정)
export default function Board() {
  const [b, setB] = useState<B | null>(null);
  const [clock, setClock] = useState("");
  const [armed, setArmed] = useState(false);           // 스태프가 [현황판 시작]을 눌러야 소리 재생 허용 (브라우저 자동재생 제한)
  const [celebrate, setCelebrate] = useState<number | null>(null);   // 몇 번째 금인지 (null = 평소 화면)
  const lastGold = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goldNow = useRef(0);
  const load = () => fetch("/api/board/data").then((r) => r.json()).then((j: B) => {
    setB(j); goldNow.current = j.gold_today ?? 0;
    const id = j.gold_last_id ?? 0;
    if (lastGold.current === null) { lastGold.current = id; return; }   // 첫 로드는 기준점만
    if (id > lastGold.current) { lastGold.current = id; fire(j.gold_today ?? 1); }
  }).catch(() => {});
  const fire = (n: number) => {
    setCelebrate(n);
    try { if (audio.current) { audio.current.currentTime = 0; audio.current.play().catch(() => {}); } } catch {}
    if (timer.current) clearTimeout(timer.current);          // 연속 호출 시 이전 종료 타이머 취소 (깜빡임 방지)
    timer.current = setTimeout(() => setCelebrate(null), 22000);
  };
  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);
  // 관리자 [연출 미리보기]: /board?preview=1 (한 번만) 또는 키보드 G
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview")) setTimeout(() => fire(1), 800);
    const k = (e: KeyboardEvent) => { if (e.key === "g" || e.key === "G") fire(Math.max(1, goldNow.current + 1)); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { const t = () => setClock(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" })); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, []);
  const S = { wrap: { position: "fixed" as const, inset: 0, background: "var(--navy, #141B33)", color: "#F5F1E6", display: "flex", flexDirection: "column" as const, padding: "3vh 4vw", fontFamily: "inherit" },
    title: { fontSize: "5vh", fontWeight: 800, margin: 0 }, sub: { fontSize: "3vh", opacity: 0.8, margin: "1vh 0 3vh" },
    row: (big: boolean) => ({ display: "grid", gridTemplateColumns: "22vw 1fr 30vw", alignItems: "center", padding: big ? "3vh 2vw" : "2vh 2vw", margin: "1.5vh 0", borderRadius: "2vh",
      background: big ? "rgba(242,193,78,.18)" : "rgba(255,255,255,.06)", border: big ? "0.4vh solid var(--gold, #F2C14E)" : "0.2vh solid rgba(255,255,255,.15)" }),
    grade: (big: boolean) => ({ fontSize: big ? "6vh" : "4.5vh", fontWeight: 800, color: big ? "var(--gold, #F2C14E)" : "#F5F1E6" }),
    name: (big: boolean) => ({ fontSize: big ? "5vh" : "3.8vh" }), num: (big: boolean, zero: boolean) => ({ fontSize: big ? "9vh" : "6vh", fontWeight: 800, textAlign: "right" as const, color: zero ? "rgba(255,255,255,.35)" : big ? "var(--gold, #F2C14E)" : "#F5F1E6" }) };
  const overlay = celebrate !== null ? (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#141B33", overflow: "hidden" }}>
      <video src="/gold/gold_win.mp4" poster="/gold/gold_still.webp" autoPlay muted playsInline loop style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "6vh", textAlign: "center", padding: "0 4vw" }}>
        <div style={{ fontSize: "4vh", color: "#F5F1E6", opacity: 0.9, letterSpacing: "0.3vh" }}>축하합니다</div>
        <div style={{ fontSize: "8.5vh", fontWeight: 900, color: "#F2C14E", textShadow: "0 0 3vh rgba(242,193,78,.9), 0 0.4vh 1vh rgba(0,0,0,.6)", lineHeight: 1.15, marginTop: "1vh" }}>
          오늘의 {ORD[Math.min(celebrate, ORD.length - 1)]} 골드바의<br />주인이 나타났습니다!
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: "5vh", textAlign: "center", fontSize: "3.6vh", color: "#F5F1E6", opacity: 0.85 }}>순금 1g 골드바 · 영남루에 흩어진 별을 찾아라</div>
    </div>) : null;
  const goFull = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch {} };
  const armBtn = !armed ? (
    <button onClick={() => { setArmed(true); goFull(); try { audio.current?.play().then(() => { audio.current?.pause(); if (audio.current) audio.current.currentTime = 0; }).catch(() => {}); } catch {} }}
      style={{ position: "fixed", right: "2vw", bottom: "2vh", zIndex: 60, fontSize: "2.4vh", padding: "1.2vh 2vw", borderRadius: "1.5vh", border: "0.3vh solid #F2C14E", background: "rgba(0,0,0,.6)", color: "#F2C14E", cursor: "pointer" }}>
      ▶ 현황판 시작 (개장 전 한 번 클릭 — 전체화면 + 축하 음악 켜기)</button>) : (
    <button onClick={goFull} title="전체화면 켜기/끄기" style={{ position: "fixed", right: "1vw", bottom: "1vh", zIndex: 60, fontSize: "2.2vh", padding: "0.6vh 1.2vh", borderRadius: "1vh", border: "0.2vh solid rgba(245,241,230,.35)", background: "rgba(0,0,0,.35)", color: "rgba(245,241,230,.7)", cursor: "pointer" }}>⛶</button>);
  const audioEl = <audio ref={audio} src="/gold/gold_fanfare.mp3" preload="auto" />;
  if (!b) return <div style={S.wrap}>{audioEl}{armBtn}<p style={S.title}>영남루에 흩어진 별을 찾아라</p></div>;
  if (!b.op_day) return <div style={S.wrap}>{audioEl}{armBtn}{overlay}<p style={S.title}>영남루에 흩어진 별을 찾아라</p><p style={S.sub}>이벤트는 10. 18.~11. 8. 주말(토·일) 저녁에 운영됩니다 · 사전예약제 · 10월 20:30~23:00 / 11월 19:00~23:00 (최종 입장 22:00)</p></div>;
  const q = b.quota ?? {}, p = b.prizes ?? {};
  const allZero = ["g1", "g2", "g3"].every((g) => (q[g] ?? 0) === 0);
  return (
    <div style={S.wrap}>
      {audioEl}{armBtn}{overlay}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <p style={S.title}>오늘 남은 경품</p>
        <p style={{ ...S.sub, margin: 0 }}>현재 {clock} · 뽑기는 {hm(b.close_at)}까지</p>
      </div>
      <p style={S.sub}>5가지 별을 모두 깨우고 출구를 지나면 뽑기권! 경품은 순서대로 배정됩니다.</p>
      {(["g1", "g2", "g3"] as const).map((g) => { const big = g === "g1", n = q[g] ?? 0; return (
        <div key={g} style={S.row(big)}>
          <div style={S.grade(big)}>{{ g1: "1등", g2: "2등", g3: "3등" }[g]}</div>
          <div style={S.name(big)}>{p[g] ?? ""}</div>
          <div style={S.num(big, n === 0)}>{n === 0 ? "소진" : `${n}개`}</div>
        </div>); })}
      <div style={{ marginTop: "auto", fontSize: "3.2vh", opacity: 0.9 }}>
        {allZero ? `오늘 배정된 경품이 모두 나갔어요. 완주하신 분께는 ${p.card ?? "굿바비 행운부적"}을 드립니다.`
                 : `뽑기에 참여한 모든 완주자께 참가상 ${p.card ?? "굿바비 행운부적"}을 드립니다.`}
      </div>
    </div>
  );
}

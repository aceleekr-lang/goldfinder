"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StarSlots from "./StarSlots";
import StoryCard from "./StoryCard";
import { errText, AFTER_NOTE, RSV_URL, RSV_NOTE, RSV_NOTE2, RSV_NOTE_CODE, RSV_NOTE2_CODE, RSV_NOTE_WALKIN, RSV_NOTE2_WALKIN, RSV_NOTE3, COLOR_ORDER, COLOR_NAME, COLOR_WORD, COLOR_HEX, withColor } from "@/lib/copy";
import { readMark } from "./TestBanner";
import MapIntro from "./MapIntro";
import GateIntro from "./fx/GateIntro";
import StarWake, { FlyStar } from "./fx/StarWake";
import Constellation from "./fx/Constellation";
import { sfx } from "@/lib/sfx";

// 같은 날 같은 장면은 한 번만 (브라우저 저장소가 막힌 폰은 매번 — 짧게 건너뛸 수 있음)
// 남은 초 카운트다운 — 0이 되면 then 문구 (쿨다운·너무 빠름 안내용, 2026-10-19)
function Countdown({ sec, then, fmt }: { sec: number; then: string; fmt: (n: number) => React.ReactNode }) {
  const [n, setN] = useState(Math.max(0, Math.ceil(sec)));
  useEffect(() => { if (n <= 0) return; const t = setTimeout(() => setN(n - 1), 1000); return () => clearTimeout(t); }, [n]);
  return <span>{n > 0 ? fmt(n) : <b style={{ color: "#1a7f37" }}>{then}</b>}</span>;
}

function seenOnce(key: string): boolean { try { if (localStorage.getItem(key)) return true; localStorage.setItem(key, "1"); } catch {} return false; }

type Resp = { ok: boolean; status?: string; code?: string; [k: string]: any };
// 현장 참여 입력 보기 (2026-10-29) — 서버 _walkin_valid와 같은 값
const WALKIN_AGES = ["10세 미만", "10대", "20대", "30대", "40대", "50대", "60대", "70대 이상"];
const WALKIN_SIDO = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
type Props = { tagId: string; role: "start" | "star" | "exit"; color: string | null; colorName?: string };

async function post(url: string, body: unknown): Promise<Resp> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await r.json()) as Resp;
  } catch { return { ok: false, code: "SERVER_ERROR" }; }
}

export default function TagFlow(p: Props) {
  if (p.role === "start") return <StartFlow tagId={p.tagId} />;
  if (p.role === "exit") return <ExitFlow tagId={p.tagId} />;
  return <StarFlow tagId={p.tagId} color={p.color ?? ""} colorName={p.colorName ?? ""} />;
}

// ---------- P1 시작 표식 — 사전예약자만 (본인 예약번호 6자리). 참여는 1인 1일 1회 ----------
function StartFlow({ tagId }: { tagId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [r, setR] = useState<Resp | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [mark, setMark] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "gate" | "map">("form");   // 예약번호 확인 → 문 두드리기 → 지도·역주행 동의 → 별자리 화면
  useEffect(() => { setMark(readMark()); }, []);
  const [mode, setMode] = useState<"phone" | "code">("phone");   // 예약 확인 열쇠 (서버 설정 rsv_key)
  const [walkin, setWalkin] = useState(false);   // 현장 접수 허용 (서버 설정 walkin, 2026-10-29)
  useEffect(() => { fetch("/api/session/start").then((r) => r.json()).then((j) => { if (j.rsv_key === "code") setMode("code"); setWalkin(j.walkin === true); }).catch(() => {}); }, []);
  // 현장 참여 (2026-10-29): 예약에 없는 번호 → 안내 → 성별·나이대·거주지 입력 → 확인 → 시작. 서버가 시작 순간에 500명 마감을 다시 검사
  const [wstep, setWstep] = useState<"none" | "offer" | "form" | "confirm">("none");
  const [wfull, setWfull] = useState(false);
  const [wg, setWg] = useState<"M" | "F" | "">("");
  const [wa, setWa] = useState("");
  const [wr, setWr] = useState("");   // "관내" | "관외:<시·도>"
  const [wsido, setWsido] = useState("");
  const start = async (walkin?: { gender: string; age_band: string; region: string }) => {
    setBusy(true); setR(null);
    const res = await post("/api/session/start", { tagId, rsvCode: code, walkin });
    setBusy(false);
    if (res.ok && res.status === "STARTED") { setName((res.name as string) || ""); setPhase("gate"); return; }
    if (res.ok && (res.status === "RESUMED" || res.status === "REATTACHED")) { router.replace("/s"); return; }   // REATTACHED: 본인 번호로 이어서 (2026-10-19)
    if (!res.ok && res.code === "RSV_NOTFOUND_WALKIN") { setWfull(res.full === true); setWstep("offer"); return; }
    if (!res.ok && res.code === "DAY_FULL") { setWstep("none"); }
    setR(res);   // COMPLETED(당일 참여 완료) 또는 오류
  };
  const wRegion = wr === "관내" ? "관내" : wsido ? `관외:${wsido}` : "";
  const wValid = (wg === "M" || wg === "F") && WALKIN_AGES.includes(wa) && wRegion !== "";
  const fmtPhone = (d: string) => d.length <= 3 ? d : d.length <= 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
  const valid = mode === "phone" ? /^01[0-9][0-9]{7,8}$/.test(code) : code.length === 6;
  if (name !== null) {
    return (<>
      <h1>{name ? `${name}님, 시작합니다` : "시작합니다"}</h1><div className="card"><p>별자리 화면으로 이동해요…</p></div>
      {phase === "gate" ? <GateIntro name={name} onDone={() => setPhase("map")} /> : null}
      {phase === "map" ? <MapIntro onDone={() => router.replace("/s")} /> : null}
    </>);
  }
  if (wstep === "offer") {
    return (<>
      <h1>예약 내역이 없는 번호예요</h1>
      <div className="card">
        <p>예약 내역이 없는 번호입니다. 예약하셨다면 번호를 다시 확인해 주세요. 예약하지 않으셨으면 <b>현장 참여</b>로 시작할 수 있어요.</p>
        <p className="muted">입력한 번호: <b>{fmtPhone(code)}</b></p>
        {wfull ? <p style={{ color: "#c62828", fontWeight: 700 }}>{errText("DAY_FULL")}</p> : null}
      </div>
      <button className="btn secondary" onClick={() => setWstep("none")}>번호 다시 입력</button>
      {!wfull ? <button className="btn" onClick={() => setWstep("form")}>현장 참여로 시작</button> : null}
    </>);
  }
  if (wstep === "form" || wstep === "confirm") {
    const pick = (on: boolean): React.CSSProperties => ({ minHeight: 48, fontSize: 17, fontWeight: 700, borderRadius: 12, border: `2px solid ${on ? "#141B33" : "#ccc"}`, background: on ? "#141B33" : "#fff", color: on ? "#fff" : "#141B33", cursor: "pointer", padding: "8px 10px" });
    if (wstep === "confirm") {
      return (<>
        <h1>이 정보가 맞나요?</h1>
        <div className="card" style={{ fontSize: 20, lineHeight: 1.8 }}>
          <div>휴대폰번호 <b>{fmtPhone(code)}</b></div>
          <div>성별 <b>{wg === "M" ? "남" : "여"}</b></div>
          <div>나이대 <b>{wa}</b></div>
          <div>거주지 <b>{wr === "관내" ? "밀양" : wsido}</b></div>
        </div>
        {r && !r.ok ? <div className="card"><p style={{ color: "#c62828", fontWeight: 700 }}>{errText(r.code)}</p></div> : null}
        <button className="btn" disabled={busy} onClick={() => start({ gender: wg, age_band: wa, region: wRegion })}>{busy ? "시작하는 중…" : "맞아요, 시작"}</button>
        <button className="btn secondary" disabled={busy} onClick={() => setWstep("form")}>고칠게요</button>
      </>);
    }
    return (<>
      <h1>현장 참여</h1>
      <div className="card"><p className="muted">통계용으로만 쓰이고, 휴대폰번호와 함께 2027. 1. 7.까지 보관 후 삭제돼요.</p>
        <p style={{ fontWeight: 700, margin: "10px 0 6px" }}>성별</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button style={pick(wg === "M")} onClick={() => setWg("M")}>남</button><button style={pick(wg === "F")} onClick={() => setWg("F")}>여</button></div>
        <p style={{ fontWeight: 700, margin: "14px 0 6px" }}>나이대</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {WALKIN_AGES.map((a) => <button key={a} style={pick(wa === a)} onClick={() => setWa(a)}>{a}</button>)}</div>
        <p style={{ fontWeight: 700, margin: "14px 0 6px" }}>거주지</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button style={pick(wr === "관내")} onClick={() => { setWr("관내"); setWsido(""); }}>밀양</button>
          <button style={pick(wr === "관외")} onClick={() => setWr("관외")}>그 외 시·도</button></div>
        {wr === "관외" ? <select value={wsido} onChange={(e) => setWsido(e.target.value)} style={{ width: "100%", minHeight: 48, fontSize: 17, marginTop: 8, borderRadius: 10, padding: "6px 10px" }}>
          <option value="">시·도를 고르세요</option>{WALKIN_SIDO.map((x) => <option key={x} value={x}>{x}</option>)}</select> : null}
      </div>
      <button className="btn" disabled={!wValid} onClick={() => { setR(null); setWstep("confirm"); }}>다음</button>
      <button className="btn secondary" onClick={() => setWstep("none")}>번호 다시 입력</button>
    </>);
  }
  if (r?.ok && r.status === "COMPLETED") {
    const t = r.ticket as { id: string; status: string } | null;
    const pending = t && !["redeemed", "void"].includes(t.status);
    return (<>
      <h1>오늘은 이미 참여하셨어요</h1>
      <div className="card">
        <p>참여는 <b>1인 1일 1회</b>예요. 다음 운영일에 다시 만나요!</p>
        {pending ? <p>아직 받지 않은 <b>뽑기권</b>이 있어요. 오늘 23:00 전에 경품 수령소에서 받아 가세요.</p> : null}
      </div>
      {pending ? <Link className="btn" href="/ticket">뽑기권 보기</Link> : null}
      <Link className="btn secondary" href="/s">내 별자리 보기</Link>
    </>);
  }
  const errCode = r && !r.ok ? r.code : null;
  const errMsg = errCode === "BEFORE_OPEN" && r?.open_at ? `오늘 금찾기는 ${String(r.open_at).slice(0, 5)}에 시작합니다. 그동안 별조명 만들기 체험과 간이장터를 즐겨 주세요.` : errText(errCode ?? undefined);
  return (
    <>
      <h1>별찾기를 시작할까요?</h1>
      <div className="card">
        <p>{mode !== "phone" ? RSV_NOTE_CODE : walkin ? RSV_NOTE_WALKIN : RSV_NOTE}</p>
        <p className="muted">{mode !== "phone" ? RSV_NOTE2_CODE : walkin ? RSV_NOTE2_WALKIN : RSV_NOTE2}</p>
        <p className="muted">{RSV_NOTE3}</p>
      </div>
      <div className="card">
        {mode === "phone" ? (<>
          <label htmlFor="rsv" style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>본인 휴대폰번호</label>
          <input id="rsv" type="tel" inputMode="numeric" autoComplete="tel" maxLength={13} placeholder="010-0000-0000"
            value={fmtPhone(code)} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 11))}
            style={{ width: "100%", fontSize: 26, letterSpacing: 2, textAlign: "center", padding: 10, borderRadius: 10, border: "1px solid var(--line, #ccc)" }} />
          {mark ? <p style={{ color: "#c62828", fontWeight: 700, margin: "6px 0" }}>{mark.includes("r") ? "테스트폰 · 실제 예약 모드: 예약앱에 있는 진짜 휴대폰번호를 넣으세요 (사용 처리돼요)." : "테스트폰: 아무 휴대폰번호(예: 010-0000-0000)로 시작할 수 있어요."}</p> : null}
          {walkin ? <p className="muted" style={{ marginTop: 6 }}>예약하지 않았어도 본인 번호로 현장 참여할 수 있어요. 이 번호로 이어하기·현장 지원을 해요.</p>
            : <p className="muted" style={{ marginTop: 6 }}>예약할 때 적은 번호예요. 예약 여부는 <a href={RSV_URL} target="_blank" rel="noreferrer">예약 조회</a>에서 확인할 수 있어요.</p>}
        </>) : (<>
          <label htmlFor="rsv" style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>본인 예약번호 6자리</label>
          <input id="rsv" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" placeholder="예) 123456"
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            style={{ width: "100%", fontSize: 28, letterSpacing: 6, textAlign: "center", padding: 10, borderRadius: 10, border: "1px solid var(--line, #ccc)" }} />
          {mark ? <p style={{ color: "#c62828", fontWeight: 700, margin: "6px 0" }}>{mark.includes("r") ? "테스트폰 · 실제 예약번호 모드: 예약앱에서 만든 진짜 번호를 넣으세요 (번호 1개가 사용 처리돼요)." : "테스트폰: 아무 6자리 숫자(예: 000000)로 시작할 수 있어요."}</p> : null}
          <p className="muted" style={{ marginTop: 6 }}>번호를 모르시면 <a href={RSV_URL} target="_blank" rel="noreferrer">예약 조회</a>에서 이름·휴대폰으로 확인하세요.</p>
        </>)}
      </div>
      {errCode ? <div className="card"><p>{errMsg}</p>
        {errCode === "RSV_NOTFOUND" ? <p className="muted"><a href={RSV_URL} target="_blank" rel="noreferrer">예약 조회로 가기</a></p> : null}</div> : null}
      <button className="btn" onClick={() => start()} disabled={busy || !valid}>{busy ? "확인 중…" : "시작하기"}</button>
      <div className="card">
        <p className="muted">정원 곳곳의 별 표식 QR을 카메라로 찍고, 이야기를 읽은 뒤 문제를 맞히면 별이 깨어나요. 5가지 색을 모두 깨우고 <b>출구 표식</b> QR을 찍으면 뽑기권!</p>
        <p className="muted">별 표식은 <b>5가지 색 스티커</b>로 구분돼요. 색을 보고 아직 못 깨운 별을 찾아가세요. 참여는 1인 1일 1회, 이미 시작했다면 그대로 이어집니다.</p>
        <ColorLegend />
      </div>
    </>
  );
}

// 5색 범례 — 별 표식 스티커 색과 같은 색 (2026-10-15)
function ColorLegend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 8 }}>
      {COLOR_ORDER.map((c) => (
        <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14 }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: COLOR_HEX[c], border: "1px solid #999", display: "inline-block" }} />
          {COLOR_WORD[c]} = {COLOR_NAME[c]}
        </span>))}
    </div>
  );
}

// ---------- P3/P4 별 표식 ----------
// 별 색 머리띠 — 태그한 별의 색을 화면 전체에 크게 (2026-10-15)
const ZONE_OF: Record<string, number> = { yellow: 1, red: 2, white: 3, teal: 4, orange: 5 };
function StarHead({ color, title }: { color: string; title: string }) {
  const hex = COLOR_HEX[color] ?? "#888"; const dark = color === "white" || color === "yellow";
  return (
    <div style={{ background: `linear-gradient(135deg, ${hex}, ${hex}cc)`, color: dark ? "#141B33" : "#fff", borderRadius: 16, padding: "14px 16px", margin: "6px 0 12px",
      display: "flex", alignItems: "center", gap: 14, boxShadow: `0 6px 22px ${hex}66`, border: color === "white" ? "1px solid #bbb" : undefined }}>
      <svg viewBox="0 0 24 24" width={58} height={58} style={{ flex: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.3))" }}>
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" fill={dark ? "#141B33" : "#fff"} opacity={0.92} /></svg>
      <div><div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{COLOR_WORD[color] ?? ""} 별{ZONE_OF[color] ? ` · ${ZONE_OF[color]}구역` : ""}</div></div>
    </div>);
}

function StarFlow({ tagId, color, colorName }: { tagId: string; color: string; colorName: string }) {
  const [r, setR] = useState<Resp | null>(null);
  const [ans, setAns] = useState<Resp | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [wish, setWish] = useState("");
  const [wishDone, setWishDone] = useState<string | null>(null);
  const [woke, setWoke] = useState(false);
  const [fly, setFly] = useState(false);
  const once = useRef(false);
  const attempt = async (useRetry = false) => { setR(null); setR(await post(`/api/tag/${tagId}/attempt`, { useRetry })); };
  useEffect(() => { if (!once.current) { once.current = true; attempt(); } }, []);   // eslint-disable-line

  if (!r) return <div className="spin">별을 깨우는 중…</div>;

  if (!r.ok) {
    return (<>
      <StarHead color={color} title={colorName} />
      <div className="card"><p>{errText(r.code)}</p></div>
      {r.code === "NO_SESSION" ? <Link className="btn" href="/recover">휴대폰번호로 이어서 하기</Link> : null}
      {r.code === "SESSION_COMPLETED" ? <Link className="btn" href="/ticket">뽑기권 보기</Link> : null}
      <Link className="btn secondary" href="/s">내 별자리</Link>
    </>);
  }

  const stars = (r.stars ?? {}) as Record<string, string>;
  const remaining = (r.needed as { color: string; state: string }[] | undefined)?.filter((n) => n.state !== "won").map((n) => withColor(n.color)).join("·");
  // 새로 출제된 별·소원별은 "잠든 별 깨우기" 연출부터 (다시 찍어 이어지는 문제는 바로)
  if (!woke && ((r.status === "QUIZ" && !r.resumed) || r.status === "WISH")) return <StarWake color={color} name={colorName} onDone={() => setWoke(true)} />;

  if (r.status === "QUIZ") {
    const quiz = r.quiz as { id: number; question: string; choices: string[] };
    const submit = async (i: number) => {
      if (ans || picked !== null) return;
      setPicked(i);
      const a = await post("/api/quiz/answer", { attemptId: r.attempt_id, answerIdx: i });
      setAns(a);
      if (a.ok && a.correct) { sfx.correct(); setFly(true); setTimeout(() => setFly(false), 1300); } else if (a.ok) sfx.wrong();
    };
    return (<>
      {fly ? <FlyStar color={color} /> : null}
      <StarHead color={color} title={`${colorName}${r.is_retry ? " — 재도전" : ""}`} />
      <StoryCard story={r.story} />
      <div className="card">
        <p><b>Q.</b> {quiz.question}</p>
        {quiz.choices.map((c, i) => {
          const cls = ans ? (i === ans.correct_idx ? "correct" : i === picked ? "wrong" : "") : "";
          return <button key={i} className={`choice ${cls}`} onClick={() => submit(i)} disabled={!!ans || picked !== null}>{c}</button>;
        })}
      </div>
      {ans ? (
        ans.ok ? (
          <div className="card">
            <p className="result" style={ans.correct ? { color: color === "white" ? "#6b6b6b" : COLOR_HEX[color], fontWeight: 900 } : undefined}>{ans.correct ? `${colorName}이 깨어났어요 ★` : "아쉬워요"}</p>
            {ans.correct ? null : (
              <p>{ans.retry_available ? "재도전권 1회가 남아 있어요. 같은 색의 다른 별 QR을 찍으면 새 문제로 다시 도전할 수 있어요." : "이 색은 오늘 깨울 수 없지만, 다른 색 별을 계속 찾을 수 있어요."}</p>
            )}
            <StarSlots stars={(ans.stars ?? stars) as Record<string, string>} />
            {ans.all_won ? <p><b>별자리 완성!</b> 출구 표식 QR을 찍으면 뽑기권이 나와요.</p> : null}
            <Link className="btn" href="/s">내 별자리</Link>
          </div>
        ) : <div className="card"><p>{errText(ans.code)}</p><button className="btn secondary" onClick={() => { setAns(null); setPicked(null); }}>다시 시도</button></div>
      ) : null}
    </>);
  }

  if (r.status === "WISH") {
    const send = async () => { const w = await post("/api/wish", { body: wish }); setWishDone(w.ok ? "소원을 별에 실었어요 ✦" : errText(w.code)); };
    return (<>
      <StarHead color={color} title={`${colorName}이 깨어났어요 ★`} />
      <StoryCard story={r.story} />
      {wishDone ? <div className="card"><p>{wishDone}</p></div> : (
        <div className="card">
          <p>이 별에 소원을 남겨 보세요. (선택, 100자 이내)</p>
          <p className="muted">이름·전화번호 같은 개인정보는 적지 마세요. 소원은 익명으로 보관돼요.</p>
          <textarea maxLength={100} value={wish} onChange={(e) => setWish(e.target.value)} placeholder="예) 가족 모두 건강하게" />
          <button className="btn" onClick={send} disabled={!wish.trim()}>소원 남기기</button>
        </div>
      )}
      <StarSlots stars={stars} />
      <Link className="btn secondary" href="/s">{wishDone ? "내 별자리" : "건너뛰기"}</Link>
    </>);
  }

  if (r.status === "RETRY_OFFER") {
    return (<>
      <StarHead color={color} title={`${colorName}에 다시 도전할까요?`} />
      <div className="card">
        <p>이 색은 아까 틀렸어요. <b>재도전권(1회)</b>을 쓰면 새 문제로 다시 도전할 수 있어요.</p>
        <p className="muted">재도전권은 오늘 한 번만 쓸 수 있어요. 다른 색에 아껴 둘 수도 있습니다.</p>
      </div>
      <button className="btn" onClick={() => attempt(true)}>재도전권 사용</button>
      <Link className="btn secondary" href="/s">다른 별 찾기</Link>
    </>);
  }

  const msg: Record<string, React.ReactNode> = {
    DUP_COLOR: `${colorName}은 이미 깨웠어요. 아직 잠든 별: ${remaining || "없음"}`,
    ALREADY_FAILED: `이 색은 오늘 깨울 수 없어요. 아직 잠든 다른 별: ${remaining || "없음"}`,
    COOLDOWN: <>이 별은 방금 다른 분이 깨웠어요. <Countdown sec={r.seconds_left ?? 0} then="지금 다시 QR을 찍어 보세요!" fmt={(n) => <u style={{ textDecorationColor: "#c62828", textDecorationThickness: 3, textUnderlineOffset: 4 }}><b style={{ fontSize: 24, color: "#c62828" }}>{n}초</b> 뒤에 다시 깨어나요.</u>} />
      {(r.others_available ?? 0) > 0 ? <><br /><span className="muted">같은 구역에 {colorName}이 {r.others_available}개 더 있어요. 기다리기 싫으면 옆 별을 찾아보세요.</span></> : null}</>,
    TOO_FAST: <>너무 빨라요! <Countdown sec={r.wait_sec ?? 30} then="지금 다시 QR을 찍어 보세요!" fmt={(n) => <u style={{ textDecorationColor: "#c62828", textDecorationThickness: 3, textUnderlineOffset: 4 }}><b style={{ fontSize: 24, color: "#c62828" }}>{n}초</b> 뒤에 다시 찍어 주세요.</u>} /></>,
  };
  return (<>
    <StarHead color={color} title={colorName} />
    <div className="card"><p style={{ fontSize: 17, lineHeight: 1.6 }}>{msg[r.status ?? ""] ?? "다시 시도해 주세요."}</p></div>
    <StarSlots stars={stars} />
    <Link className="btn secondary" href="/s">내 별자리</Link>
  </>);
}

// ---------- P5 출구 표식 ----------
function ExitFlow({ tagId }: { tagId: string }) {
  const [r, setR] = useState<Resp | null>(null);
  const once = useRef(false);
  const [showSky, setShowSky] = useState(false);
  const go = async (confirm: boolean) => {
    setR(null); const res = await post("/api/session/exit", { tagId, confirm }); setR(res);
    // 별자리 연출은 뽑기권 처음 받을 때 / 미완성 종료 때 한 번만
    const t = res.ticket as { id?: string } | undefined;
    if (res.ok && res.status === "TICKET" && t?.id && !seenOnce(`gf_cons_${t.id}`)) setShowSky(true);
    else if (res.ok && (res.status === "CARD" || res.status === "THANKS") && !seenOnce(`gf_cons_${res.join_code}`)) setShowSky(true);
  };
  useEffect(() => { if (!once.current) { once.current = true; go(false); } }, []);   // eslint-disable-line
  if (!r) return <div className="spin">별자리를 확인하는 중…</div>;
  if (!r.ok) {
    return (<>
      <h1>출구</h1>
      <div className="card"><p>{errText(r.code)}</p></div>
      {r.code === "NO_SESSION" ? <Link className="btn" href="/recover">휴대폰번호로 이어서 하기</Link> : null}
      <Link className="btn secondary" href="/s">내 별자리</Link>
    </>);
  }
  const stars = (r.stars ?? {}) as Record<string, string>;
  const remaining = (r.needed as { color: string; state: string }[] | undefined)?.filter((n) => n.state !== "won").map((n) => withColor(n.color)).join("·");
  if (showSky) return <Constellation stars={stars} complete={r.status === "TICKET"} onDone={() => setShowSky(false)} />;
  if (r.status === "TICKET") {
    return (<>
      <h1>별자리 완성!</h1>
      <StarSlots stars={stars} />
      <div className="card"><p>뽑기권이 발급됐어요. <b>경품 수령소</b>에서 직원에게 뽑기권 화면을 보여 주세요.</p>
        <p className="muted">뽑기권은 오늘 23:00까지 유효해요.</p>
        <p className="muted">{AFTER_NOTE}</p></div>
      <Link className="btn" href="/ticket">뽑기권 보기</Link>
    </>);
  }
  if (r.status === "HOLD") {
    return (<>
      <h1>별자리 완성!</h1>
      <StarSlots stars={stars} />
      <div className="card"><p>뽑기권은 <b>{r.minutes_left}분 뒤</b> 출구 표식 QR을 다시 찍으면 나와요. 그동안 정원을 조금 더 둘러보세요.</p></div>
      <Link className="btn secondary" href="/s">내 별자리</Link>
    </>);
  }
  if (r.status === "CONFIRM") {
    return (<>
      <h1>아직 {remaining}이 남았어요</h1>
      <StarSlots stars={stars} />
      <div className="card"><p>정말 종료할까요? 종료하면 오늘은 다시 별을 깨울 수 없어요.</p></div>
      <button className="btn secondary" onClick={() => go(true)}>네, 종료할게요</button>
      <Link className="btn" href="/s">계속 별 찾기</Link>
    </>);
  }
  return (<>
    <h1>{r.status === "CARD" ? "오늘의 별찾기 끝!" : "함께해 주셔서 고마워요"}</h1>
    <StarSlots stars={stars} />
    <div className="card">
      {r.status === "CARD" ? <p>{r.star_count}개의 별을 깨웠어요. 출구 안내소에서 <b>굿바비 행운부적</b>을 받아가세요.</p> : <p>다음에는 별을 꼭 깨워 보세요.</p>}
      <p className="muted">{AFTER_NOTE}</p>
    </div>
    <Link className="btn secondary" href="/">처음으로</Link>
  </>);
}

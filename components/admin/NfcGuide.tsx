"use client";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { COLOR_HEX, COLOR_WORD } from "@/lib/copy";

// NFC 태그 인코딩 안내 화면 (초보자용) — 안드로이드 'NFC Tools' 앱 기준
// 1) 3단계 안내  2) 태그 카드(URL 복사·QR·완료 체크)  3) 대조표 인쇄
type Tag = { id: string; role: "star" | "start" | "exit"; color: string | null; label: string; zone: string | null; active: boolean; is_spare: boolean; encoded_at: string | null; checked_at?: string | null; checked_by?: string | null; url: string };
type Resp = { ok: boolean; tags: Tag[]; base?: string };

const COLOR_KO: Record<string, string> = { yellow: "영남루별", red: "아리랑별", white: "달빛별", teal: "밀양별", orange: "소원별" };


function QR({ text, size }: { text: string; size: number }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => { QRCode.toDataURL(text, { errorCorrectionLevel: "L", margin: 1, width: size }).then(setSrc).catch(() => setSrc("")); }, [text, size]);
  return src ? <img src={src} width={size} height={size} alt="QR" style={{ display: "block", background: "#fff" }} /> : <div style={{ width: size, height: size, background: "#eee" }} />;
}

export default function NfcGuide() {
  const [d, setD] = useState<Resp | null>(null);
  const [filter, setFilter] = useState<"install" | "spare" | "gate" | "all">("install");
  const [copied, setCopied] = useState<string | null>(null);
  const [print, setPrint] = useState(false);
  const load = () => fetch("/api/admin/tags").then((r) => r.json()).then(setD);
  useEffect(() => { load(); }, []);
  const base = useMemo(() => (d?.base && d.base.length > 0 ? d.base : (typeof window !== "undefined" ? window.location.origin : "")), [d]);
  if (!d) return <p>불러오는 중…</p>;
  if (!d.ok) return <p>태그 목록을 불러오지 못했어요.</p>;

  const full = (t: Tag) => `${base}/t/${t.id}`;
  const list = d.tags.filter((t) => filter === "all" ? true : filter === "gate" ? t.role !== "star" : filter === "spare" ? (t.role === "star" && t.is_spare) : (t.role === "star" && !t.is_spare));
  const done = d.tags.filter((t) => t.encoded_at).length;
  const kstDay = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
  const checkedToday = (t: Tag) => !!t.checked_at && kstDay(t.checked_at) === today;
  const inUse = d.tags.filter((t) => t.active && !t.is_spare);
  const chk = inUse.filter(checkedToday).length;
  const copy = async (t: Tag) => { try { await navigator.clipboard.writeText(full(t)); setCopied(t.id); setTimeout(() => setCopied(null), 1500); } catch { prompt("아래 주소를 길게 눌러 복사하세요", full(t)); } };
  const mark = async (t: Tag, v: boolean) => { await fetch("/api/admin/tags", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId: t.id, encoded: v }) }); load(); };
  const title = (t: Tag) => t.role === "start" ? `시작 표식 (${t.label})` : t.role === "exit" ? `출구 표식 (${t.label})` : t.label;
  const sub = (t: Tag) => t.role === "star" ? `${COLOR_KO[t.color ?? ""] ?? t.color} · ${COLOR_WORD[t.color ?? ""] ?? ""} 스티커 · ${t.zone ?? "구역 미정"}${t.is_spare ? " · 예비" : ""}` : "입구/출구";

  if (print) {
    // 대조표 인쇄: A4 세로, 4열 — 번호·색·구역·QR·URL. 설치 때 들고 다니는 지도 겸 QR 스티커 원본
    const all = d.tags.filter((t) => t.role !== "star" || !t.is_spare).concat(d.tags.filter((t) => t.role === "star" && t.is_spare));
    return (
      <div style={{ background: "#fff", color: "#000", padding: 12 }}>
        <style>{`@media print { .noprint { display: none } body { background: #fff } .nav, nav, header { display: none !important } } .pg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; } .cell { border: 1px solid #999; padding: 6px; break-inside: avoid; font-size: 11px; text-align: center } .cell b { font-size: 13px }`}</style>
        <div className="noprint" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={() => window.print()}>이 화면 인쇄 (A4)</button>
          <button className="btn secondary" onClick={() => setPrint(false)}>돌아가기</button>
          <p className="muted">브라우저 인쇄 창에서 '배경 그래픽' 켜기 · 여백 '기본'. QR은 20mm 이상으로 나오게 4열 기준으로 짜여 있습니다.</p>
        </div>
        <h2 style={{ margin: "4px 0 8px" }}>영남루 별찾기 태그 대조표 — 총 {all.length}개 (설치 40 · 예비 20 · 시작·출구 4)</h2>
        <div className="pg">
          {all.map((t) => (
            <div key={t.id} className="cell" style={{ borderTop: `6px solid ${t.color ? COLOR_HEX[t.color] : "#555"}` }}>
              <b>{title(t)}</b><div>{sub(t)}</div>
              <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}><QR text={full(t)} size={110} /></div>
              <div style={{ fontFamily: "monospace", fontSize: 10 }}>{t.id}</div>
              <div style={{ marginTop: 3 }}>□ 인코딩 &nbsp; □ 설치</div>
            </div>))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>NFC 태그 만들기</h1>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>딱 3단계예요 (안드로이드)</h2>
        <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li><b>플레이스토어에서 'NFC Tools' 설치</b> (무료, 파란 아이콘). 설정에서 NFC가 켜져 있는지 확인.</li>
          <li>아래 카드에서 <b>[URL 복사]</b>를 누르세요. → NFC Tools 앱 열기 → <b>쓰기</b> 탭 → <b>레코드 추가</b> → <b>URL/URI</b> → 복사한 주소 <b>붙여넣기</b> → 확인.</li>
          <li><b>쓰기</b> 버튼 → 폰 뒷면을 스티커에 가져다 대면 '쓰기 완료'. 그 다음 같은 화면의 <b>기타 → 읽기 전용으로 잠금(Lock)</b>을 한 번 더 태그해서 잠그세요. 끝나면 카드의 <b>[완료]</b>를 눌러 체크.</li>
        </ol>
        <p className="muted">요령: 스티커 뒷면에 연필로 카드 제목(예: 영남루별 3번)을 적어 두면 설치할 때 헷갈리지 않아요. 잠그기 전에 폰으로 한 번 태그해서 화면이 뜨는지 꼭 확인하세요.</p>
        <p className="muted">주소 앞부분: <code>{base || "(배포 후 PUBLIC_BASE_URL 설정값)"}</code></p>
      </div>

      <div className="card">
        <p><b>진행: {done} / {d.tags.length}개 완료</b> · 오늘 점검(테스트폰 점검 모드) {chk} / {inUse.length}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([["install", "설치용 별 40"], ["spare", "예비 별 20"], ["gate", "시작·출구"], ["all", "전체"]] as const).map(([k, v]) => (
            <button key={k} className={"btn " + (filter === k ? "" : "secondary")} style={{ padding: "6px 10px", margin: 0, fontSize: 14 }} onClick={() => setFilter(k)}>{v}</button>))}
          <button className="btn secondary" style={{ padding: "6px 10px", margin: 0, fontSize: 14, marginLeft: "auto" }} onClick={() => setPrint(true)}>대조표 인쇄 (A4)</button>
        </div>
      </div>

      {list.map((t) => (
        <div key={t.id} className="card" style={{ borderLeft: `8px solid ${t.color ? COLOR_HEX[t.color] : "#777"}`, opacity: t.encoded_at ? 0.6 : 1 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <QR text={full(t)} size={88} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{title(t)}</div>
              <div className="muted">{sub(t)}{t.active ? "" : " · (비활성)"}</div>
              {t.checked_at ? <div style={{ fontSize: 13, color: checkedToday(t) ? "#2e7d32" : "var(--muted)" }}>{checkedToday(t) ? "오늘 점검 ✓ " : "마지막 점검 "}{new Date(t.checked_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}{t.checked_by ? ` · ${t.checked_by}` : ""}</div> : null}
              <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", marginTop: 4 }}>{full(t)}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" style={{ margin: 0, flex: 1 }} onClick={() => copy(t)}>{copied === t.id ? "복사됐어요 ✓" : "URL 복사"}</button>
            <button className={"btn " + (t.encoded_at ? "secondary" : "")} style={{ margin: 0, flex: 1 }} onClick={() => mark(t, !t.encoded_at)}>{t.encoded_at ? "완료 취소" : "완료"}</button>
          </div>
        </div>))}
    </>
  );
}

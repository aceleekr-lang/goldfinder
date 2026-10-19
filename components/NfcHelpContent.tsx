"use client";
import { useEffect, useRef, useState } from "react";
import { NFC_HELP, NFC_IMG_VER, detectTab, type HelpBlock } from "@/lib/nfcHelp";

// 'NFC 켜는 법' 본문 — 앱 안 도움말 창과 /nfc 페이지가 같이 쓴다. 남색 바탕 + 금색 포인트, 본문 18px·제목 22px 이상, 한 줄에 한 동작
const GOLD = "#F2C14E", INK = "#F5F1E6", NAVY = "#141B33", PANEL = "rgba(255,255,255,.07)", LINE = "rgba(245,241,230,.22)";

/** **굵게** 와 `코드` 표시를 글자 서식으로 */
export function Rich({ t }: { t: string }) {
  const parts = t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return <>{parts.map((p, i) => p.startsWith("**") ? <b key={i} style={{ color: GOLD }}>{p.slice(2, -2)}</b>
    : p.startsWith("`") ? <code key={i} style={{ background: "rgba(255,255,255,.15)", padding: "0 6px", borderRadius: 6, fontSize: "0.95em" }}>{p.slice(1, -1)}</code> : <span key={i}>{p}</span>)}</>;
}

/** 그림 — 못 불러오면 자리까지 없앤다 (깨진 그림 금지). 서버 렌더 뒤 하이드레이션 전에 실패한 경우도 잡는다 */
function Pic({ file, alt }: { file: string; alt: string }) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement | null>(null);
  useEffect(() => { const im = ref.current; if (im && im.complete && im.naturalWidth === 0) setOk(false); }, []);
  if (!ok) return null;
  return <img ref={ref} src={`/nfc/${file}?v=${NFC_IMG_VER}`} alt={alt} onError={() => setOk(false)}
    style={{ display: "block", width: "100%", maxWidth: 360, margin: "10px auto 12px", borderRadius: 14, border: `1px solid ${LINE}` }} />;
}

function Block({ b }: { b: HelpBlock }) {
  return (
    <section style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, padding: "16px 16px 8px", margin: "14px 0" }}>
      <h3 style={{ fontSize: 22, lineHeight: 1.35, margin: 0, color: INK }}>{b.title}{b.badge ? <span style={{ color: GOLD, fontSize: 18, marginLeft: 8, whiteSpace: "nowrap" }}>{b.badge}</span> : null}</h3>
      {b.intro ? <p style={{ fontSize: 18, lineHeight: 1.6, margin: "8px 0 0" }}><Rich t={b.intro} /></p> : null}
      {b.img ? <Pic file={b.img} alt={b.title} /> : null}
      {b.steps ? <ol style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
        {b.steps.map((s, i) => (
          <li key={i} style={{ display: "flex", gap: 12, fontSize: 18, lineHeight: 1.6, margin: "0 0 12px" }}>
            <span style={{ flex: "none", width: 32, height: 32, borderRadius: "50%", background: GOLD, color: NAVY, fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
            <span><Rich t={s} /></span>
          </li>))}
      </ol> : null}
      {b.note ? (
        <div style={{ background: "rgba(0,0,0,.28)", borderRadius: 12, padding: "12px 14px", margin: "4px 0 10px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 6 }}>{b.note.title}</div>
          {b.note.lines.map((l, i) => <p key={i} style={{ fontSize: 18, lineHeight: 1.6, margin: "0 0 6px" }}><Rich t={l} /></p>)}
        </div>) : null}
    </section>
  );
}

export default function NfcHelpContent({ top, bottom }: { top?: string; bottom?: string }) {
  const [tab, setTab] = useState<"android" | "iphone">("android");
  useEffect(() => { setTab(detectTab()); }, []);   // 아이폰이면 아이폰 탭 먼저
  const cur = NFC_HELP.tabs.find((t) => t.key === tab) ?? NFC_HELP.tabs[0];
  return (
    <div style={{ color: INK, fontSize: 18, lineHeight: 1.6 }}>
      {top ? <div style={{ fontSize: 15, color: GOLD, letterSpacing: ".04em", marginBottom: 6 }}>{top}</div> : null}
      <h1 style={{ fontSize: 30, margin: "0 0 10px", color: INK, lineHeight: 1.25 }}>{NFC_HELP.title}</h1>
      {NFC_HELP.lead.map((l, i) => <p key={i} style={{ margin: "0 0 6px", fontSize: 18 }}>{l}</p>)}
      <div role="tablist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "16px 0 6px" }}>
        {NFC_HELP.tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            style={{ minHeight: 52, fontSize: 18, fontWeight: 800, borderRadius: 14, cursor: "pointer",
              border: `2px solid ${tab === t.key ? GOLD : LINE}`, background: tab === t.key ? GOLD : "transparent", color: tab === t.key ? NAVY : INK }}>{t.label}</button>))}
      </div>
      {cur.blocks.map((b, i) => <Block key={i} b={b} />)}
      <section style={{ border: `2px solid ${GOLD}`, borderRadius: 16, padding: "16px 16px 6px", margin: "18px 0 10px" }}>
        <h3 style={{ fontSize: 22, margin: "0 0 10px", color: GOLD }}>{NFC_HELP.common.title}</h3>
        {NFC_HELP.common.lines.map((l, i) => <p key={i} style={{ display: "flex", gap: 10, margin: "0 0 10px" }}><span style={{ color: GOLD }}>•</span><span><Rich t={l} /></span></p>)}
      </section>
      {bottom ? <p style={{ fontSize: 20, fontWeight: 800, color: GOLD, textAlign: "center", margin: "18px 0 6px", lineHeight: 1.5 }}>{bottom}</p> : null}
    </div>
  );
}

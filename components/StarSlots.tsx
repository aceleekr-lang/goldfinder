import { COLOR_NAME, COLOR_ORDER, COLOR_WORD } from "@/lib/copy";

const VAR: Record<string, string> = { yellow: "var(--yellow)", red: "var(--red)", white: "var(--white-star)", teal: "var(--teal)", orange: "var(--orange)" };

// P2 수집 현황: 획득 / 실패 / 미도전 3상태
export default function StarSlots({ stars }: { stars: Record<string, string> }) {
  return (
    <div className="stars">
      {COLOR_ORDER.map((c) => {
        const st = stars?.[c];
        const cls = st === "won" ? "won" : st === "failed" ? "failed" : "pending";
        return (
          <div key={c} className={`star ${cls}`} style={{ ["--c" as string]: VAR[c] }}>
            <div className="dot">{st === "won" ? "★" : st === "failed" ? "✕" : "☆"}</div>
            {COLOR_NAME[c]}<br /><span style={{ opacity: 0.7, fontSize: 11 }}>{COLOR_WORD[c]}</span>
          </div>
        );
      })}
    </div>
  );
}

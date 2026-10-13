"use client";
import { useEffect, useState } from "react";

type Color = { color: string; name: string; has_quiz: boolean };
type Story = { id: number; color: string; title: string; body: string; image_url: string | null; sort: number; active: boolean };
type Quiz = { id: number; color: string; story_id: number; question: string; choices: string[]; answer_idx: number; active: boolean; asked: number; correct: number };
type Data = { ok: boolean; colors: Color[]; stories: Story[]; quizzes: Quiz[] };

const inp = { fontSize: 15, padding: 8, border: "1px solid var(--line)", borderRadius: 8, width: "100%", fontFamily: "inherit" } as const;
const small = { padding: "6px 10px", fontSize: 13, margin: "4px 4px 0 0", width: "auto", display: "inline-block" } as const;

// 관리자 콘텐츠: 색 → 스토리(본문) → 그 스토리에서 답할 수 있는 퀴즈. 삭제는 없고 비활성만 (참가 이력 보존)
export default function ContentEditor() {
  const [d, setD] = useState<Data | null>(null);
  const [color, setColor] = useState("yellow");
  const [story, setStory] = useState<Partial<Story> | null>(null);   // 편집 중 스토리 (id 없으면 신규)
  const [quiz, setQuiz] = useState<Partial<Quiz> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => fetch("/api/admin/content").then((r) => r.json()).then(setD);
  useEffect(() => { load(); }, []);
  const post = async (body: unknown, ok: string) => {
    setMsg(null);
    const r = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (j.ok) { setMsg(ok); setStory(null); setQuiz(null); load(); }
    else setMsg({ FORBIDDEN: "총괄 계정만 변경할 수 있어요.", CHOICES_INVALID: "보기는 2~4개, 정답은 그중 하나여야 해요.", VALUE_INVALID: "제목·본문·문항·보기를 모두 채워 주세요.", COLOR_NO_QUIZ: "소원별은 퀴즈가 없어요." }[j.code as string] ?? `저장 실패 (${j.code})`);
  };

  if (!d) return <div className="spin">불러오는 중…</div>;
  const c = d.colors.find((x) => x.color === color)!;
  const stories = d.stories.filter((s) => s.color === color);
  const quizzesOf = (sid: number) => d.quizzes.filter((q) => q.story_id === sid);
  const activeQuizCount = d.quizzes.filter((q) => q.color === color && q.active && stories.find((s) => s.id === q.story_id)?.active).length;

  return (<>
    <h1>스토리·퀴즈</h1>
    {msg ? <div className="banner">{msg}</div> : null}
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
      {d.colors.map((x) => (
        <button key={x.color} className="btn secondary" style={{ ...small, fontWeight: x.color === color ? 800 : 400 }} onClick={() => { setColor(x.color); setStory(null); setQuiz(null); }}>
          {x.name} ({d.quizzes.filter((q) => q.color === x.color && q.active).length})
        </button>))}
    </div>
    <p className="muted">{c.name}: 스토리 {stories.filter((s) => s.active).length}편 · 출제 가능 문항 {activeQuizCount}개{c.has_quiz && activeQuizCount < 5 ? " — 목표 5개" : ""}{!c.has_quiz ? " (퀴즈 없음, 소원 쓰기)" : ""}</p>

    {stories.map((s) => (
      <div key={s.id} className="card" style={{ opacity: s.active ? 1 : 0.55 }}>
        <p style={{ margin: 0 }}><b>{s.title}</b>{s.active ? "" : " (비활성)"} <span className="muted">#{s.id} · 순서 {s.sort}</span></p>
        <p className="muted" style={{ whiteSpace: "pre-wrap", maxHeight: 72, overflow: "hidden" }}>{s.body}</p>
        <button className="btn secondary" style={small} onClick={() => { setStory(s); setQuiz(null); }}>스토리 수정</button>
        {c.has_quiz ? <button className="btn secondary" style={small} onClick={() => { setQuiz({ story_id: s.id, choices: ["", ""], answer_idx: 0, active: true }); setStory(null); }}>+ 이 스토리 퀴즈</button> : null}
        {quizzesOf(s.id).map((q) => (
          <div key={q.id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0", opacity: q.active ? 1 : 0.55 }}>
            <div>Q{q.id}. {q.question}{q.active ? "" : " (비활성)"}</div>
            <div className="muted">{q.choices.map((ch, i) => (i === q.answer_idx ? `✔ ${ch}` : ch)).join(" / ")} · 출제 {q.asked}회{q.asked ? `, 정답률 ${Math.round((q.correct / q.asked) * 100)}%` : ""}</div>
            <button className="btn secondary" style={small} onClick={() => { setQuiz(q); setStory(null); }}>수정</button>
            <button className="btn secondary" style={small} onClick={() => post({ action: "quiz", ...q, active: !q.active }, q.active ? "문항을 비활성화했어요" : "문항을 활성화했어요")}>{q.active ? "비활성" : "활성"}</button>
          </div>))}
      </div>))}
    <button className="btn secondary" onClick={() => { setStory({ color, sort: stories.length + 1, active: true }); setQuiz(null); }}>+ 새 스토리</button>

    {story ? (
      <div className="card" style={{ borderColor: "#888" }}>
        <h2 style={{ marginTop: 0 }}>{story.id ? `스토리 #${story.id} 수정` : "새 스토리"} — {c.name}</h2>
        <input style={inp} placeholder="제목" value={story.title ?? ""} onChange={(e) => setStory({ ...story, title: e.target.value })} />
        <textarea style={{ ...inp, minHeight: 160, marginTop: 6 }} placeholder="본문 (참가자가 읽고 퀴즈에 답할 수 있어야 함, 체류 10~20초 분량)" value={story.body ?? ""} onChange={(e) => setStory({ ...story, body: e.target.value })} />
        <input style={{ ...inp, marginTop: 6 }} placeholder="이미지 URL (선택, 200KB 이하 WebP 권장)" value={story.image_url ?? ""} onChange={(e) => setStory({ ...story, image_url: e.target.value })} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <label>순서 <input type="number" style={{ ...inp, width: 70 }} value={story.sort ?? 0} onChange={(e) => setStory({ ...story, sort: Number(e.target.value) })} /></label>
          <label><input type="checkbox" checked={story.active !== false} onChange={(e) => setStory({ ...story, active: e.target.checked })} /> 활성</label>
        </div>
        <button className="btn" onClick={() => post({ action: "story", ...story, color }, "스토리 저장됨")}>저장</button>
        <button className="btn secondary" onClick={() => setStory(null)}>취소</button>
      </div>) : null}

    {quiz ? (
      <div className="card" style={{ borderColor: "#888" }}>
        <h2 style={{ marginTop: 0 }}>{quiz.id ? `문항 Q${quiz.id} 수정` : "새 문항"} — {stories.find((s) => s.id === quiz.story_id)?.title}</h2>
        <textarea style={{ ...inp, minHeight: 60 }} placeholder="문항 (스토리를 읽으면 풀 수 있는 난이도, 정답률 80% 목표)" value={quiz.question ?? ""} onChange={(e) => setQuiz({ ...quiz, question: e.target.value })} />
        {(quiz.choices ?? []).map((ch, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
            <input type="radio" name="ans" checked={quiz.answer_idx === i} onChange={() => setQuiz({ ...quiz, answer_idx: i })} title="정답" />
            <input style={inp} placeholder={`보기 ${i + 1}`} value={ch} onChange={(e) => setQuiz({ ...quiz, choices: quiz.choices!.map((x, k) => (k === i ? e.target.value : x)) })} />
            {quiz.choices!.length > 2 ? <button className="btn secondary" style={{ ...small, margin: 0 }} onClick={() => setQuiz({ ...quiz, choices: quiz.choices!.filter((_, k) => k !== i), answer_idx: Math.min(quiz.answer_idx ?? 0, quiz.choices!.length - 2) })}>×</button> : null}
          </div>))}
        <p className="muted">라디오 = 정답. O/X는 보기 2개, 최대 4개.</p>
        {(quiz.choices?.length ?? 0) < 4 ? <button className="btn secondary" style={small} onClick={() => setQuiz({ ...quiz, choices: [...(quiz.choices ?? []), ""] })}>+ 보기</button> : null}
        <label style={{ display: "block", marginTop: 6 }}><input type="checkbox" checked={quiz.active !== false} onChange={(e) => setQuiz({ ...quiz, active: e.target.checked })} /> 활성 (출제 대상)</label>
        <button className="btn" onClick={() => post({ action: "quiz", ...quiz }, "문항 저장됨")}>저장</button>
        <button className="btn secondary" onClick={() => setQuiz(null)}>취소</button>
      </div>) : null}
  </>);
}

"use client";
import { useEffect, useState } from "react";
import { isMuted, setMuted } from "@/lib/sfx";

// 연출 화면 오른쪽 위 🔈 — 소리 켜기/끄기 (그 폰에 기억). 진동은 별도 설정 없이 기본 켜짐
export default function SoundToggle() {
  const [m, setM] = useState(false);
  useEffect(() => { setM(isMuted()); }, []);
  return (
    <button onClick={(e) => { e.stopPropagation(); setMuted(!m); setM(!m); }} aria-label={m ? "소리 켜기" : "소리 끄기"}
      style={{ position: "absolute", top: 14, right: 14, zIndex: 5, background: "rgba(255,255,255,.12)", color: "#F5F1E6", border: "1px solid rgba(255,255,255,.25)",
        borderRadius: 20, padding: "6px 12px", fontSize: 15 }}>{m ? "🔇 소리 꺼짐" : "🔈 소리 켜짐"}</button>
  );
}

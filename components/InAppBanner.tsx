"use client";
import { useEffect, useState } from "react";

// F-3-7: 네이버앱·카카오톡 등 인앱 브라우저 감지 → 기본 브라우저 유도 (쿠키 분리로 세션이 갈라지는 사고 예방)
export default function InAppBanner() {
  const [kind, setKind] = useState<null | "kakao" | "naver" | "other">(null);
  const [android, setAndroid] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setAndroid(/Android/i.test(ua));
    if (/KAKAOTALK/i.test(ua)) setKind("kakao");
    else if (/NAVER\(inapp/i.test(ua)) setKind("naver");
    else if (/FBAN|FBAV|Instagram|Line\//i.test(ua)) setKind("other");
  }, []);
  if (!kind) return null;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const openExternal = () => {
    if (kind === "kakao") { window.location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(url); return; }
    if (android) { window.location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end"; return; }
    navigator.clipboard?.writeText(url);
    alert("주소를 복사했어요. 사파리(또는 크롬)에 붙여 넣어 열어 주세요.");
  };
  return (
    <div className="banner">
      별찾기는 <b>사파리·크롬(기본 브라우저)</b>에서 해야 별이 끊기지 않고 이어져요.
      <button className="btn secondary" style={{ padding: 10, fontSize: 15, margin: "8px 0 0" }} onClick={openExternal}>기본 브라우저로 열기</button>
      <div className="muted" style={{ marginTop: 6 }}>이미 별을 모으던 중이라면 열린 뒤 <b>참여번호로 이어서 하기</b>를 눌러 주세요.</div>
    </div>
  );
}

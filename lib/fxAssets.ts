// 연출용 그림 (2026-10-15). 그림이 준비되면 경로를 넣는다 — null이면 코드(SVG)로 그린 그림을 쓴다
//   파일 위치: web/public/fx/  (사용자가 챗GPT로 만든 그림을 webp로 변환해 넣음)
export const FX: { gate: string | null; starSleep: string | null; sky: string | null; motif: Record<string, string | null> } = {
  gate: "/fx/gate.webp",        //       닫힌 대문 (가운데 세로선이 정확히 문틈)
  starSleep: "/fx/star-sleep.webp",   // 잠든 은빛 별 (투명 배경)
  sky: "/fx/sky.webp",         //        별자리 밤하늘 (출구·별 화면 배경)
  motif: { yellow: "/fx/m-yellow.webp", red: "/fx/m-red.webp", white: "/fx/m-white.webp", teal: "/fx/m-teal.webp", orange: "/fx/m-orange.webp" },   // 2026-10-15 사용자 제작 그림 반영   // /fx/m-<색>.webp 색별 장면 (투명 배경)
};

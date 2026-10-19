import type { NextConfig } from "next";

// 전 응답 캐시 금지 (F-6 / Phase 6) — 태그·세션 상태는 절대 캐시되면 안 됨
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // 배포마다 바뀌는 값 — 그림 주소 뒤 ?v= 에 붙여, 같은 이름으로 덮어쓴 그림이 캐시에 남지 않게 (2026-10-18)
  env: { NEXT_PUBLIC_ASSET_VER: (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 10) },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ] }];
  },
};
export default nextConfig;

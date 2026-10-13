import type { NextConfig } from "next";

// 전 응답 캐시 금지 (F-6 / Phase 6) — 태그·세션 상태는 절대 캐시되면 안 됨
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
    ] }];
  },
};
export default nextConfig;

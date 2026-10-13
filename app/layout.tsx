import type { Metadata, Viewport } from "next";
import "./globals.css";
import InAppBanner from "@/components/InAppBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_BASE_URL || "https://goldfinder.mytourinfo.kr"),
  title: "영남루에 흩어진 별을 찾아라",
  description: "영남루 별빛정원 별찾기 — 10월 주말 저녁, 영남루 별빛정원",
  robots: { index: false, follow: false },
  openGraph: { title: "영남루에 흩어진 별을 찾아라", description: "5가지 별을 모두 깨우면 뽑기권! 영남루 별빛정원",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }], type: "website", locale: "ko_KR" },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <main className="wrap">
          <InAppBanner />
          {children}
          <footer style={{ textAlign: "center", opacity: 0.55, fontSize: 12, padding: "20px 0 10px" }}>주최 밀양시</footer>
        </main>
      </body>
    </html>
  );
}

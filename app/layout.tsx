import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXTORA | Portfolio",
  description: "ポートフォリオサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable} antialiased`}>
        {children}
      </body>
      <GoogleAnalytics gaId="G-SCR8CXXQVR" />
    </html>
  );
}

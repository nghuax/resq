import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono, Syne } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ResQ | Cứu hộ giao thông và sửa xe lưu động",
  description:
    "ResQ là nền tảng cứu hộ giao thông và sửa xe lưu động ưu tiên người dùng tại Việt Nam.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${syne.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--sand-100)] text-[var(--ink-900)]">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_42%)]" />
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

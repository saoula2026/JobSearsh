import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Job Search Command Center — Track Applications & Discover Jobs",
    template: "%s | Job Search Command Center",
  },
  description:
    "A local-first job search tool: track your applications through a visual Kanban pipeline and discover live remote openings across multiple global boards. No account required.",
  openGraph: {
    title: "Job Search Command Center",
    description:
      "Track job applications + discover live remote openings from multiple boards. Local-first, no account needed.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

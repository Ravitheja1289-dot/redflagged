import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from 'sonner';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RedFlaggers",
  description: "Recognize the red flags. Anonymous experiences of harassment, abuse, assault, stalking, and unsafe behavior — shared to help others recognize patterns.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <LoadingScreen />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-soft-border py-12 mt-auto bg-surface">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-secondary">
            <div className="font-medium text-foreground"><span className="text-[#E53935]">Red</span>Flaggers</div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/" className="link-hover">Explore</Link>
              <Link href="/about" className="link-hover">About</Link>
              <Link href="/safety" className="link-hover">Safety</Link>
              <Link href="/submit" className="link-hover">Share anonymously</Link>
            </div>
            <div className="flex gap-4">
              <Link href="/about" className="link-hover">Privacy</Link>
              <Link href="/about" className="link-hover">Terms</Link>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-8 text-center text-xs text-secondary">
            Built by <a href="https://ravi1289portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">Ravi</a>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors theme="light" />
      </body>
    </html>
  );
}

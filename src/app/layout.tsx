import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RedFlaggers",
  description: "Recognize the red flags. Anonymous experiences of harassment, abuse, assault, stalking, and unsafe behavior — shared to help others recognize patterns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-soft-border bg-surface/80 backdrop-blur animate-fade-in will-change-[opacity]">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-accent link-hover">RedFlaggers</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/reports" className="text-secondary hover:text-foreground link-hover">Explore</Link>
              <Link href="/about" className="text-secondary hover:text-foreground link-hover">How it works</Link>
              <Link href="/safety" className="text-secondary hover:text-foreground link-hover">Safety</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/submit" className="text-sm font-medium bg-accent text-surface px-4 py-2 rounded-full hover:bg-accent/90 btn-interaction">
                Share anonymously
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-soft-border py-12 mt-auto bg-surface">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-secondary">
            <div className="font-medium text-foreground">RedFlaggers</div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/reports" className="link-hover">Explore</Link>
              <Link href="/about" className="link-hover">About</Link>
              <Link href="/safety" className="link-hover">Safety</Link>
              <Link href="/submit" className="link-hover">Share anonymously</Link>
            </div>
            <div className="flex gap-4">
              <Link href="/about" className="link-hover">Privacy</Link>
              <Link href="/about" className="link-hover">Terms</Link>
            </div>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors theme="light" />
      </body>
    </html>
  );
}

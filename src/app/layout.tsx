import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from 'sonner';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL("https://redflaggers.vercel.app"),
  title: {
    default: "RedFlaggers — Recognize the red flags",
    template: "%s | RedFlaggers",
  },
  description:
    "Anonymous experiences. Recognizable patterns. Read, share, and recognize patterns of harassment, toxic relationships, stalking, and unsafe behavior.",
  applicationName: "RedFlaggers",
  keywords: [
    "red flags",
    "relationship red flags",
    "workplace red flags",
    "dating red flags",
    "toxic relationship patterns",
    "recognize warning signs",
    "anonymous experiences",
    "safety warnings",
  ],
  authors: [{ name: "RedFlaggers" }],
  creator: "RedFlaggers",
  publisher: "RedFlaggers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://redflaggers.vercel.app",
    siteName: "RedFlaggers",
    title: "RedFlaggers — Recognize the red flags",
    description:
      "Anonymous experiences. Recognizable patterns. Read, share, and recognize patterns of harassment, toxic relationships, and unsafe behavior.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedFlaggers — Recognize the red flags",
    description:
      "Anonymous experiences. Recognizable patterns. Read, share, and recognize patterns of harassment, toxic relationships, and unsafe behavior.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <StructuredData />
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

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full apple-blur pt-safe transition-all">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-bold text-lg sm:text-xl tracking-tight text-foreground transition-transform duration-100 ease-out active:scale-[0.97] inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#E53935]" />
            <span>
              <span className="text-[#E53935]">Red</span>Flaggers
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/safety"
            className="text-xs font-medium text-secondary hover:text-foreground px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            Safety
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] active:scale-95 border border-white/[0.1] text-xs font-semibold text-foreground transition-all duration-100 shadow-sm shadow-black/20"
            aria-label="Share experience anonymously"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#E53935]"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Share</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full apple-blur border-b border-soft-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xl tracking-tight text-foreground transition-transform duration-120 ease-out active:scale-[0.97] inline-block">
            <span className="text-[#E53935]">Red</span>Flaggers
          </Link>
        </div>
        
        <Link 
          href="/submit" 
          className="p-1.5 -mr-1 text-foreground hover:bg-white/[0.06] rounded-xl transition-all duration-120 ease-out active:scale-90 flex items-center justify-center cursor-pointer"
          aria-label="New Post"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </Link>
      </div>
    </header>
  );
}

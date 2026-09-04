"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlay, wrapper]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 md:p-12 overflow-y-auto animate-fade-in will-change-[opacity]"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="flex min-h-full items-center justify-center"
      >
        <div className="relative w-full max-w-[1100px] bg-surface rounded-3xl overflow-hidden shadow-2xl animate-scale-in will-change-[opacity,transform]">
          <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface/80 hover:bg-surface backdrop-blur border border-soft-border rounded-full flex items-center justify-center text-secondary hover:text-foreground transition-colors btn-interaction"
            aria-label="Close modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      ref={overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-4 md:p-12 overflow-y-auto"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="flex min-h-full items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 320,
            mass: 0.85
          }}
          className="relative w-full max-w-[1100px] bg-surface rounded-3xl overflow-hidden shadow-2xl border border-soft-border"
        >
          <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface/80 hover:bg-surface backdrop-blur-lg border border-soft-border rounded-full flex items-center justify-center text-secondary hover:text-foreground transition-all duration-150 active:scale-90 cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
